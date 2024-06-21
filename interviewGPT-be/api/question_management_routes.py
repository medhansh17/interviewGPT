import json
import os
import jwt
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, render_template_string
from flask_mail import Message
from api import mail
from api.auth import SECRET_KEY, EMAIL_USER, FRONTEND_URL, TA_USER
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError
from .models import db, Candidate, TechnicalQuestion, BehaviouralQuestion, CodingQuestion, ResumeScore, ExtractedInfo
from openai import OpenAI
from .config import MODEL_NAME
from .prompts.question_management_prompts import generate_CRUD_tech_prompt, generate_CRUD_behav_prompt, generate_CRUD_code_prompt
from .auth import token_required, create_assessment_email_body

question_management_bp = Blueprint('question_management', __name__)

# To edit the questions in approval screen


@question_management_bp.route('/edit_candidate_question', methods=['POST'])
@token_required
def edit_candidate_question(current_user):
    data = request.get_json()
    question_id = data.get('question_id')
    resume_id = data.get('resume_id')
    job_id = data.get('job_id')
    # 'technical', 'behavioural', or 'coding'
    question_type = data.get('question_type').lower()
    # Contains the updated details of the question
    question_data = data.get('question_data')

    if not question_id or not question_type or not question_data:
        return jsonify({'error': 'question_id, question_type, and question_data are required parameters.'}), 400
    candidate = Candidate.query.filter_by(
        resume_id=resume_id, job_id=job_id, user_id=current_user.id).one()
    try:
        if question_type == 'technical':
            question = TechnicalQuestion.query.filter_by(
                candidate_id=candidate.id, id=question_id, user_id=current_user.id).first()
            if question:
                question.question_text = question_data['question']
                question.options = json.dumps(question_data['options'])
                question.correct_answer = question_data['answer']
            else:
                return jsonify({'error': 'Technical question not found.'}), 404

        elif question_type == 'behavioural':
            question = BehaviouralQuestion.query.filter_by(
                candidate_id=candidate.id, id=question_id, user_id=current_user.id).first()
            if question:
                question.question_text = question_data['b_question_text']
            else:
                return jsonify({'error': 'Behavioral question not found.'}), 404

        elif question_type == 'coding':
            question = CodingQuestion.query.filter_by(
                candidate_id=candidate.id, id=question_id, user_id=current_user.id).first()
            if question:
                question.question_text = question_data['question']
                question.sample_input = question_data['sample_input']
                question.sample_output = question_data['sample_output']
            else:
                return jsonify({'error': 'Coding question not found.'}), 404

        else:
            return jsonify({'error': 'Invalid question type.'}), 400

        db.session.commit()
        return jsonify({'status': 'Question updated successfully.'}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# To delete the question in approval page


@question_management_bp.route('/delete_candidate_question', methods=['DELETE'])
@token_required
def delete_candidate_question(current_user):
    data = request.get_json()
    resume_id = data.get('resume_id')
    job_id = data.get('job_id')
    question_id = data.get('question_id')
    # 'technical', 'behavioral', 'coding'
    question_type = data.get('question_type').lower()

    if not question_id or not question_type:
        return jsonify({'error': 'question_id and question_type are required parameters.'}), 400

    candidate = Candidate.query.filter_by(
        resume_id=resume_id, job_id=job_id, user_id=current_user.id).one()
    try:
        if question_type == 'technical':
            question = TechnicalQuestion.query.filter_by(
                candidate_id=candidate.id, id=question_id, user_id=current_user.id).first()
            if question:
                db.session.delete(question)
            else:
                return jsonify({'error': 'Technical question not found.'}), 404

        elif question_type == 'behavioral':
            question = BehaviouralQuestion.query.filter_by(
                candidate_id=candidate.id, id=question_id, user_id=current_user.id).first()
            if question:
                db.session.delete(question)
            else:
                return jsonify({'error': 'Behavioral question not found.'}), 404

        elif question_type == 'coding':
            question = CodingQuestion.query.filter_by(
                candidate_id=candidate.id, id=question_id, user_id=current_user.id).first()
            if question:
                db.session.delete(question)
            else:
                return jsonify({'error': 'Coding question not found.'}), 404

        else:
            return jsonify({'error': 'Invalid question type.'}), 400

        db.session.commit()
        return jsonify({'status': 'Question deleted successfully.'}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# to prompt the question topic and generate question for each one


def generate_new_question(old_question, difficulty_level, system_prompt, user_prompt):
    message = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"""
         {old_question}: This is a JSON string representation of a previously generated question. If no question is provided, this will be an empty string.
         {difficulty_level}: Indicates the difficulty level of the new question to be generated. It can be either "easy", "medium", or "hard". If no difficulty level is provided, this will be an empty string.
        Use the already generated question {old_question}, get inference from it and if {difficulty_level} is given then, Generate a technical question based on the {difficulty_level} level and {old_question} inference, of the following topic: {user_prompt}, 
        Mandatory to follow the same keys used in above example will all key in lower case letters.
        Please make sure the JSON data provided follows the correct JSON format as illustrated below. This will ensure that the JSON string can be parsed without errors. Pay attention to the following points: 
        Ensure all keys and string values are enclosed in double quotes.
        Close all braces and brackets properly. 
        Avoid trailing commas after the last element in objects and arrays.
         """}
    ]
    client = OpenAI()
    client.api_key = os.getenv("OPENAI_API_KEY")
    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=message,
        max_tokens=1000, temperature=0.2
    )

    response = dict(response)
    response_data = dict(dict(response['choices'][0])['message'])[
        'content'].replace("\n", " ")

    response_content = ' '.join(response_data.split())
    new_question = json.loads(response_content)
    return new_question


@question_management_bp.route('/update_candidate_question', methods=['POST'])
@token_required
def update_candidate_question(current_user):
    data = request.get_json()
    resume_id = data.get('resume_id')
    job_id = data.get('job_id')
    question_id = data.get('question_id')
    # 'technical', 'behavioral', 'coding'
    question_type = data.get('question_type').lower()
    topic_prompt = data.get('topic_prompt'," ")
    difficulty_level=data.get("difficulty_level"," ") ## easy, medium, hard
    print(data)
    if not resume_id or not job_id or not question_type or not topic_prompt:
        return jsonify({'error': 'Candidate name, job_id, question_type, and topic_prompt are required parameters.'}), 400

    prompt_generator = {'technical': generate_CRUD_tech_prompt,
                        'behavioral': generate_CRUD_behav_prompt, 'coding': generate_CRUD_code_prompt}

    update_functions = {
        'technical': update_technical_question,
        'behavioral': update_behavioural_question,
        'coding': update_coding_question
    }

    if question_type not in prompt_generator:
        return jsonify({'error': 'Invalid question_type provided.'}), 400

    candidate = Candidate.query.filter_by(
        resume_id=resume_id, job_id=job_id, user_id=current_user.id).one()

    old_question = str(fetch_question_details(question_id, question_type, current_user.id))
    if not old_question:
        return jsonify({'error': 'Question not found.'}), 404

    new_question = generate_new_question(old_question, difficulty_level,
                                         prompt_generator[question_type], topic_prompt)

    update_functions[question_type](question_id, new_question, candidate.id, current_user.id)

    return jsonify({'message': 'Question updated successfully.'}), 200

# For fetching the old question


def fetch_question_details(question_id, question_type, user_id):
    if question_type == 'technical':
        question = TechnicalQuestion.query.filter_by(id=question_id, user_id=user_id).first()
        if question:
            return {
                'question_text': question.question_text,
                'options': question.options
            }
    elif question_type == 'behavioral':
        question = BehaviouralQuestion.query.filter_by(id=question_id, user_id=user_id).first()
        if question:
            return {
                'question_text': question.question_text,
            }
    elif question_type == 'coding':
        question = CodingQuestion.query.filter_by(id=question_id, user_id=user_id).first()
        if question:
            return {
                'question_text': question.question_text,
                'sample_input': question.sample_input,
                'sample_output': question.sample_output
            }
    return None

def update_technical_question(question_id, new_question, candidate_id, user_id):
    tech_question = TechnicalQuestion.query.filter_by(
        candidate_id=candidate_id, id=question_id, user_id=user_id).first()

    if tech_question:
        tech_question.question_text = new_question['question']
        tech_question.options = json.dumps(new_question['options'])
        tech_question.correct_answer = new_question['answer']
        db.session.commit()


def update_behavioural_question(question_id, new_question, candidate_id, user_id):
    behav_question = BehaviouralQuestion.query.filter_by(
        candidate_id=candidate_id, id=question_id, user_id=user_id).first()

    if behav_question:
        behav_question.question_text = new_question['b_question_text']
        db.session.commit()


def update_coding_question(question_id, new_question, candidate_id, user_id):
    coding_question = CodingQuestion.query.filter_by(
        candidate_id=candidate_id, id=question_id, user_id=user_id).first()

    if coding_question:
        coding_question.question_text = new_question['question']
        coding_question.sample_input = new_question['sample_input']
        coding_question.sample_output = new_question['sample_output']
        db.session.commit()

# Assessment sheet API's
# To show the question in assessment sheet page


@question_management_bp.route('/fetch_behavioural_questions', methods=['POST'])
@token_required
def fetch_behavioural_questions(current_user):
    data = request.get_json()
    resume_id = data.get('resume_id')
    job_id = data.get('job_id')

    if not resume_id or not job_id:
        return jsonify({'error': 'Resume ID and job_id are required parameters.'}), 400

    candidate = Candidate.query.filter_by(
        resume_id=resume_id, job_id=job_id, user_id=current_user.id).first()

    if not candidate:
        return jsonify({'error': 'Candidate not found for the given job_id.'}), 404

    behavioural_questions = []
    for question in candidate.behavioural_questions:
        behavioural_questions.append({
            'b_question_id': question.id,
            'b_question_text': question.question_text,
            "candidate_id": candidate.id
        })

    return jsonify({'Behaviour_q': behavioural_questions}), 200


@question_management_bp.route('/fetch_technical_questions', methods=['POST'])
@token_required
def fetch_technical_questions(current_user):
    data = request.get_json()
    resume_id = data.get('resume_id')
    job_id = data.get('job_id')

    if not resume_id or not job_id:
        return jsonify({'error': 'Resume ID and job_id are required parameters.'}), 400

    candidate = Candidate.query.filter_by(
        resume_id=resume_id, job_id=job_id, user_id=current_user.id).first()

    if not candidate:
        return jsonify({'error': 'Candidate not found for the given job_id.'}), 404

    technical_questions = []
    for question in candidate.technical_questions:
        technical_questions.append({
            'question': question.question_text,
            'options': json.loads(question.options),
            'answer': question.correct_answer,
            'tech_ques_id': question.id,
            "candidate_id": candidate.id
        })

    return jsonify({'tech_questions': technical_questions}), 200


@question_management_bp.route('/fetch_coding_question', methods=['POST'])
@token_required
def fetch_coding_question(current_user):
    data = request.get_json()
    resume_id = data.get('resume_id')
    job_id = data.get('job_id')

    if not resume_id or not job_id:
        return jsonify({'error': 'Resume ID and job_id are required parameters.'}), 400

    candidate = Candidate.query.filter_by(
        resume_id=resume_id, job_id=job_id, user_id=current_user.id).first()

    if not candidate:
        return jsonify({'error': 'Candidate not found for the given job_id.'}), 404

    coding_questions = []
    for question in candidate.coding_questions:
        coding_questions.append({
            'question': question.question_text,
            'sample_input': question.sample_input,
            'sample_output': question.sample_output,
            'coding_ques_id': question.id,
            "candidate_id": candidate.id
        })

    return jsonify({'coding_question': coding_questions}), 200


### APPROVAL SCREEN
## token link generation for assessment


def generate_assessment_token(candidate_id, candidate_name, job_id, user_id, validity_hours=2):
    payload = {
        'candidate_id': candidate_id,
        'candidate_name': candidate_name,
        'job_id': job_id,
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(hours=validity_hours), # Expiry time
        'iat': datetime.utcnow()  # Issued at time
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    return token


@question_management_bp.route('/approve_candidate', methods=['POST'])
@token_required
def approve_candidate(current_user):
    data = request.get_json()
    candidate_id = data.get('candidate_id')
    candidate = Candidate.query.filter_by(id=candidate_id, user_id=current_user.id).one()
    
    if not candidate:
        return jsonify({'error': 'Candidate not found.'}), 404
    
    extracted_info = ExtractedInfo.query.filter_by(resume_id=candidate.resume_id, user_id=current_user.id).first()

    token = generate_assessment_token(candidate.id, candidate.name, candidate.job_id, current_user.id)
    link = f'{FRONTEND_URL}/online-assess/{token}'
    
    html_content = create_assessment_email_body(candidate.name, link)
    
    msg = Message('Assessment Link', sender=EMAIL_USER, recipients=[extracted_info.email_id], cc=[TA_USER], html=html_content)
    mail.send(msg)
    print(TA_USER)
    resume_score = ResumeScore.query.filter_by(resume_id=candidate.resume_id, user_id=current_user.id).first()

    if resume_score:
        resume_score.status = 'Assessment link send to candidate'
        db.session.commit()
    
    return jsonify({'message': 'Assessment link has been sent to the candidate.'}), 200

## Assessment sheet send to candidate 

@question_management_bp.route('/assessment_sheet', methods=['GET'])
def assessment_sheet():
    token = request.args.get('token')
    
    if not token:
        return jsonify({'error': 'Token is required.'}), 400
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'The link has expired.'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token.'}), 401

    candidate_id = payload['candidate_id']
    candidate_name = payload['candidate_name']
    job_id = payload['job_id']
    user_id = payload['user_id']

    candidate = Candidate.query.filter_by(id=candidate_id, job_id=job_id, user_id=user_id).first()
    
    if not candidate:
        return jsonify({'error': 'Candidate not found.'}), 404
    # check the assessment link is accessed multiple times
    if candidate.link_used:
        return jsonify({'error': 'This link has already been used.'}), 403
    
    # Mark the link as used
    candidate.link_used = True
    db.session.commit()
    
    technical_questions = []
    for question in candidate.technical_questions:
        technical_questions.append({
            'question': question.question_text,
            'options': json.loads(question.options),
            'answer': question.correct_answer,
            'tech_ques_id': question.id
        })

    behavioural_questions = []
    for question in candidate.behavioural_questions:
        behavioural_questions.append({
            'b_question_id': question.id,
            'b_question_text': question.question_text
        })

    coding_questions = []
    for question in candidate.coding_questions:
        coding_questions.append({
            'question': question.question_text,
            'sample_input': question.sample_input,
            'sample_output': question.sample_output,
            'coding_ques_id': question.id
        })

    return jsonify({
        "candidate_id": candidate_id,
        "candidate_name": candidate_name,
        "job_id": job_id,
        'tech_questions': technical_questions,
        'Behaviour_q': behavioural_questions,
        'coding_question': coding_questions
    }), 200
