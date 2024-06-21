import os
import json
import uuid
import base64
from io import BytesIO
from flask import Blueprint, request, jsonify, current_app, send_file
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError
from .models import db, ResumeScore, Candidate, BehaviouralQuestion, TechnicalQuestion, CodingQuestion
from .prompts.response_evaluate_prompts import (
    factors, evaluate_tech_prompt, evaluate_code_prompt,evaluate_behavioural_prompt)
from openai import OpenAI
from .config import AUDIO_FOLDER, MODEL_NAME
from .auth import token_required
from sqlalchemy.orm.exc import NoResultFound
import threading
from werkzeug.exceptions import NotFound
from urllib.parse import unquote
import boto3

response_evaluate_bp = Blueprint('response_evaluate', __name__)

# 4 Screen
# To process the audio generated for behav questions
# API endpoint for processing audio
# Audio (blob to webm to wav)

# Initialize S3 client
s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
)
s3_bucket = os.getenv('AWS_STORAGE_BUCKET_NAME')

def check_s3_upload(bucket_name, file_key):
    try:
        s3_client.head_object(Bucket=bucket_name, Key=file_key)
        return True
    except boto3.exceptions.botocore.client.ClientError as e:
        if e.response['Error']['Code'] == '404':
            return False
        else:
            raise e

### new code to save the evalaute of the audio and save , it will be running in thread after every audio complete
@response_evaluate_bp.route('/blob_process_audio', methods=['POST'])
@token_required
def blob_process_audio(current_user):
    data = request.form
    question_id = data.get('question_id')
    candidate_id = data.get('candidate_id')
    #job_id = data.get('job_id')
    audio = request.files['audio']

    if not question_id or not candidate_id or not audio:
        return jsonify({'error': 'Missing required parameters.'}), 400

    try:
        candidate = Candidate.query.filter_by(id=candidate_id, user_id=current_user.id).one()
        job_id=candidate.job_id
    except NoResultFound:
        return jsonify({'error': 'Candidate not found.'}), 404

    candidate_name = candidate.name.replace(' ', '_')
    unique_filename = f"{candidate_name}_{uuid.uuid4().hex}.wav"
    audio_folder = os.path.join(AUDIO_FOLDER, candidate.name)
    if not os.path.exists(audio_folder):
        os.makedirs(audio_folder)
    local_file_path = os.path.join(audio_folder, unique_filename)
    audio.save(local_file_path)

    # Upload the file to S3
    s3_bucket = os.getenv('AWS_STORAGE_BUCKET_NAME')
    s3_client = boto3.client('s3')  # Make sure boto3 is imported and configured

    try:
        with open(local_file_path, "rb") as f:
            s3_client.upload_fileobj(f, s3_bucket, unique_filename)
    except Exception as e:
        return jsonify({'error': f"Failed to upload file to S3: {str(e)}"}), 500

    # Check if the file was uploaded successfully
    if not check_s3_upload(s3_bucket, unique_filename):
        return jsonify({'error': 'File upload to S3 failed.'}), 500

    # Generate the S3 file URL
    s3_url = f"https://{s3_bucket}.s3.amazonaws.com/{unique_filename}"

    client = OpenAI()
    client.api_key = os.getenv("OPENAI_API_KEY")

    try:
        with open(local_file_path, "rb") as wav_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=wav_file,
                response_format="text"
            )
    except Exception as e:
        return jsonify({'error': f"Transcription failed: {str(e)}"}), 500

    # Remove local file after processing
    if os.path.isfile(local_file_path):
        os.remove(local_file_path)

    behav = BehaviouralQuestion.query.filter_by(id=question_id, candidate_id=candidate_id, user_id=current_user.id).first()
    if not behav:
        return jsonify({'error': 'Behavioural question not found.'}), 404
    print("transcripts",transcript)
    print(s3_url)
    try:
        behav.audio_transcript = transcript
        behav.audio_file_path = s3_url  # Store the S3 URL
        db.session.commit()

        # Start a thread to evaluate the audio
        evaluation_thread = threading.Thread(target=evaluate_audio, args=(current_app._get_current_object(), behav.id, transcript, behav.question_text))
        evaluation_thread.start()
        # TO UPDATE THE STATUS COLUMN OF RESUME TO ASSESSMENT COMPLETED
        # Query the Candidate table to get the resume_id for the given candidate_id
        candidate = Candidate.query.filter_by(id=candidate_id, user_id=current_user.id).first()

        if not candidate:
            return jsonify({"error": "Candidate not found"}), 404

        # Query the ResumeScore table to update the status for the given resume_id
        resume_score = ResumeScore.query.filter_by(resume_id=candidate.resume_id, user_id=current_user.id).first()

        if not resume_score:
            return jsonify({"error": "ResumeScore not found for the given candidate's resume_id"}), 404

        # Update the status
        resume_score.status = " Behavioural Assessment completed by candidate"
        resume_score.assessment_status = 1
        db.session.commit()

        return jsonify({'status': 'Transcript saved successfully, evaluation started'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# function to evaluate the audio part
def evaluate_audio(app,behav_id,transcript, question_text):
    with app.app_context():
        print("threat started")
        client = OpenAI()
        client.api_key = os.getenv("OPENAI_API_KEY")
    
        message = [
            {"role": "system", "content": evaluate_behavioural_prompt},
            {"role": "user", "content": f"For the given behaviour question {question_text} and transcript {transcript} , evalaute it as expained in system prompt, give score based on prompt and the response should be only in JSON format as explained earlier."}
            ] 
        try:       
            response = client.chat.completions.create(
                model=MODEL_NAME,
                messages=message,
                max_tokens=1000
            )
            response = dict(response)
            behav_assessment_response = dict(dict(response['choices'][0])['message'])[
                'content'].replace("\n", " ")
            behav_assessment_response = ' '.join(behav_assessment_response.split())
            print("respone from ai is done ")
            print("this is the response form ai",behav_assessment_response)

            # Query for the specific BehaviouralQuestion entry again within the thread
            behav = BehaviouralQuestion.query.get(behav_id)
            if behav:
                # Save the evaluation result
                behav.behav_eval = behav_assessment_response
                db.session.commit()
                print("commit of score is done")
            else:
                print(f"Error: BehaviouralQuestion with id {behav_id} not found")
        except Exception as e:
            print(f"Error in evaluation thread: {str(e)}")
            db.session.rollback()



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
@token_required
def store_tech_response(current_user):
    data = request.get_json()
    #job_id = data.get('job_id')
    candidate_id = data.get('candidate_id')
    answers = data.get('answers')  # [{"question_id":"1","user_answer":"the tool is ai"},{"question_id":"2","user_answer":"start with *"},{"question_id":"3","user_answer":"the ai is artifial intelligence"}]

    if  not candidate_id or not answers:
        return jsonify({'error': 'Missing required parameters.'}), 400

    # Iterate over each answer in the provided list
    for answer in answers:
        question_id = answer.get('question_id')
        user_answer = answer.get('user_answer')

        # Find the TechnicalQuestion entry with the corresponding candidate_id and question_id
        tech_question = TechnicalQuestion.query.filter_by(candidate_id=candidate_id, id=question_id, user_id=current_user.id).first()

        if tech_question:
            # Update the user_answer field
            tech_question.user_answer = user_answer

            # Commit the changes to the database
            db.session.commit()
        else:
            # Handle the case where the question is not found, if needed
            return jsonify({"error": f"Question with id {question_id} for candidate {candidate_id} not found"}), 404

    # Query the TechnicalQuestion table for all rows matching the candidate_id
    tech_questions = TechnicalQuestion.query.filter_by(candidate_id=candidate_id, user_id=current_user.id).all()

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
        # TO UPDATE THE STATUS COLUMN OF RESUME TO ASSESSMENT COMPLETED
        # Query the Candidate table to get the resume_id for the given candidate_id
        candidate = Candidate.query.filter_by(id=candidate_id, user_id=current_user.id).first()

        if not candidate:
            return jsonify({"error": "Candidate not found"}), 404

        # Query the ResumeScore table to update the status for the given resume_id
        resume_score = ResumeScore.query.filter_by(resume_id=candidate.resume_id, user_id=current_user.id).first()

        if not resume_score:
            return jsonify({"error": "ResumeScore not found for the given candidate's resume_id"}), 404

        # Update the status
        resume_score.status = "Assessment completed by candidate"
        resume_score.assessment_status = 1
        db.session.commit()
        return jsonify({'status': 'tech response evaluated and stored successfully.'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Code score api
# User defined function to call openai and score the code


def perform_code_assessment(question_code):
    message = [
        {"role": "system", "content": evaluate_code_prompt},
        {"role": "user", "content": f"the problem statement details for the code is {question_code} and the code snippet to do assessment on the code {question_code}, always give the score for each key out of 10, use {factors} to evaluate the code, if no proper response for the specific key category then it is fine to give 0 score for that category and calculate the total score and assign to OVERALL_SCORE key, don't need any further explanation of score, just the key with score is enough in JSON. Always the score should be given correctly, even if the same {question_code} and {question_code} is given multiple times, you should give the same values for the same response and code given."
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
@token_required
def store_code_response(current_user):
    data = request.get_json()
    #job_id = data.get('job_id')
    candidate_id = data.get('candidate_id')
    code = data.get('code')  # [{"question_id":"1","user_code":"print("helo world")"},{"question_id":"2","user_code":"for i in 10:"},{"question_id":"3","user_code":"def fun()"}]

    if  not candidate_id or not code:
        return jsonify({'error': 'Missing required parameters.'}), 400

    # Iterate over each answer in the provided list
    for answer in code:
        question_id = answer.get('question_id')
        user_code = answer.get('user_code')

        # Find the CodingQuestion entry with the corresponding candidate_id and question_id
        code_question = CodingQuestion.query.filter_by(candidate_id=candidate_id, id=question_id, user_id=current_user.id).first()

        if code_question:
            # Update the user_answer field
            code_question.user_code = user_code

            # Commit the changes to the database
            db.session.commit()
        else:
            # Handle the case where the question is not found, if needed
            return jsonify({"error": f"Question with id {question_id} for candidate {candidate_id} not found"}), 404

    # Query the CodingQuestion table for all rows matching the candidate_id
    code_questions = CodingQuestion.query.filter_by(candidate_id=candidate_id, user_id=current_user.id).all()

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
        candidate = Candidate.query.filter_by(id=candidate_id, user_id=current_user.id).first()

        if not candidate:
            return jsonify({"error": "Candidate not found"}), 404

        # Query the ResumeScore table to update the status for the given resume_id
        resume_score = ResumeScore.query.filter_by(resume_id=candidate.resume_id, user_id=current_user.id).first()

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
@token_required
def fetch_user_responses(current_user):
    data = request.get_json()
    resume_id = data.get('resume_id')
    job_id = data.get('job_id')

    try:
        # Query the Candidate table to get the candidate using the given resume_id and user_id
        candidate = Candidate.query.filter_by(resume_id=resume_id, user_id=current_user.id).first()
        if not candidate:
            return jsonify({'error': 'Candidate not found.'}), 404

        resume_score_entry = ResumeScore.query.filter_by(resume_id=resume_id, user_id=current_user.id).first()
        if not resume_score_entry :
            return jsonify({'error': 'Resumescore/Assessment not completed or not found.'}), 400
        ## Fetch the latest code responses
        code_responses = CodingQuestion.query.filter_by(candidate_id=candidate.id, user_id=current_user.id).order_by(CodingQuestion.updated_at.desc()).all()
        if not code_responses:
            pass
            #return jsonify({'error': 'No code responses found for the given candidate ID.'}), 404
        ### Fetch the latest tech responses
        tech_responses = TechnicalQuestion.query.filter_by(candidate_id=candidate.id, user_id=current_user.id).order_by(TechnicalQuestion.updated_at.desc()).all()
        if not tech_responses:
            pass
            #return jsonify({'error': 'No technical responses found for the given candidate ID.'}), 404

        audio_transcriptions = BehaviouralQuestion.query.filter_by(candidate_id=candidate.id, user_id=current_user.id).all()
        if not audio_transcriptions:
            pass
            #return jsonify({'error': 'No audio transcriptions found for the given candidate ID.'}), 404

        formatted_audio_transcriptions = []
        for audio_transcription in audio_transcriptions:
            formatted_audio_transcriptions.append({
                'question': audio_transcription.question_text,
                'score': audio_transcription.behav_eval,
                "audio_file_path" :audio_transcription.audio_file_path,
                "audio_transcript":audio_transcription.audio_transcript
            })
        # Get the latest unique evaluation responses
        latest_code_response = code_responses[0].code_eval if code_responses else None
        latest_tech_response = tech_responses[0].tech_eval if tech_responses else None

        formatted_data = {
            'candidate_name': candidate.name,
            'candidate_image':candidate.image_file_path,
            'job_id': job_id,
            'code_response': latest_code_response,
            'tech_response': latest_tech_response,
            'audio_transcript': formatted_audio_transcriptions
        }

        return jsonify(formatted_data), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@response_evaluate_bp.route('/upload_screenshot', methods=['POST'])
@token_required
def upload_screenshot(current_user):
    data = request.form
    candidate_id = data.get('candidate_id')
    image = request.files['image']
    

    if not candidate_id or not image:
        return jsonify({'error': 'Missing required parameters.'}), 400

    try:
        candidate = Candidate.query.filter_by(id=candidate_id, user_id=current_user.id).first()
        if not candidate:
            return jsonify({'error': 'Candidate not found.'}), 404

        candidate_name = candidate.name.replace(' ', '_')
        unique_image_filename = f"{candidate_name}_{uuid.uuid4().hex}.png"
        
        
        # Upload the image file to S3
        s3_bucket = os.getenv('AWS_STORAGE_BUCKET_NAME')
        s3_client.upload_fileobj(image, s3_bucket, unique_image_filename)

        # Check if the file was uploaded successfully
        if not check_s3_upload(s3_bucket, unique_image_filename):
            return jsonify({'error': 'Image upload to S3 failed.'}), 500

        # Generate the S3 file URL
        s3_image_url = f"https://{s3_bucket}.s3.amazonaws.com/{unique_image_filename}"
        print(s3_image_url)

        try:
            candidate.image_file_path = s3_image_url  # Store the image S3 URL in Candidate table
            db.session.commit()
            return jsonify({'status': 'Candidate photo uploaded and URL saved successfully', 'image_url': s3_image_url}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    except NoResultFound:
        return jsonify({'error': 'Candidate not found.'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

########################################################
@response_evaluate_bp.route('/check_upload_file', methods=['POST'])
def check_upload_file():
    if 'file' not in request.files:
        return jsonify({"error":"no file part"})
    
    file=request.files['file']
    if file.filename == '':
        return jsonify({"error":"no Selected file"})
    try:
        #upload image to s3 bucket
        s3_client.upload_fileobj(file,s3_bucket,file.filename)

        #get public URL of uploaded image
        object_url=f"https://{s3_bucket}.s3.amazonaws.com/{file.filename}"
        print(object_url)
        return jsonify({"status":"successfull"})
    except Exception as e:
        return jsonify({"error":str(e)})
    

