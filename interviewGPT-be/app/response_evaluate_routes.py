import os
import json
import uuid
from flask import Blueprint, request, jsonify
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError
from .models import db, ResumeScore,Candidate,BehaviouralQuestion,TechnicalQuestion,CodingQuestion
from .prompts.response_evaluate_prompts import (
    factors, evaluate_tech_prompt, evaluate_code_prompt)
from openai import OpenAI
from .config import AUDIO_FOLDER,MODEL_NAME

response_evaluate_bp = Blueprint('response_evaluate', __name__)

# 4 Screen
# To process the audio generated for behav questions
# API endpoint for processing audio
# Audio (blob to webm to wav)

@response_evaluate_bp.route('/blob_process_audio', methods=['POST'])
def blob_process_audio():
    data = request.form
    question_id = data.get('question_id')
    candidate_id = data.get('candidate_id')
    job_id = data.get('job_id')
    audio_blob = request.files['audio']

    if not question_id or not candidate_id or not job_id or not audio_blob:
        return jsonify({'error': 'Missing required parameters.'}), 400
    
    candidate = Candidate.query.filter_by(id=candidate_id, job_id=job_id).one()
    unique_filename = f"{candidate.name}_{uuid.uuid4().hex}.wav"
    audio_folder = os.path.join(AUDIO_FOLDER, candidate.name)
    
    if not os.path.exists(audio_folder):
        os.makedirs(audio_folder)

    webm_file_path = os.path.join(audio_folder, unique_filename)
    audio_blob.save(webm_file_path)
    
    client = OpenAI()
    client.api_key = os.getenv("OPENAI_API_KEY")
    
    with open(webm_file_path, "rb") as wav_file:
        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=wav_file,
            response_format="text"
        )

    behav = BehaviouralQuestion.query.filter_by(id=question_id, candidate_id=candidate_id).first()
    
    if not behav:
        return jsonify({'error': 'Behavioural question not found.'}), 404

    try:
        behav.audio_transcript = transcript
        db.session.commit()
        return jsonify({'status': 'transcript saved successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    
# To evaluate the technical MCQ questions and score them


def perform_techmcq_assessment(mcq_question):
    message = [
        {"role": "system", "content": evaluate_tech_prompt},
        {"role": "user", "content": f"For the given MCQ questions along with options and user selected options in {mcq_question}, evaluate it as explained, against the correct option and user-selected option. Give each question 1 mark if it is correct or else 0 mark for wrong answers. The total score should be obtained and the response should be only in JSON format as explained earlier."}
    ]
    client = OpenAI()
    client.api_key = os.getenv("OPENAI_API_KEY")
    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=message,

        max_tokens=1000
    )
    response = dict(response)
    tech_assessment_response = dict(dict(response['choices'][0])['message'])[
        'content'].replace("\n", " ")
    tech_assessment_response = ' '.join(tech_assessment_response.split())
    return tech_assessment_response
#############newly tried one 
@response_evaluate_bp.route('/store_tech_response', methods=['POST'])
def store_tech_response():
    data = request.get_json()
    job_id = data.get('job_id')
    candidate_id = data.get('candidate_id')
    answers = data.get('answers')  ## [{"question_id":"1","user_answer":"the tool is ai"},{"question_id":"2","user_answer":"start with *"},{"question_id":"3","user_answer":"the ai is artifial intelligence"}]

    if not job_id or not candidate_id or  not answers:
        return jsonify({'error': 'Missing required parameters.'}), 400

    # Iterate over each answer in the provided list
    for answer in answers:
        question_id = answer.get('question_id')
        user_answer = answer.get('user_answer')

        # Find the TechnicalQuestion entry with the corresponding candidate_id and question_id
        tech_question = TechnicalQuestion.query.filter_by(candidate_id=candidate_id, id=question_id).first()

        if tech_question:
            # Update the user_answer field
            tech_question.user_answer = user_answer

            # Commit the changes to the database
            db.session.commit()
        else:
            # Handle the case where the question is not found, if needed
            return jsonify({"error": f"Question with id {question_id} for candidate {candidate_id} not found"}), 404

    # Query the TechnicalQuestion table for all rows matching the candidate_id
    tech_questions = TechnicalQuestion.query.filter_by(candidate_id=candidate_id).all()

    if not tech_questions:
        return jsonify({"error": "No technical questions found for the given candidate ID"}), 404

        # Prepare the response data
    response_data = []
    for question in tech_questions:
        response_data.append({
                "question_text": question.question_text,
                "correct_answer": question.correct_answer,
                "user_answer": question.user_answer
            })
    print("perform score callaed")
    tech_response = perform_techmcq_assessment(response_data)
    try:
        print("inside try block")
        print(tech_response)
        for question in tech_questions:
            question.tech_eval = tech_response
        db.session.commit()
        return jsonify({'status': 'tech response evaluated and stored successfully.'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Code score api
# User defined function to call openai and score the code


def perform_code_assessment(question_code):
    message = [
        {"role": "system", "content": evaluate_code_prompt},
        {"role": "user", "content": f"the problem statement details for the code is {question_code} and the code snippet to do assessment on the code {question_code},always give the score for each key out of 10 , use {factors} to evalaute the code , if no proper response for the specific key category then it is fine to give 0 score for that category and calculate the total score and assign to OVERALL_SCORE key, dont need any further expalnation of score , just the key with score is enough in json.Always the score should be given coorectly ,even if the same {question_code} and {question_code} is given  multiple times,you should give the same values for same response and code given. "
         }]
    client = OpenAI()
    client.api_key = os.getenv("OPENAI_API_KEY")
    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=message,
        max_tokens=1000
    )
    response = dict(response)
    assessment_response = dict(dict(response['choices'][0])['message'])[
        'content'].replace("\n", " ")
    assessment_response = ' '.join(assessment_response.split())
    return assessment_response

# Api to do code scoring
@response_evaluate_bp.route('/store_code_response', methods=['POST'])
def store_code_response():
    data = request.get_json()
    job_id = data.get('job_id')
    candidate_id = data.get('candidate_id')
    code = data.get('code') # [{"question_id":"1","user_code":"print("helo world")"},{"question_id":"2","user_code":"for i in 10:"},{"question_id":"3","user_code":"def fun()"}]
    
    if not job_id or not candidate_id or  not code:
        return jsonify({'error': 'Missing required parameters.'}), 400
    
    # Iterate over each answer in the provided list
    for answer in code:
        question_id = answer.get('question_id')
        user_code = answer.get('user_code')

    # Find the CodingQuestion entry with the corresponding candidate_id and question_id
        code_question = CodingQuestion.query.filter_by(candidate_id=candidate_id, id=question_id).first()

        if code_question:
            # Update the user_answer field
            code_question.user_code = user_code

            # Commit the changes to the database
            db.session.commit()
        else:
            # Handle the case where the question is not found, if needed
            return jsonify({"error": f"Question with id {question_id} for candidate {candidate_id} not found"}), 404

    # Query the TechnicalQuestion table for all rows matching the candidate_id
    code_questions = CodingQuestion.query.filter_by(candidate_id=candidate_id).all()

    if not code_questions:
        return jsonify({"error": "No technical questions found for the given candidate ID"}), 404

        # Prepare the response data
    response_data = []
    for question in code_questions:
        response_data.append({
                "question_text": question.question_text,
                "sample_input": question.sample_input,
                "sample_output": question.sample_output,
                "user_code": question.user_code
            })
    code_response = perform_code_assessment(response_data)
    
    try:
        for question in code_questions:
            question.code_eval = code_response
        db.session.commit()
        

        # TO UPDATE THE STATUS COLUMN OF RESUME TO ASSESSMENT COMPLETED
        # Query the Candidate table to get the resume_id for the given candidate_id
        candidate = Candidate.query.filter_by(id=candidate_id).first()

        if not candidate:
            return jsonify({"error": "Candidate not found"}), 404

        # Query the ResumeScore table to update the status for the given resume_id
        resume_score = ResumeScore.query.filter_by(resume_id=candidate.resume_id).first()

        if not resume_score:
            return jsonify({"error": "ResumeScore not found for the given candidate's resume_id"}), 404

        # Update the status
        resume_score.status = "Assessment completed by candidate"
        resume_score.assessment_status = 1
        db.session.commit()

        return jsonify({'status': 'Code response evaluated and stored successfully.'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500





# To fetch the user responses after the assessment (all types of questions)
@response_evaluate_bp.route('/fetch_user_responses', methods=['POST'])
def fetch_user_responses():
    data = request.get_json()
    candidate_id = data.get('candidate_id')
    job_id = data.get('job_id')

    try:
        # Query the Candidate table to get the resume_id for the given candidate_id
        candidate = Candidate.query.filter_by(id=candidate_id).first()
        if not candidate:
            return jsonify({'error': 'Candidate not found.'}), 404

        resume_score_entry = ResumeScore.query.filter_by(resume_id=candidate.resume_id).first()
        if not resume_score_entry or resume_score_entry.assessment_status != 1:
            return jsonify({'error': 'Assessment not completed or not found.'}), 400

        code_responses = CodingQuestion.query.filter_by(candidate_id=candidate_id).all()
        if not code_responses:
            return jsonify({'error': 'No code responses found for the given candidate ID.'}), 404

        tech_responses = TechnicalQuestion.query.filter_by(candidate_id=candidate_id).all()
        if not tech_responses:
            return jsonify({'error': 'No technical responses found for the given candidate ID.'}), 404

        audio_transcriptions = BehaviouralQuestion.query.filter_by(candidate_id=candidate_id).all()
        if not audio_transcriptions:
            return jsonify({'error': 'No audio transcriptions found for the given candidate ID.'}), 404

        formatted_audio_transcriptions = []
        for audio_transcription in audio_transcriptions:
            formatted_audio_transcriptions.append({
                'question': audio_transcription.question_text,
                'User_response': audio_transcription.audio_transcript
            })

        formatted_data = {
            'candidate_name': candidate.name,
            'job_id': job_id,
            'code_response': [code_response.code_eval for code_response in code_responses],
            'tech_response': [tech_response.tech_eval for tech_response in tech_responses],
            'audio_transcript': formatted_audio_transcriptions
        }

        return jsonify(formatted_data), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
