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
from .models import Job, Resume, ExtractedInfo, ResumeScore
from .config import RESUME_FOLDER, ARCHIVE_FOLDER, client, MODEL_NAME
from .prompts.resume_prompts import extract_resume_prompt, evaluate_resume_prompt, user_prompt_resume_evaluation


ats_bp = Blueprint('ats', __name__)


@ats_bp.route('/extracted_info', methods=['GET'])
def get_extracted_info():
    """
    Fetch details from the ExtractedInfo table based on candidate name and job ID.
    """
    candidate_name = request.args.get('candidate_name')
    job_id = request.args.get('job_id')

    if not candidate_name or not job_id:
        return jsonify({'error': 'Candidate name and job ID are required in the query parameters'}), 400

    extracted_info = ExtractedInfo.query.filter(
        ExtractedInfo.job_id == job_id,
        ExtractedInfo.resume_id.ilike(candidate_name)
    ).first()

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
        path = os.path.join(RESUME_FOLDER, role)
        file_path = os.path.join(path, filename)
        reader = PdfReader(file_path)
        text_resume = f"Text extracted from: {filename}\n"
        for page in reader.pages:
            text_resume += page.extract_text()
            text_resume += "\n"
        text_resume += "\n---\n"
        return text_resume


def extract_resume_info(app, job_id, role, resume_list):
    """
    Extract information from resumes and save it to the database.
    """
    with app.app_context():
        for filename in resume_list:
            if filename.endswith(".pdf"):
                text_resume = extract_text_from_resume(app, role, filename)

                message_resumefetch = [
                    {"role": "system", "content": extract_resume_prompt},
                    {"role": "user", "content": (
                        f"use the {text_resume} resume to details which are stated like name (get full name with initial if it is there), "
                        f"work experience, phone number, address, email id, LinkedIn id and GitHub id. Fetch all the technical skills and "
                        f"soft skills separately don't mix it from the resume {text_resume} and give the details as per instructed. If years "
                        f"of experience are not explicitly mentioned in the {text_resume}, calculate the total years of experience based on the "
                        f"dates provided in the candidate's employment history and use it for work_exp"
                    )}
                ]

                client = OpenAI()
                client.api_key = os.getenv("OPENAI_API_KEY")
                response = client.chat.completions.create(
                    model=MODEL_NAME,
                    messages=message_resumefetch,
                    max_tokens=1000
                )

                response = dict(response)
                response_data = dict(dict(response['choices'][0])['message'])[
                    'content'].replace("\n", " ")
                response_data = ' '.join(response_data.split())
                response_data = response_data.strip().strip('```json').strip().strip('```')

                extracted_info = json.loads(response_data)

                try:
                    for resume_detail in extracted_info['resume_details']:
                        extracted_record = ExtractedInfo(
                            job_id=job_id,
                            resume_id=resume_detail['candidate_name'],
                            name=resume_detail.get('candidate_name', 'NIL'),
                            total_experience=resume_detail.get(
                                'work_exp', 'NIL'),
                            phone_number=resume_detail.get(
                                'phone_number', 'NIL'),
                            email_id=resume_detail.get('email_id', 'NIL'),
                            address=resume_detail.get('address', 'NIL'),
                            linkedin_id=resume_detail.get(
                                'linkedin_id', 'NIL'),
                            github_id=resume_detail.get('github_id', 'NIL'),
                            nationality=resume_detail.get(
                                'nationality', 'NIL'),
                            tech_skill=resume_detail.get(
                                'technical_skills', []),
                            behaviour_skill=resume_detail.get(
                                'soft_skills', []),
                            date_of_birth=resume_detail.get(
                                'date_of_birth', 'NIL')
                        )
                        db.session.add(extracted_record)
                    db.session.commit()
                except Exception as e:
                    pass


def chatgpt_message(app, jd, job_role, text_resume, mandatory_skills):
    """
    Send a message to ChatGPT to evaluate resumes based on job description and mandatory skills.
    """
    with app.app_context():
        messages = [
            {"role": 'system', "content": evaluate_resume_prompt},
            {"role": "user", "content": user_prompt_resume_evaluation.format(
                text_resume=text_resume, job_role=job_role, jd=jd, mandatory_skills=mandatory_skills
            )}
        ]

        client = OpenAI()
        client.api_key = os.getenv("OPENAI_API_KEY")
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            temperature=0,
            max_tokens=1000,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0
        )

        response = dict(response)
        response_data = dict(dict(response['choices'][0])['message'])[
            'content'].replace("\n", " ")
        return response_data


def calculate_resume_scores(app, job_id, mandatory_skills, resume_list):
    """
    Calculate scores for resumes based on job description and mandatory skills.
    """
    with app.app_context():
        job = Job.query.filter_by(id=job_id).first()

        if not job:
            return jsonify({'error': 'Job not found.'}), 404

        jd = job.jd
        role = job.role
        scores = []

        for filename in resume_list:
            text_resume = extract_text_from_resume(app, role, filename)
            AI_score_response = chatgpt_message(
                app, jd, role, text_resume, mandatory_skills)
            AI_score_response_dict = json.loads(AI_score_response)

            for resume_info in AI_score_response_dict['score']:
                resume_filename = resume_info['resume_filename']
                jd_match = resume_info['JD_MATCH']
                match_status = resume_info['MATCH_STATUS']
                matching_skills = resume_info['Matching_Skills']
                missing_skills = resume_info['Missing_Skills']
                candidate_name = resume_info['candidate_name']
                experience_match = resume_info['experience_match']

                new_score = ResumeScore(
                    resume_filename=resume_filename,
                    name=candidate_name,
                    job_id=job_id,
                    jd_match=jd_match,
                    match_status=match_status,
                    matching_skills=matching_skills,
                    missing_skills=missing_skills,
                    experience_match=experience_match
                )
                db.session.add(new_score)

                scores.append({
                    "resume_filename": resume_filename,
                    "candidate_name": candidate_name,
                    "JD_MATCH": jd_match,
                    "MATCH_STATUS": match_status,
                    "Matching_Skills": matching_skills,
                    "Missing_Skills": missing_skills,
                    "role": role,
                    "jd": jd,
                    "experience_match": experience_match
                })

            db.session.commit()

        return jsonify({'scores': scores}), 200


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

        resume_list = []
        for resume_file in uploaded_files:
            if resume_file.filename == '':
                return jsonify({'message': 'No selected file'}), 400

            resume_filename = secure_filename(resume_file.filename)
            resume_path = os.path.join(folder_path, resume_filename)
            resume_file.save(resume_path)
            resume_list.append(resume_filename)

            job = Job.query.filter_by(role=role, id=job_id).first()
            if not job:
                return jsonify({'message': 'Specified job role or description does not exist.'}), 400

            new_resume = Resume(filename=resume_filename, job_id=job.id)
            db.session.add(new_resume)
            db.session.commit()

        app = current_app._get_current_object()
        extract_thread = Thread(target=extract_resume_info, args=(
            app, job.id, role, resume_list))
        extract_thread.start()

        score_thread = Thread(target=calculate_resume_scores, args=(
            app, job.id, mandatory_skills, resume_list))
        score_thread.start()

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

    query = ResumeScore.query.filter_by(job_id=job_id)

    if sort_by in ['status', 'jd_match']:
        if sort_order == 'desc':
            query = query.order_by(getattr(ResumeScore, sort_by).desc())
        else:
            query = query.order_by(getattr(ResumeScore, sort_by).asc())

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    resume_scores = pagination.items

    scores_list = [{
        "resume_filename": score.resume_filename,
        "candidate_name": score.name,
        "JD_MATCH": score.jd_match,
        "MATCH_STATUS": score.match_status,
        "Matching_Skills": score.matching_skills,
        "Missing_Skills": score.missing_skills,
        "selected_status": score.selected_status,
        "assessment_status": score.assessment_status,
        "experience_match": score.experience_match,
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
    Delete a resume and associated data based on the candidate name and job ID.
    """
    candidate_name = request.args.get('candidate_name')
    job_id = request.args.get('job_id')

    if not candidate_name or not job_id:
        return jsonify({'error': 'Candidate name and job ID are required parameters.'}), 400

    job = Job.query.filter_by(id=job_id).first()
    role = job.role if job else None

    try:
        num_deleted_info = ExtractedInfo.query.filter(
            func.lower(ExtractedInfo.name) == func.lower(candidate_name),
            ExtractedInfo.job_id == job_id
        ).delete()

        resume_scores = ResumeScore.query.filter(
            func.lower(ResumeScore.name) == func.lower(candidate_name),
            ResumeScore.job_id == job_id
        ).all()

        for score in resume_scores:
            resume = Resume.query.filter_by(
                filename=score.resume_filename, job_id=job_id
            ).first()
            if resume:
                archive_role_folder = os.path.join(ARCHIVE_FOLDER, role)
                if not os.path.exists(archive_role_folder):
                    os.makedirs(archive_role_folder)
                timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
                new_filename = f"{resume.filename}_{timestamp}.pdf"
                file_to_archive_path = os.path.join(
                    archive_role_folder, new_filename)
                shutil.move(os.path.join(RESUME_FOLDER, role,
                            resume.filename), file_to_archive_path)
                db.session.delete(resume)

            db.session.delete(score)

        db.session.commit()
        return jsonify({'message': f'Resume deleted successfully. {num_deleted_info} records deleted from ExtractedInfo table.'}), 200

    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'IntegrityError: Database constraint violation.'}), 500

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@ats_bp.route('/update_resume_status', methods=['POST'])
def update_resume_status():
    data = request.get_json()
    name = data.get('name')
    status = data.get('status')  # 'True' or 'False'

    if name is None or status is None:
        return jsonify({'error': 'Candidate name and status are required fields.'}), 400

    status_bool = status.lower() == 'true'

    resume_score = ResumeScore.query.filter(
        func.lower(ResumeScore.name) == func.lower(name)).first()
    if resume_score is None:
        return jsonify({'error': 'Resume score record not found.'}), 404

    resume_score.selected_status = status_bool
    db.session.commit()

    return jsonify({'message': f'Resume status updated to {status_bool} for candidate {name}.'}), 200
