import os
import json
import uuid
from flask import Blueprint, request, jsonify
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError
from .models import db, CodeResponse, TechResponse, AudioTranscription, ResumeScore
from .response_evaluate_prompts import (factors,evaluate_tech_prompt,evaluate_code_prompt)
from openai import OpenAI
from config import AUDIO_FOLDER
response_evaluate_bp = Blueprint('response_evaluate', __name__)

## 4 Screen 
## To process the audio generated for behav questions
# API endpoint for processing audio
##Audio (blob to webm to wav)

@response_evaluate_bp.route('/blob_process_audio', methods=['POST'])
def blob_process_audio():
    data = request.form
    question = data.get('question')
    candidate_name = data.get('candidate_name')
    job_id = data.get('job_id')
    audio_blob = request.files['audio']

    if not question or not candidate_name or not job_id or not audio_blob:
        return jsonify({'error': 'Missing required parameters.'}), 400
    
    unique_filename = f"{candidate_name}_{uuid.uuid4().hex}.wav"
    audio_folder = os.path.join(AUDIO_FOLDER, candidate_name)
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
    
    try:
        new_transcription = AudioTranscription(
            question=question,
            name=candidate_name,
            job_id=job_id,
            audio_transcript=transcript
        )
        db.session.add(new_transcription)
        db.session.commit()
        return jsonify({'status': 'transcripts saved successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

## Code score api 
## User defined function to call openai and score the code 

def perform_code_assessment(question, code):
    message = [
        {"role": "system", "content": evaluate_code_prompt},
        {"role":"user","content":f"the problem statement details for the code is {question} and the code snippet to do assessment on the code {code},always give the score for each key out of 10 , use {factors} to evalaute the code , if no proper response for the specific key category then it is fine to give 0 score for that category and calculate the total score and assign to OVERALL_SCORE key, dont need any further expalnation of score , just the key with score is enough in json.Always the score should be given coorectly ,even if the same {question} and {code} is given  multiple times,you should give the same values for same response and code given. "
    }]
    client = OpenAI()
    client.api_key = os.getenv("OPENAI_API_KEY")
    response = client.chat.completions.create(
        model="gpt-4",
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
    name = data.get('candidate_name')
    question = data.get('question')
    code = data.get('code')

    if not job_id or not name or not question or not code:
        return jsonify({'error': 'Missing required parameters.'}), 400

    assessment_response = perform_code_assessment(question, code)

    try:
        existing_entry = CodeResponse.query.filter_by(name=name, job_id=job_id).first()
        if existing_entry:
            db.session.delete(existing_entry)
            db.session.commit()

        new_response = CodeResponse(
            job_id=job_id,
            name=name,
            code_response=assessment_response
        )
        db.session.add(new_response)
        db.session.commit()

        normalized_name = name.replace(" ", "").lower().strip()
        resume_score_entry = ResumeScore.query.filter(
            func.lower(func.replace(ResumeScore.name, " ", "")) == normalized_name,
            ResumeScore.job_id == job_id
        ).first()

        if resume_score_entry:
            resume_score_entry.assessment_status = 1
            db.session.commit()

        return jsonify({'status': 'Code response evaluated and stored successfully.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500    

## To evaluate the technical MCQ questions and score them

def perform_techmcq_assessment(mcq_question):
    message = [
        {"role": "system", "content": evaluate_tech_prompt},
        {"role": "user", "content": f"For the given MCQ questions along with options and user selected options in {mcq_question}, evaluate it as explained, against the correct option and user-selected option. Give each question 1 mark if it is correct or else 0 mark for wrong answers. The total score should be obtained and the response should be only in JSON format as explained earlier."}
    ]
    client = OpenAI()
    client.api_key = os.getenv("OPENAI_API_KEY")
    response = client.chat.completions.create(
        model="gpt-4",
        messages=message,
        
        max_tokens=1000
    )
    response = dict(response)
    tech_assessment_response = dict(dict(response['choices'][0])['message'])[
        'content'].replace("\n", " ")
    tech_assessment_response = ' '.join(tech_assessment_response.split())
    return tech_assessment_response
        
@response_evaluate_bp.route('/store_tech_response', methods=['POST'])
def store_tech_response():
    data = request.get_json()
    job_id = data.get('job_id')
    name = data.get('candidate_name')
    question = data.get('question')
    
    if not job_id or not name or not question:
        return jsonify({'error': 'Missing required parameters.'}), 400

    tech_response = perform_techmcq_assessment(question)

    try:
        existing_entry = TechResponse.query.filter_by(name=name, job_id=job_id).first()
        if existing_entry:
            db.session.delete(existing_entry)
            db.session.commit()

        new_response = TechResponse(
            job_id=job_id,
            name=name,
            tech_response=tech_response
        )
        db.session.add(new_response)
        db.session.commit()

        normalized_name = name.replace(" ", "").lower().strip()
        resume_score_entry = ResumeScore.query.filter(
            func.lower(func.replace(ResumeScore.name, " ", "")) == normalized_name,
            ResumeScore.job_id == job_id
        ).first()

        if resume_score_entry:
            resume_score_entry.assessment_status = 1
            db.session.commit()

        return jsonify({'status': 'Tech response stored successfully.'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

## To fetch the user responses after the assessment (all types of questions)

@response_evaluate_bp.route('/fetch_user_responses', methods=['POST'])
def fetch_user_responses():
    data = request.get_json()
    candidate_name = data.get('candidate_name')
    job_id = data.get('job_id')

    normalized_name = candidate_name.replace(" ", "").lower().strip()
    resume_score_entry = ResumeScore.query.filter(
        func.lower(func.replace(ResumeScore.name, " ", "")) == normalized_name,
        ResumeScore.job_id == job_id
    ).first()

    if not resume_score_entry or resume_score_entry.assessment_status != 1:
        return jsonify({'error': 'Assessment not completed or not found.'}), 400

    code_responses = CodeResponse.query.filter(
        func.lower(func.replace(CodeResponse.name, " ", "")) == normalized_name,
        CodeResponse.job_id == job_id
    ).all()
    
    tech_responses = TechResponse.query.filter(
        func.lower(func.replace(TechResponse.name, " ", "")) == normalized_name,
        TechResponse.job_id == job_id
    ).all()

    audio_transcriptions = AudioTranscription.query.filter(
        func.lower(func.replace(AudioTranscription.name, " ", "")) == normalized_name,
        AudioTranscription.job_id == job_id
    ).all()

    formatted_audio_transcriptions = []
    for audio_transcription in audio_transcriptions:
        formatted_audio_transcriptions.append({
            'question': audio_transcription.question,
            'User_response': audio_transcription.audio_transcript
        })

    formatted_data = {
        'candidate_name': candidate_name,
        'job_id': job_id,
        'code_response': [code_response.code_response for code_response in code_responses],
        'tech_response': [tech_response.tech_response for tech_response in tech_responses],
        'audio_transcript': formatted_audio_transcriptions
    }

    return jsonify(formatted_data), 200
