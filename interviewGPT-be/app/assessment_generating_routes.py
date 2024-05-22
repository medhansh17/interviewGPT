import os
import json
from flask import Blueprint, request, jsonify, current_app
from threading import Thread
from sqlalchemy import func
from openai import OpenAI
from .models import Job, Candidate, TechnicalQuestion, BehaviouralQuestion, CodingQuestion, CandidateQuestion, AssessmentAttempt, ResumeScore, ExtractedInfo
from . import db
from .prompts import tech_question_mcq_prompt, behaviour_question_prompt, coding_question_prompt,tech_question_mcq_prompt,behaviour_question_prompt,coding_question_prompt

assessment_bp = Blueprint('assessment', __name__)

##QUESTION GENERATION 
##user defined function for each type of question 
        
def tech_question_mcq(jd13, no_tech_questions, Tech_skills):
    message = [
        {"role": "system", "content": tech_question_mcq_prompt},
        {"role": "user", "content": f"""always manadotry to Generate {no_tech_questions} technical question, the difficulty level should be medium to hard, should not be easy questions,even question should not repeat.
                important information, options sshould be too hard, so that candiate can get confuse easily with other choices.
                Questions should be entirely based on job description {jd13} and candiate technical skills found from {Tech_skills}.
                """}
    ]
    client = OpenAI()
    client.api_key = os.getenv("OPENAI_API_KEY")
    tech_response = client.chat.completions.create(
        model="gpt-4-turbo",
        messages=message,
        max_tokens=1000
    )
    print("generating tech quest")
    tech_response = dict(tech_response)
    tech_response = dict(dict(tech_response['choices'][0])['message'])[
        'content'].replace("\n", " ")
    tech_response = ' '.join(tech_response.split())
    print("done tech quest")
    return tech_response

def behaviour_questions(no_behav_questions, behav_skills):
    message = [
        {"role": "system", "content": behaviour_question_prompt},
        {"role": "user", "content": f"always manadotry to Generate {no_behav_questions} behaivour questions not more than that,and based on behaviour skills which candidate have {behav_skills}, if they dont have,give a question by your choice.ie soft skill question"}
    ]
    client = OpenAI()
    client.api_key = os.getenv("OPENAI_API_KEY")
    behav_response = client.chat.completions.create(
        model="gpt-4-turbo",
        messages=message,
        max_tokens=1000
    )
    print("generating beh quest")
    behav_response = dict(behav_response)
    behav_response = dict(dict(behav_response['choices'][0])['message'])[
        'content'].replace("\n", " ")
    behav_response = ' '.join(behav_response.split())
    print("done beh quest")
    return behav_response

def coding_question_generate():
    message = [
        {"role": "system", "content": coding_question_prompt},
        {"role": "user", "content": "Generate coding question, questions should not repeat."}
    ]
    client = OpenAI()
    client.api_key = os.getenv("OPENAI_API_KEY")
    coding_response = client.chat.completions.create(
        model="gpt-4-turbo",
        messages=message,
        max_tokens=1000
    )
    print("generating code quest")
    coding_response = dict(coding_response)
    coding_response = dict(dict(coding_response['choices'][0])['message'])[
        'content'].replace("\n", " ")
    coding_response = ' '.join(coding_response.split())
    print("done code quest")
    return coding_response

def save_assessment_to_db(job_id, role, candidate_name, tech_questions, behaviour_questions, coding_question, version_number):
    job = Job.query.get(job_id)
    if not job:
        return jsonify({'error': 'Invalid job ID.'}), 400
    print("save assesmnet to db fucnstatred")
    candidate = Candidate.query.filter_by(name=candidate_name).first()
    if not candidate:
        version_number = 1
        candidate = Candidate(name=candidate_name, job_id=job_id, version_number=version_number)
        db.session.add(candidate)
        db.session.commit()
    else:
        candidate.version_number += 1
        db.session.commit()

    for question in tech_questions:
        tech_question = TechnicalQuestion(question_text=question['question'], options=json.dumps(question['options']), correct_answer=question['answer'], job_id=job_id, name=candidate_name, version_number=version_number)
        db.session.add(tech_question)
        db.session.commit()
        candidate_question = CandidateQuestion(candidate_id=candidate.id, question_type='technical', question_id=tech_question.id, job_id=job_id, name=candidate_name, version_number=version_number)
        db.session.add(candidate_question)

    for question in behaviour_questions:
        behav_question = BehaviouralQuestion(question_text=question['b_question_text'], job_id=job_id, name=candidate_name, version_number=version_number)
        db.session.add(behav_question)
        db.session.commit()
        candidate_question = CandidateQuestion(candidate_id=candidate.id, question_type='behavioural', question_id=behav_question.id, job_id=job_id, name=candidate_name, version_number=version_number)
        db.session.add(candidate_question)

    coding_question = CodingQuestion(question_text=coding_question['question'], sample_input=coding_question['sample_input'], sample_output=coding_question['sample_output'], job_id=job_id, name=candidate_name, version_number=version_number)
    db.session.add(coding_question)
    db.session.commit()
    candidate_question = CandidateQuestion(candidate_id=candidate.id, question_type='coding', question_id=coding_question.id, job_id=job_id, name=candidate_name, version_number=version_number)
    db.session.add(candidate_question)

    assessment_attempt = AssessmentAttempt(candidate_id=candidate.id, job_id=job_id, version_number=version_number)
    db.session.add(assessment_attempt)

    db.session.commit()
    print("asved successfully")
    return jsonify({'message': 'Assessment data saved successfully.'}), 200

def generate_and_save_assessment(app,job_id, candidate_name, no_tech_questions, no_behav_questions, resume_score_id):
    with app.app_context():
        try:
            print("entered genrate and save assessment")
            resume_score = ResumeScore.query.get(resume_score_id)
            if resume_score is None:
                raise ValueError("ResumeScore not found")

            selected_status = resume_score.selected_status
            if not selected_status:
                resume_score.status = 'candidate_rejected'
                db.session.commit()
                return

            job = Job.query.get(job_id)
            jd = job.jd
            role = job.role

            candidate_name_formatted = candidate_name.lower().replace(" ", "")
            TechnicalQuestion.query.filter(
                func.lower(func.replace(TechnicalQuestion.name, " ", "")) == candidate_name_formatted,
                TechnicalQuestion.job_id == job_id
            ).delete()
            BehaviouralQuestion.query.filter(
                func.lower(func.replace(BehaviouralQuestion.name, " ", "")) == candidate_name_formatted,
                BehaviouralQuestion.job_id == job_id
            ).delete()
            CodingQuestion.query.filter(
                func.lower(func.replace(CodingQuestion.name, " ", "")) == candidate_name_formatted,
                CodingQuestion.job_id == job_id
            ).delete()
            db.session.commit()

            candidate_info = ExtractedInfo.query.filter_by(job_id=job_id).filter(func.lower(func.replace(ExtractedInfo.name, " ", "")) == candidate_name_formatted).first()
            existing_candidate = Candidate.query.filter(func.lower(func.replace(Candidate.name, " ", "")) == candidate_name_formatted).filter_by(job_id=job_id).first()
            if existing_candidate:
                existing_version_number = db.session.query(func.max(Candidate.version_number)).filter_by(name=candidate_name, job_id=job_id).scalar()
                version_number = existing_version_number + 1 if existing_version_number else 1
            else:
                version_number = 1

            if candidate_info:
                technical_skills = candidate_info.tech_skill
                behavioral_skills = candidate_info.behaviour_skill
                print("start of calling question genratifn fucntio of each category")
                question_tech = tech_question_mcq(jd, no_tech_questions, technical_skills)
                question_behav = behaviour_questions(no_behav_questions, behavioral_skills)
                question_coding = coding_question_generate()
                print("every type of questio is completed")
                tech_questions_json = json.loads(question_tech).get('tech_questions', [])
                behaviour_questions_json = json.loads(question_behav).get('Behaviour_q', [])
                coding_question_json = json.loads(question_coding).get('coding_question', {})

                save_assessment_to_db(job_id, role, candidate_name, tech_questions_json, behaviour_questions_json, coding_question_json, version_number)
                resume_score.status = 'assessment_generated'
                db.session.commit()
                print("save to db can heck now")
            else:
                resume_score.status = 'candidate_info_not_found'
                db.session.commit()
                print("some eror")

        except Exception as e:
            resume_score.status = 'error'
            db.session.commit()
            raise e

@assessment_bp.route('/CHECK_Auto_assessment', methods=['POST'])
def CHECK_Auto_assessment():
    try:
        data = request.get_json()
        job_id = data.get('job_id')
        candidate_name = data.get('candidate_name')
        no_tech_questions = data.get('no_tech_questions')
        no_behav_questions = data.get('no_behav_questions')
        print("check assesmet started")
        if not job_id or not candidate_name:
            return jsonify({'error': 'Job ID and candidate name are required parameters.'}), 400

        candidate_name_formatted = candidate_name.lower().replace(" ", "")
        resume_score = ResumeScore.query.filter_by(job_id=job_id).filter(func.lower(func.replace(ResumeScore.name, " ", "")) == candidate_name_formatted).first()

        if resume_score:
            resume_score.status = 'generating_assessment'
            db.session.commit()
            print("thread fucntionis called")
            app = current_app._get_current_object()
            thread = Thread(target=generate_and_save_assessment, args=(app, job_id, candidate_name, no_tech_questions, no_behav_questions, resume_score.id))
            
            thread.start()

            return jsonify({'message': 'Assessment generation started.'}), 200
        else:
            return jsonify({'error': 'Resume score record not found for the candidate.'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@assessment_bp.route('/fetch_candidate_questions_after_selected', methods=['POST'])
def fetch_candidate_questions():
    data = request.get_json()
    candidate_name = data.get('candidate_name')
    job_id = data.get('job_id')

    if not candidate_name or not job_id:
        return jsonify({'error': 'Candidate name and job_id are required parameters.'}), 400

    normalized_candidate_name = candidate_name.replace(" ", "").lower().strip()
    candidate = Candidate.query.filter(func.lower(func.replace(Candidate.name, " ", "")) == normalized_candidate_name, Candidate.job_id == job_id).order_by(Candidate.version_number.desc()).first()

    if not candidate:
        return jsonify({'error': 'Candidate not found for the given job_id.'}), 404

    version_number = candidate.version_number

    technical_questions = []
    for question in candidate.job.technical_questions:
        if question.version_number == version_number and question.name.replace(" ", "").lower().strip() == normalized_candidate_name and question.job_id == job_id:
            technical_questions.append({
                'question': question.question_text,
                'options': json.loads(question.options),
                'answer': question.correct_answer,
                'tech_ques_id': question.id
            })

    behavioural_questions = []
    for question in candidate.job.behavioural_questions:
        if question.version_number == version_number and question.name.replace(" ", "").lower().strip() == normalized_candidate_name and question.job_id == job_id:
            behavioural_questions.append({
                'b_question_id': question.id,
                'b_question_text': question.question_text
            })

    coding_question = {}
    if candidate.job.coding_questions:
        for coding_question_data in candidate.job.coding_questions:
            if coding_question_data.version_number == version_number and coding_question_data.name.replace(" ", "").lower().strip() == normalized_candidate_name and coding_question_data.job_id == job_id:
                coding_question = {
                    'question': coding_question_data.question_text,
                    'sample_input': coding_question_data.sample_input,
                    'sample_output': coding_question_data.sample_output,
                    'coding_ques_id': coding_question_data.id
                }
                break

    return jsonify({
        'tech_questions': technical_questions,
        'Behaviour_q': behavioural_questions,
        'coding_question': coding_question
    }), 200
