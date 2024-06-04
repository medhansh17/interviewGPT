import os
import json
from flask import Blueprint, request, jsonify, current_app
from threading import Thread
from sqlalchemy import func
from openai import OpenAI
from .models import Job, Candidate, TechnicalQuestion, BehaviouralQuestion, CodingQuestion, CandidateQuestion, ResumeScore, ExtractedInfo
from . import db
from .prompts.assessment_prompts import tech_question_mcq_prompt, behaviour_question_prompt, coding_question_prompt, tech_question_mcq_prompt, behaviour_question_prompt, coding_question_prompt
from .config import MODEL_NAME
assessment_bp = Blueprint('assessment', __name__)

# QUESTION GENERATION
# user defined function for each type of question


def tech_question_mcq(jd13, no_tech_questions, Tech_skills):
    message = [
        {"role": "system", "content": tech_question_mcq_prompt},
        {"role": "user", "content": f"""always mandatory to Generate {no_tech_questions} technical question, the difficulty level should be medium to hard, should not be easy questions,even question should not repeat.
                important information, options sshould be too hard, so that candiate can get confuse easily with other choices.
                Questions should be entirely based on job description {jd13} and candiate technical skills found from {Tech_skills}.
                Mandatory to follow the same keys used in above example will all key in lower case letters\
                Please make sure the JSON data provided follows the correct JSON format as illustrated below. This will ensure that the JSON string can be parsed without errors. Pay attention to the following points:\
                Ensure all keys and string values are enclosed in double quotes.\
                Close all braces  and brackets  properly.\
                Avoid trailing commas after the last element in objects and arrays.
                """}
    ]
    client = OpenAI()
    client.api_key = os.getenv("OPENAI_API_KEY")
    tech_response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=message,
        max_tokens=1000,temperature=0.2
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
        {"role": "user", "content": f"""always mandatory to Generate {no_behav_questions} behaivour questions not more than that,and based on behaviour skills which candidate have {behav_skills}, if they dont have,give a question by your choice.ie soft skill question.\
         Mandatory to follow the same keys used in above example will all key in lower case letters\
        Please make sure the JSON data provided follows the correct JSON format as illustrated below. This will ensure that the JSON string can be parsed without errors. Pay attention to the following points:\
        Ensure all keys and string values are enclosed in double quotes.\
        Close all braces  and brackets  properly.\
        Avoid trailing commas after the last element in objects and arrays.
         """}
    ]
    client = OpenAI()
    client.api_key = os.getenv("OPENAI_API_KEY")
    behav_response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=message,
        max_tokens=1000,temperature=0.2
    )
    print("generating beh quest")
    behav_response = dict(behav_response)
    behav_response = dict(dict(behav_response['choices'][0])['message'])[
        'content'].replace("\n", " ")
    behav_response = ' '.join(behav_response.split())
    print("done beh quest")
    return behav_response


def coding_question_generate(no_code_questions):
    message = [
        {"role": "system", "content": coding_question_prompt},
        {"role": "user", "content": f"""always mandatory to Generate {no_code_questions} number of coding question, questions should not repeat.
         Mandatory to follow the same keys used in above example will all key in lower case letters\
        Please make sure the JSON data provided follows the correct JSON format as illustrated below. This will ensure that the JSON string can be parsed without errors. Pay attention to the following points:\
        Ensure all keys and string values are enclosed in double quotes.\
        Close all braces  and brackets  properly.\
        Avoid trailing commas after the last element in objects and arrays.
         """}
    ]
    client = OpenAI()
    client.api_key = os.getenv("OPENAI_API_KEY")
    coding_response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=message,
        max_tokens=1000,temperature=0.2
    )
    print("generating code quest")
    coding_response = dict(coding_response)
    coding_response = dict(dict(coding_response['choices'][0])['message'])[
        'content'].replace("\n", " ")
    coding_response = ' '.join(coding_response.split())
    print("done code quest")
    print("code question which are genrated below:")
    print(coding_response)
    return coding_response


def save_assessment_to_db(job_id, role, candidate_id, tech_questions, behaviour_questions, coding_questions):
    job = Job.query.get(job_id)
    if not job:
        return jsonify({'error': 'Invalid job ID.'}), 400
    print("save assesmnet to db fucnstatred")
    candidate = Candidate.query.filter_by(id=candidate_id).first()

    for question in tech_questions:
        tech_question = TechnicalQuestion(question_text=question['question'], options=json.dumps(
            question['options']), correct_answer=question['answer'], candidate_id=candidate_id, user_answer="", tech_eval="")
        db.session.add(tech_question)
        db.session.commit()
        candidate_question = CandidateQuestion(
            candidate_id=candidate_id, question_type='technical')
        db.session.add(candidate_question)

    for question in behaviour_questions:
        behav_question = BehaviouralQuestion(
            question_text=question['b_question_text'], candidate_id=candidate_id, audio_transcript="")
        db.session.add(behav_question)
        db.session.commit()
        candidate_question = CandidateQuestion(
            candidate_id=candidate_id, question_type='behavioural')
        db.session.add(candidate_question)

    for question in coding_questions:
        code_question = CodingQuestion(question_text=question['question'], sample_input=question['sample_input'],
                                       sample_output=question['sample_output'], candidate_id=candidate_id, user_code="", code_eval="")
        db.session.add(code_question)
        db.session.commit()
        candidate_question = CandidateQuestion(
            candidate_id=candidate.id, question_type='coding')
        db.session.add(candidate_question)

    db.session.commit()
    print("asved successfully")
    return jsonify({'message': 'Assessment data saved successfully.'}), 200


def generate_and_save_assessment(app, job_id, no_tech_questions, no_behav_questions, no_code_questions, resume_score_id, resume_id):
    with app.app_context():
        try:
            print("entered genrate and save assessment")
            resume_score = ResumeScore.query.get(resume_score_id)
            if resume_score is None:
                raise ValueError("ResumeScore not found")

            # selected_status = resume_score.selected_status
            # if not selected_status:
            #     resume_score.status = 'candidate_rejected'
            #     db.session.commit()
            #     return

            job = Job.query.get(job_id)
            jd = job.jd
            role = job.role
            # To fetch candidate id based on resume id
            candidate = Candidate.query.filter_by(resume_id=resume_id).one()
            candidate_id = candidate.id
            TechnicalQuestion.query.filter(
                TechnicalQuestion.candidate_id == candidate_id).delete()
            BehaviouralQuestion.query.filter(
                BehaviouralQuestion.candidate_id == candidate_id).delete()
            CodingQuestion.query.filter(
                CodingQuestion.candidate_id == candidate_id).delete()

            db.session.commit()

            candidate_info = ExtractedInfo.query.filter_by(
                resume_id=resume_id).one()

            if candidate_info:
                technical_skills = candidate_info.tech_skill
                behavioral_skills = candidate_info.behaviour_skill
                print("start of calling question genratifn fucntio of each category")
                question_tech = tech_question_mcq(
                    jd, no_tech_questions, technical_skills)
                question_behav = behaviour_questions(
                    no_behav_questions, behavioral_skills)
                print("code fucntioni scalled to geerate")
                question_coding = coding_question_generate(no_code_questions)
                print("tech_mcqquestion")
                print(question_tech)
                print("behavquestion")
                print(question_behav)
                print("codingquestion")
                print(question_coding)
                print("every type of questio is completed")
                tech_questions_json = json.loads(
                    question_tech).get('tech_questions', [])
                print("tech loaded ")
                behaviour_questions_json = json.loads(
                    question_behav).get('Behaviour_q', [])
                coding_question_json = json.loads(
                    question_coding).get('coding_question', [])
                print("tech_questions_json",tech_questions_json)
                print("behaviour_questions_json",behaviour_questions_json)
                print("coding_question_json",coding_question_json)
                save_assessment_to_db(job_id, role, candidate_id, tech_questions_json,
                                      behaviour_questions_json, coding_question_json)
                resume_score.status = 'assessment_generated'
                db.session.commit()
                print("save to db can check now")
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
        resume_id = data.get('resume_id')
        no_tech_questions = data.get('no_tech_questions')
        no_behav_questions = data.get('no_behav_questions')
        no_code_questions = data.get('no_code_question')
        print("check assesmet started")
        print('no_tech_questions',no_tech_questions)
        print('no_behav_questions',no_behav_questions)
        print('no_code_question',no_code_questions)
        if not job_id or not resume_id:
            return jsonify({'error': 'Job ID and Resume ID  are required parameters.'}), 400

        # candidate_name_formatted = candidate_name.lower().replace(" ", "")
        # resume_score = ResumeScore.query.filter_by(job_id=job_id).filter(func.lower(
            # func.replace(ResumeScore.name, " ", "")) == candidate_name_formatted).first()
        resume_score = ResumeScore.query.filter_by(resume_id=resume_id).first()

        if resume_score:
            resume_score.status = 'generating_assessment'
            db.session.commit()
            print("thread fucntionis called")
            app = current_app._get_current_object()
            thread = Thread(target=generate_and_save_assessment, args=(
                app, job_id, no_tech_questions, no_behav_questions, no_code_questions, resume_score.id, resume_score.resume_id))

            thread.start()

            return jsonify({'message': 'Assessment generation started.'}), 200
        else:
            return jsonify({'error': 'Resume score record not found for the candidate.'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@assessment_bp.route('/fetch_candidate_questions_after_selected', methods=['POST'])
def fetch_candidate_questions():
    data = request.get_json()
    resume_id = data.get('resume_id')
    job_id = data.get('job_id')

    if not resume_id or not job_id:
        return jsonify({'error': 'Resume ID and job_id are required parameters.'}), 400

    candidate = Candidate.query.filter_by(
        resume_id=resume_id, job_id=job_id).first()

    if not candidate:
        return jsonify({'error': 'Candidate not found for the given job_id.'}), 404

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
        "candidate_id":candidate.id,
        'tech_questions': technical_questions,
        'Behaviour_q': behavioural_questions,
        'coding_question': coding_questions
    }), 200
