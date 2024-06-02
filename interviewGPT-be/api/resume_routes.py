import time
import re
from functools import wraps
import os
import json
import shutil
from . import db
from openai import OpenAI
from sqlalchemy import func
from PyPDF2 import PdfReader
from threading import Thread
from datetime import datetime
from sqlalchemy.exc import IntegrityError
from werkzeug.utils import secure_filename
from flask import Blueprint, request, jsonify, current_app
from api.middleware import retry
from .models import Job, Resume, ExtractedInfo, ResumeScore, Candidate
from .config import RESUME_FOLDER, ARCHIVE_FOLDER, MODEL_NAME
from .prompts.resume_prompts import extract_resume_prompt, evaluate_task_prompt, user_prompt_evaluation
# from .agents_resume import create_agents
import time

ats_bp = Blueprint('ats', __name__)


@ats_bp.route('/extracted_info', methods=['GET'])
def get_extracted_info():
    """
    Fetch details from the ExtractedInfo table based on Resume ID.
    """

    resume_id = request.args.get('resume_id')
    if not resume_id:
        return jsonify({'error': 'Resume ID are required in the query parameters'}), 400

    # Query to fetch ExtractedInfo based on resume_id
    extracted_info = ExtractedInfo.query.filter(
        ExtractedInfo.resume_id.ilike(resume_id)
    ).first()

    if not extracted_info:
        return jsonify({'error': 'No extracted information found for the provided resume ID.'}), 404

    if extracted_info:
        extracted_info_details = {
            'candidate_name': extracted_info.name,
            'total_experience': extracted_info.total_experience,
            'phone_number': extracted_info.phone_number,
            'email_id': extracted_info.email_id,
            'address': extracted_info.address,
            'linkedin_id': extracted_info.linkedin_id,
            'github_id': extracted_info.github_id,
            'nationality': extracted_info.nationality,
            'tech_skills': extracted_info.tech_skill,
            'behaviour_skills': extracted_info.behaviour_skill,
            'date_of_birth': extracted_info.date_of_birth
        }
        return jsonify({'extracted_info_details': extracted_info_details}), 200
    else:
        return jsonify({'error': 'Extracted info not found for the provided candidate name and job ID'}), 404


@ats_bp.route('/search_jobs', methods=['GET'])
def search_jobs():
    job_id = request.args.get('job_id')

    job = Job.query.get(job_id)
    if job:
        job_details = {
            'job_id': job.id,
            'role': job.role,
            'jd': job.jd
        }
        return jsonify({'job_details': job_details}), 200
    else:
        return jsonify({'error': 'Job not found'}), 404


def extract_text_from_resume(app, role, filename):
    """
    Extract text content from a resume PDF.
    """
    with app.app_context():
        file_path = os.path.join(RESUME_FOLDER, role, filename)
        reader = PdfReader(file_path)
        return "\n".join([page.extract_text() for page in reader.pages])


def chatgpt_message(app, jd, job_role, skill_set, total_experience):
    """
    Send a message to ChatGPT to evaluate skill sets based on job description and mandatory skills.
    """
    with app.app_context():
        messages = [
            {"role": 'system', "content": evaluate_task_prompt},
            {"role": "user", "content": user_prompt_evaluation.format(
                skill_set=skill_set, job_role=job_role, jd=jd, total_experience=total_experience
            )}
        ]

        client = OpenAI()
        client.api_key = os.getenv("OPENAI_API_KEY")
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            temperature=0,
            max_tokens=1000
        )

        response = dict(response)
        response_data = dict(dict(response['choices'][0])['message'])[
            'content'].replace("\n", " ")
        return response_data


def create_extracted_info(extracted_info, resume_id):
    """
    Save extracted information to the database.
    """
    existing_info = ExtractedInfo.query.filter_by(
        resume_id=resume_id).first()
    if not existing_info:
        extracted_record = ExtractedInfo(
            resume_id=resume_id,
            name=extracted_info.get('candidate_name'),
            total_experience=extracted_info.get('work_exp'),
            phone_number=extracted_info.get('phone_number'),
            email_id=extracted_info.get('email_id'),
            address=extracted_info.get('address'),
            linkedin_id=extracted_info.get('linkedin_id'),
            github_id=extracted_info.get('github_id'),
            nationality=extracted_info.get('nationality'),
            tech_skill=extracted_info.get('technical_skills'),
            behaviour_skill=extracted_info.get('soft_skills'),
            date_of_birth=extracted_info.get('date_of_birth')
        )
        db.session.add(extracted_record)
    db.session.commit()


def extract_details_from_resume(text_resume):
    """
    Extract details from the resume text using OpenAI API.
    """
    extract_candidate_info = [
        {"role": "system", "content": extract_resume_prompt},
        {"role": "user", "content": (
            f"use the {text_resume} resume to extract details such as name, work experience, phone number, address, email id, LinkedIn id, and GitHub id. "
            "Fetch all the technical skills and soft skills separately and give the details as per instructed. If years of experience are not explicitly mentioned, calculate the total years of experience based on the dates provided in the candidate's employment history and use it for work_exp"
        )}
    ]

    client = OpenAI()
    client.api_key = os.getenv("OPENAI_API_KEY")
    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=extract_candidate_info,
        max_tokens=1000
    )
    res = {}
    response = dict(response)
    response_data = dict(dict(response['choices'][0])['message'])[
        'content'].replace("\n", " ")
    response_data = ' '.join(response_data.split())
    response_data = response_data.strip().strip('```json').strip().strip('```')

    return response_data


@ retry(max_retries=2, delay=2)
def process_resumes(app, job_id, role, resume_list):
    """
    Extract information from resumes, save it to the database, and calculate resume scores.
    """
    with app.app_context():
        job = Job.query.filter_by(id=job_id).first()
        if not job:
            return jsonify({'error': 'Job not found.'}), 404

        any_errors = False  # Flag to track if any errors occurred

        for resume_id, filename in resume_list:
            try:
                if filename.endswith(".pdf"):
                    text_resume = extract_text_from_resume(app, role, filename)
                    print(f"Extracted text from resume:")

                    resume_record = Resume.query.get(resume_id)
                    if resume_record:
                        resume_id = resume_record.id

                    existing_info = ExtractedInfo.query.filter_by(
                        resume_id=resume_id).first()
                    if not existing_info:
                        response_data = extract_details_from_resume(
                            text_resume)
                        print(
                            f"Extracted details from resume text: {response_data}")

                        if response_data:
                            extracted_info = json.loads(response_data)
                            candidate_name = extracted_info.get(
                                'candidate_name')

                            existing_candidate = Candidate.query.filter_by(
                                name=candidate_name, job_id=job_id, resume_id=resume_id).first()
                            if not existing_candidate:
                                new_candidate = Candidate(
                                    name=candidate_name, job_id=job_id, resume_id=resume_id)
                                db.session.add(new_candidate)
                                db.session.commit()
                            print(
                                f"Saved candidate info to the database for: {candidate_name}")

                            create_extracted_info(extracted_info, resume_id)
                            print(
                                f"Created extracted info for resume ID: {resume_id}")

                    resume_score = ResumeScore.query.filter_by(
                        resume_id=resume_id, isfilled=False).first()

                    if resume_score:
                        existing_info = ExtractedInfo.query.filter_by(
                            resume_id=resume_id).first()
                        skill_set = existing_info.tech_skill
                        total_experience = existing_info.total_experience

                        print("Skill set -> ", skill_set)
                        AI_score_response = chatgpt_message(
                            app, job.jd, job.role, str(skill_set), str(total_experience))
                        print(
                            f"Received AI score response: {AI_score_response}")

                        if AI_score_response:
                            AI_score_response_dict = json.loads(
                                AI_score_response)
                            print(
                                f"AI score response JSON parsed: {AI_score_response_dict}")

                            resume_info = AI_score_response_dict
                            resume_score.resume_filename = filename
                            resume_score.name = existing_info.name
                            resume_score.jd_match = resume_info.get(
                                'JD_MATCH', None)
                            resume_score.match_status = resume_info.get(
                                'MATCH_STATUS', None)
                            resume_score.matching_skills = resume_info.get(
                                'Matching_Skills', None)
                            resume_score.missing_skills = resume_info.get(
                                'Missing_Skills', None)
                            resume_score.experience_match = resume_info.get(
                                'experience_match', None)
                            resume_score.candidate_experience = resume_info.get(
                                'candidate_experience', None)
                            resume_score.required_experience = resume_info.get(
                                'required_experience', None)
                            resume_score.isfilled = True
                            db.session.commit()
                            print(
                                f"Updated resume score for resume ID: {resume_id}")
            except Exception as e:
                # Log the error and set the error flag
                print(f"Error processing resume {filename}: {e}")
                any_errors = True
                continue

        if any_errors:
            # Raise an exception if any errors occurred during the loop
            raise Exception(
                "Errors occurred during resume processing. Retrying...")


@ats_bp.route('/upload_resume_to_job', methods=['POST'])
def upload_resume_to_job():
    """
    Upload resumes to a job and start processing for information extraction and scoring.
    """
    data = request.form
    role = data.get('role')
    job_id = data.get('id')
    mandatory_skills = data.get('mandatory_skills')
    MAX_FILES = 5

    if not role or not job_id:
        return jsonify({'message': 'Role and JD are required fields.'}), 400

    folder_path = os.path.join(RESUME_FOLDER, role)
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)

    try:
        uploaded_files = request.files.getlist('resume')
        if len(uploaded_files) > MAX_FILES:
            return jsonify({'message': f'Exceeded maximum number of files ({MAX_FILES}) allowed for upload.'}), 400

        job = Job.query.filter_by(role=role, id=job_id).first()
        if not job:
            return jsonify({'message': 'Specified job role or description does not exist.'}), 400

        resume_list = []

        for resume_file in uploaded_files:
            if resume_file.filename == '':
                return jsonify({'message': 'No selected file'}), 400

            resume_filename = secure_filename(resume_file.filename)
            resume_path = os.path.join(folder_path, resume_filename)
            resume_file.save(resume_path)

            new_resume = Resume(filename=resume_filename, job_id=job.id)
            db.session.add(new_resume)
            db.session.commit()

            resume_list.append((new_resume.id, resume_filename))

            resume_score = ResumeScore(
                resume_id=new_resume.id, name="Fetching Details")
            db.session.add(resume_score)
            db.session.commit()
        print("thread is called")
        app = current_app._get_current_object()
        processing_thread = Thread(target=process_resumes, args=(
            app, job.id, role, resume_list))
        processing_thread.start()

        return jsonify({'message': 'Resumes uploaded successfully and processing started.'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@ats_bp.route('/get_resume_scores', methods=['GET'])
def get_resume_scores():
    """
    Retrieve resume scores for a specific job based on the provided job ID.
    Supports pagination and optional sorting by status and JD_MATCH.
    """
    job_id = request.args.get('job_id')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    sort_by = request.args.get('sort_by', 'status')
    sort_order = request.args.get('sort_order', 'asc')

    if not job_id:
        return jsonify({'error': 'Job ID is a required parameter.'}), 400

    # Query to fetch ResumeScore based on job_id
    query = db.session.query(ResumeScore).join(
        Resume).filter(Resume.job_id == job_id)

    if sort_by in ['status', 'jd_match']:
        if sort_order == 'desc':
            query = query.order_by(getattr(ResumeScore, sort_by).desc())
        else:
            query = query.order_by(getattr(ResumeScore, sort_by).asc())

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    resume_scores = pagination.items

    scores_list = [{
        "resume_id": score.resume_id,
        "resume_filename": score.resume_filename,
        "candidate_name": score.name,
        "JD_MATCH": score.jd_match,
        "MATCH_STATUS": score.match_status,
        "Matching_Skills": score.matching_skills,
        "Missing_Skills": score.missing_skills,
        "selected_status": score.selected_status,
        "assessment_status": score.assessment_status,
        "experience_match": score.experience_match,
        # "candidate_experience": score.candidate_experience,
        # "required_experience": score.required_experience,
        "status": score.status
    } for score in resume_scores]

    return jsonify({
        'resume_scores': scores_list,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': pagination.page,
        'per_page': pagination.per_page
    }), 200


@ats_bp.route('/delete_resume', methods=['GET'])
def delete_resume():
    """
    Delete a resume and associated data based on the resume ID.
    """
    resume_id = request.args.get('resume_id')

    if not resume_id:
        return jsonify({'error': 'Resume ID is a required parameter.'}), 400

    resume = Resume.query.filter_by(id=resume_id).first()
    if not resume:
        return jsonify({'error': 'No resume found for the provided resume ID.'}), 404

    role = resume.job.role if resume.job else None

    try:
        # Archive the resume file
        archive_role_folder = os.path.join(ARCHIVE_FOLDER, role)
        if not os.path.exists(archive_role_folder):
            os.makedirs(archive_role_folder)
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        new_filename = f"{resume.filename}_{timestamp}.pdf"
        file_to_archive_path = os.path.join(archive_role_folder, new_filename)
        shutil.move(os.path.join(RESUME_FOLDER, role,
                    resume.filename), file_to_archive_path)

        # Delete the resume record
        db.session.delete(resume)
        db.session.commit()

        return jsonify({'message': 'Resume and associated data deleted successfully.'}), 200

    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'IntegrityError: Database constraint violation.'}), 500

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@ats_bp.route('/update_resume_status', methods=['POST'])
def update_resume_status():
    data = request.get_json()
    resume_id = data.get('resume_id')
    status = data.get('status')  # 'True' or 'False'

    if resume_id is None or status is None:
        return jsonify({'error': 'Resume ID and status are required fields.'}), 400

    status_bool = status.lower() == 'true'

    resume_score = ResumeScore.query.filter_by(resume_id=resume_id).first()
    if resume_score is None:
        return jsonify({'error': 'Resume score record not found.'}), 404

    resume_score.selected_status = status_bool
    db.session.commit()

    return jsonify({'message': f'Resume status updated to {status_bool} for Resume ID {resume_id}.'}), 200
