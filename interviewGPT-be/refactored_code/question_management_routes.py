from flask import Blueprint, request, jsonify
"""from models import *
from app import *"""


question_management_bp = Blueprint('question_management', __name__)

## To edit the questions in approval screen

@question_management_bp.route('/edit_candidate_question', methods=['POST'])
def edit_candidate_question():
    data = request.get_json()
    question_id = data.get('question_id')
    candidate_name=data.get('candidate_name')
    job_id = data.get('job_id')
    question_type = data.get('question_type')  # 'technical', 'behavioral', 'coding'
    question_data = data.get('question_data')  # Contains the updated details of the question

    # Normalize candidate name for consistency
    # Convert to lowercase and remove extra spaces
    normalized_candidate_name=candidate_name.replace(" ", "").lower().strip()

    if not question_id or not question_type or not question_data:
        return jsonify({'error': 'question_id, question_type, and question_data are required parameters.'}), 400
    question_type=question_type.lower()
    try:
        if question_type == 'technical':

            question=TechnicalQuestion.query.filter(
                func.lower(func.replace(TechnicalQuestion.name, " ", "")) == normalized_candidate_name,
                TechnicalQuestion.id == question_id,
                TechnicalQuestion.job_id == job_id).first()
            
            if question:
                question.question_text = question_data['question']
                question.options = json.dumps(question_data['options'])
                question.correct_answer = question_data['answer']
            else:
                return jsonify({'error': 'Technical question not found.'}), 404

        elif question_type == 'behavioral':

            question=BehaviouralQuestion.query.filter(
                func.lower(func.replace(BehaviouralQuestion.name, " ", "")) == normalized_candidate_name,
                BehaviouralQuestion.id == question_id,
                BehaviouralQuestion.job_id == job_id).first()
            
            if question: 
                question.question_text = question_data['b_question_text']
            else:
                return jsonify({'error': 'Behavioral question not found.'}), 404

        elif question_type == 'coding':

            question=CodingQuestion.query.filter(
                func.lower(func.replace(CodingQuestion.name, " ", "")) == normalized_candidate_name,
                CodingQuestion.id == question_id,
                CodingQuestion.job_id == job_id).first()
            
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

## To delete the question in approval page

@question_management_bp.route('/delete_candidate_question', methods=['DELETE'])
def delete_candidate_question():
    data = request.get_json()
    candidate_name=data.get('candidate_name')
    job_id = data.get('job_id')
    question_id = data.get('question_id')
    question_type = data.get('question_type')  # 'technical', 'behavioral', 'coding'

    # Normalize candidate name for consistency
    # Convert to lowercase and remove extra spaces
    normalized_candidate_name=candidate_name.replace(" ", "").lower().strip()

    if not question_id or not question_type:
        return jsonify({'error': 'question_id and question_type are required parameters.'}), 400

    try:
        if question_type == 'technical':
            question=TechnicalQuestion.query.filter(
                func.lower(func.replace(TechnicalQuestion.name, " ", "")) == normalized_candidate_name,
                TechnicalQuestion.id == question_id,
                TechnicalQuestion.job_id == job_id).first()
            
            if question:
                db.session.delete(question)
            else:
                return jsonify({'error': 'Technical question not found.'}), 404

        elif question_type == 'behavioral':
            question=BehaviouralQuestion.query.filter(
                func.lower(func.replace(BehaviouralQuestion.name, " ", "")) == normalized_candidate_name,
                BehaviouralQuestion.id == question_id,
                BehaviouralQuestion.job_id == job_id).first()
            
            if question:
                db.session.delete(question)
            else:
                return jsonify({'error': 'Behavioral question not found.'}), 404

        elif question_type == 'coding':
            question=CodingQuestion.query.filter(
                func.lower(func.replace(CodingQuestion.name, " ", "")) == normalized_candidate_name,
                CodingQuestion.id == question_id,
                CodingQuestion.job_id == job_id).first()
            
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

## to prompt the question topic and generate question for each one
#Generate and display the question based on the user’s prompt
## Update the Question in the Database after generation question based on user prompt

@question_management_bp.route('/update_candidate_question', methods=['POST'])
def update_candidate_question():
    data = request.get_json()
    candidate_name = data.get('candidate_name')
    job_id = data.get('job_id')
    question_id = data.get('question_id')
    question_type = data.get('question_type')  # 'technical', 'behavioural', or 'coding'
    topic_prompt = data.get('topic_prompt')

    if not candidate_name or not job_id or not question_type or not topic_prompt:
        return jsonify({'error': 'Candidate name, job_id, question_type, and topic_prompt are required parameters.'}), 400

    # Normalize candidate name for consistency
    normalized_candidate_name = candidate_name.replace(" ", "").lower().strip()

    if question_type == 'technical':
        new_question = generate_technical_question(topic_prompt)
        update_technical_question(question_id, new_question, job_id, normalized_candidate_name)

    elif question_type == 'behavioural':
        new_question = generate_behavioural_question(topic_prompt)
        update_behavioural_question(question_id, new_question, job_id, normalized_candidate_name)

    elif question_type == 'coding':
        new_question = generate_coding_question(topic_prompt)
        update_coding_question(question_id, new_question, job_id, normalized_candidate_name)

    else:
        return jsonify({'error': 'Invalid question type.'}), 400

    return jsonify({'message': 'Question updated successfully.'}), 200

def generate_technical_question(prompt):
    # Generate a new technical question based on the prompt
    message = [
        {"role": "system", "content": """
            You act as a technical Recruitment Professional with several years of experience ie more than 10+ years working in the tech industry. With all your years of expertise in interviewing candidates, always follow the output format, it should always be in JSON like:
            {
                "question": "What is the purpose of a firewall in a network?",
                "options": {
                    "A": "Prevents hacker attacks",
                    "B": "Reduces network traffic",
                    "C": "Increases network speed",
                    "D": "Bypass security protocols"
                },
                "answer": "A"
            }
        """},
        {"role": "user", "content": f"Generate a technical question on the following topic: {prompt}"}
    ]

    response = client.chat.completions.create(
        model="gpt-4-turbo",
        messages=message,
        max_tokens=1000
    )

    response= dict(response)
    response_data = dict(dict(response['choices'][0])['message'])[
            'content'].replace("\n", " ")

    
    response_content = ' '.join(response_data.split())
    new_question = json.loads(response_content)
    return (new_question)

def generate_behavioural_question(prompt):
    # Generate a new behavioural question based on the prompt
    message = [
        {"role": "system", "content": """
            You act as a Recruitment Professional with several years of experience ie more than 10+ years working in the tech industry. With all your years of expertise in interviewing candidates, always follow the output format, it should always be in JSON like:
            {
                "b_question_id": "1",
                "b_question_text": "Tell me about yourself?"
            }
        """},
        {"role": "user", "content": f"Generate a behavioural question on the following topic: {prompt}"}
    ]

    response = client.chat.completions.create(
        model="gpt-4-turbo",
        messages=message,
        max_tokens=1000
    )
    response= dict(response)
    response_data = dict(dict(response['choices'][0])['message'])[
            'content'].replace("\n", " ")

    
    response_content = ' '.join(response_data.split())
    new_question = json.loads(response_content)
    return (new_question)

def generate_coding_question(prompt):
    # Generate a new coding question based on the prompt
    message = [
        {"role": "system", "content": """
            You act as a hackerrank application. With all your years of expertise in interviewing candidates, generate a coding question. Follow the format, this is how the result should look like:
            {
                "question": "An array is a type of data structure that stores elements of the same type in a contiguous block of memory. Reverse an array of integers.",
                "sample_input": "4\n1 4 3 2",
                "sample_output": "2 3 4 1"
            }
        """},
        {"role": "user", "content": f"Generate a coding question on the following topic: {prompt}"}
    ]

    response = client.chat.completions.create(
        model="gpt-4-turbo",
        messages=message,
        max_tokens=1000
    )

    response= dict(response)
    response_data = dict(dict(response['choices'][0])['message'])[
            'content'].replace("\n", " ")

    
    response_content = ' '.join(response_data.split())
    new_question = json.loads(response_content)
    return (new_question)

def update_technical_question(question_id, new_question, job_id, candidate_name):
    tech_question = TechnicalQuestion.query.filter(
        func.lower(func.replace(TechnicalQuestion.name, " ", "")) == candidate_name,
        TechnicalQuestion.id == question_id,
        TechnicalQuestion.job_id == job_id
    ).first()

    if tech_question:
        tech_question.question_text = new_question['question']
        tech_question.options = json.dumps(new_question['options'])
        tech_question.correct_answer = new_question['answer']
        db.session.commit()

def update_behavioural_question(question_id, new_question, job_id, candidate_name):
    behav_question = BehaviouralQuestion.query.filter(
        func.lower(func.replace(BehaviouralQuestion.name, " ", "")) == candidate_name,
        BehaviouralQuestion.id == question_id,
        BehaviouralQuestion.job_id == job_id
    ).first()

    if behav_question:
        behav_question.question_text = new_question['b_question_text']
        db.session.commit()

def update_coding_question(question_id, new_question, job_id, candidate_name):
    coding_question = CodingQuestion.query.filter(
        func.lower(func.replace(CodingQuestion.name, " ", "")) == candidate_name,
        CodingQuestion.id == question_id,
        CodingQuestion.job_id == job_id
    ).first()

    if coding_question:
        coding_question.question_text = new_question['question']
        coding_question.sample_input = new_question['sample_input']
        coding_question.sample_output = new_question['sample_output']
        db.session.commit()

### Assessment sheet API's
### To show the question in assessment sheet page 
@question_management_bp.route('/fetch_behavioural_questions', methods=['POST'])
def fetch_behavioural_questions():
    # Get candidate name and job_id in Json
    data = request.get_json()
    candidate_name=data.get('candidate_name')
    job_id = data.get('job_id')

    if not candidate_name or not job_id:
        return jsonify({'error': 'Candidate name and job_id are required parameters.'}), 400
    
    # Normalize candidate name for consistency
    # Convert to lowercase and remove extra spaces
    normalized_candidate_name=candidate_name.replace(" ", "").lower().strip()
    # Find the candidate record with the highest version number
    candidate = Candidate.query.filter(func.lower(func.replace(Candidate.name, " ", "")) == normalized_candidate_name, Candidate.job_id == job_id).order_by(Candidate.version_number.desc()).first()

    if not candidate:
        return jsonify({'error': 'Candidate not found for the given job_id.'}), 404

    # Fetch behavioural questions
    behavioural_questions = []
    for question in candidate.job.behavioural_questions:
        if question.version_number == max([q.version_number for q in candidate.job.behavioural_questions]) and question.name.replace(" ", "").lower().strip() == normalized_candidate_name and question.job_id == job_id:
            behavioural_questions.append({
                'b_question_id': question.id,
                'b_question_text': question.question_text
            })

    return jsonify({'Behaviour_q': behavioural_questions}), 200


@question_management_bp.route('/fetch_technical_questions', methods=['POST'])
def fetch_technical_questions():
    # Get candidate name and job_id in Json
    data = request.get_json()
    candidate_name=data.get('candidate_name')
    job_id = data.get('job_id')

    if not candidate_name or not job_id:
        return jsonify({'error': 'Candidate name and job_id are required parameters.'}), 400
    
    # Normalize candidate name for consistency
    # Convert to lowercase and remove extra spaces
    normalized_candidate_name=candidate_name.replace(" ", "").lower().strip()
    # Find the candidate record with the highest version number
    candidate = Candidate.query.filter(func.lower(func.replace(Candidate.name, " ", "")) == normalized_candidate_name, Candidate.job_id == job_id).order_by(Candidate.version_number.desc()).first()
    
    if not candidate:
        return jsonify({'error': 'Candidate not found for the given job_id.'}), 404

    # Fetch technical questions
    technical_questions = []
    for question in candidate.job.technical_questions:
        if question.version_number == max([q.version_number for q in candidate.job.technical_questions]) and question.name.replace(" ", "").lower().strip() == normalized_candidate_name and question.job_id == job_id:
            technical_questions.append({
                'question': question.question_text,
                'options': json.loads(question.options),
                'answer': question.correct_answer
            })

    return jsonify({'tech_questions': technical_questions}), 200


@question_management_bp.route('/fetch_coding_question', methods=['POST'])
def fetch_coding_question():
    # Get candidate name and job_id in Json
    data = request.get_json()
    candidate_name=data.get('candidate_name')
    job_id = data.get('job_id')

    if not candidate_name or not job_id:
        return jsonify({'error': 'Candidate name and job_id are required parameters.'}), 400
    
    # Normalize candidate name for consistency
    # Convert to lowercase and remove extra spaces
    normalized_candidate_name=candidate_name.replace(" ", "").lower().strip()
    # Find the candidate record with the highest version number
    candidate = Candidate.query.filter(func.lower(func.replace(Candidate.name, " ", "")) == normalized_candidate_name, Candidate.job_id == job_id).order_by(Candidate.version_number.desc()).first()

    if not candidate:
        return jsonify({'error': 'Candidate not found for the given job_id.'}), 404
    # Get the version number from the candidate record
    version_number = candidate.version_number
    # Fetch coding question
    coding_question = {}
    if candidate.job.coding_questions:
        for coding_question_data in candidate.job.coding_questions:
            if coding_question_data.version_number == version_number and coding_question_data.name.replace(" ", "").lower().strip() == normalized_candidate_name and coding_question_data.job_id == job_id:
                coding_question = {
                    'question': coding_question_data.question_text,
                    'sample_input': coding_question_data.sample_input,
                    'sample_output': coding_question_data.sample_output
                }
                break  # Stop searching once the correct version is found
    
    return jsonify({'coding_question': coding_question}), 200