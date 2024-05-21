from flask import Blueprint, request, jsonify
"""from models import *
from app import *"""


response_evaluate_bp = Blueprint('response_evaluate', __name__)

## 4 Screen 
## To process the audio generated for behav questions
# API endpoint for processing audio
##Audio (blob to webm to wav)


# API endpoint for processing audio
@response_evaluate_bp.route('/blob_process_audio', methods=['POST'])
def blob_process_audio():
    data = request.form
    question = data.get('question')
    candidate_name = data.get('candidate_name')
    job_id = data.get('job_id')
    audio_blob = request.files['audio']

    if not question or not candidate_name or not job_id or not audio_blob:
        return jsonify({'error': 'Missing required parameters.'}), 400
    
    # Generate a unique filename for the audio file
    unique_filename = f"{candidate_name}_{uuid.uuid4().hex}.wav"

    # Store audio file locally as WebM format
    audio_folder = os.path.join('audio_file_folder', candidate_name)
    if not os.path.exists(audio_folder):
        os.makedirs(audio_folder)
    
    webm_file_path = os.path.join(audio_folder, unique_filename)
    audio_blob.save(webm_file_path)


    # Transcribe audio from the WAV file
    with open(webm_file_path, "rb") as wav_file:
        transcript = client.audio.transcriptions.create(
            model="whisper-1", 
            file=wav_file,
            response_format="text"
        )
    
    try:
        # Store transcription in the database
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
    
###
## Code score api 

## User defined fucntion to call openai and score the code 
def perform_code_assessment(question, code):


        ## code assesssment requirement

    factors=""""
    When assessing coding skills, there are several factors to consider to gauge a candidate's proficiency and effectiveness. Here are some key factors to assess:

    Correctness: Determine whether the solution provided by the candidate is correct. This involves verifying that the code produces the expected output for various test cases and edge cases.

    Efficiency: Assess the efficiency of the solution in terms of time complexity and space complexity. Evaluate whether the code optimally utilizes computational resources and scales well with increasing input sizes.

    Clarity and Readability: Evaluate the clarity and readability of the code. Assess whether the code is well-organized, follows coding conventions, and uses meaningful variable names and comments to enhance understanding.

    Modularity and Maintainability: Consider the modularity of the code and its ability to be easily maintained and extended. Assess whether the code is structured into reusable functions or classes and whether it adheres to principles such as DRY (Don't Repeat Yourself) and separation of concerns.

    Edge Cases Handling: Evaluate how well the code handles edge cases and boundary conditions. Assess whether the solution is robust enough to handle unexpected inputs and edge cases without crashing or producing incorrect results.

    Error Handling and Robustness: Assess the code's error handling mechanisms and its ability to gracefully handle errors and exceptions. Evaluate whether the code includes appropriate error checks and validation to prevent unexpected behavior.

    Testing: Consider whether the candidate has included test cases to validate the correctness of their solution. Assess the comprehensiveness of the test cases and whether they cover various scenarios and edge cases.

    Optimization: Evaluate whether the candidate has applied optimization techniques to improve the performance of their code. Assess whether they have chosen appropriate data structures and algorithms and have optimized critical sections of the code where necessary.

    Language Proficiency: Assess the candidate's proficiency in the programming language used to solve the problem. Consider whether they demonstrate a good understanding of language features, syntax, and idiomatic usage.

    Problem-Solving Approach: Evaluate the candidate's problem-solving skills and their ability to decompose complex problems into smaller, manageable subproblems. Consider whether they have chosen an appropriate algorithmic approach and have effectively implemented it in code.

    By considering these factors, you can gain a comprehensive understanding of a candidate's coding abilities and make informed decisions about their suitability for a given role or task.

    """

    code=code ## user code 
    response_data89=question

    message190=[
                {"role": "system", "content":
            """
            You act like a coding assesment tool, based on the given code for given problem statement , use the {factors}
    as marking scheme and give scores with each sub headings given in {factors} ,score it out of 10.

    the problem statement details for the code is {response_data89} given in json format along with sample input nad output and the code snippet of the assessment is given  in this variable {code}
    All these should be JSON formated like below , where code_score , question can be taken from {response_data89} and user_code can be obtained from the variable {code}
    Always the repsone should only be in JSON format like below structure no other string should be added.
    {
    "code_score":
    {
    "Correctness":,
    "Efficiency":,
    "Clarity_and_Readability":,
    "Modularity and Maintainability":,
    "Edge Cases Handling":,
    "Error Handling and Robustness":,
    "Testing":,
    "Optimization":,
    "Language_Proficiency":,
    "Problem-Solving_Approach":,
    "OVERALL_SCORE":"12/100",
    },
    {
    "coding_question":{
    "question":,
    "sample_input":,
    "sample_output":
    },
    {
    "user_code":{}
    }
    }
    """},
    {"role":"user","content":f"the problem statement details for the code is {response_data89} and the code snippet to do assessment on the code {code},always give the score for each key out of 10 and calculate the total score and assign to OVERALL_SCORE key, dont need any further expalnation of score , just the key with score is enough in json.Always the score should be given coorectly ,even if the same {response_data89} and {code} is given to multiple times,you should give the same values for same response and code given. "
    }]
    response190 = client.chat.completions.create(
            model="gpt-4",
            messages=message190,
            response_format={"type":"json_object"},
            
            max_tokens=1000
        
        )
    response190 = dict(response190)
    assessment_response = dict(dict(response190['choices'][0])['message'])[
                'content'].replace("\n", " ")
        # Remove extra spaces
    assessment_response = ' '.join(assessment_response.split())
    print("going to return ")
    return (assessment_response)


# Api to do code scoring   
@response_evaluate_bp.route('/store_code_response', methods=['POST'])
def store_code_response():
    # Extract inputs from request JSON
    data = request.get_json()
    job_id = data.get('job_id')
    name = data.get('name')
    question = data.get('question')
    code = data.get('code')

    if not job_id or not name or not question or not code:
        return jsonify({'error': 'Missing required parameters.'}), 400

    # Perform code assessment using OpenAI
    assessment_response = perform_code_assessment(question, code)

    # Store the assessment response in the database
    try:
        # Check if there is an existing entry for the same name and job_id
        existing_entry = CodeResponse.query.filter_by(name=name, job_id=job_id).first()
        if existing_entry:
            db.session.delete(existing_entry)
            db.session.commit()

        # Create a new entry in the CodeResponse table
        new_response = CodeResponse(
            job_id=job_id,
            name=name,
            code_response=assessment_response
        )
        db.session.add(new_response)
        db.session.commit()

        # Normalize the candidate name for consistency
        normalized_name = name.replace(" ", "").lower().strip()

        # Update assessment_status in ResumeScore table
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

## To evaluate the techincal question and score it 

# user defined fucntion to ask open ai to evaluate
def perform_techmcq_assessment(mcq_question):
    
    response_data89=mcq_question

    message10=[
                {"role": "system", "content":
            """
                You act like a Technical MCQ assesment tool, where you would be given a Json which consists of MCQ question in {response_data89} along with mutiple choices and user selected choice.
                so , what you have to do is that, you need to evaluate the MCQ question agianst correct answer and user answer, find your self the correct answer.
                Regarding Markings, each question carries 1 mark and 0 for wrong answer, so have variable mcq_score which stores the total score.
                Also if the user selected right answer give the selected choice as right or else wrong.
                Finally the response from you should be in Json format.
                Always the repsone should only be in JSON format like below structure no other string should be added.and in correct and user answer option variable like a or b or c should not be there ,the enitre choice should be there for both.

                {
                'tech_report':
                {
                "Total_score": correct answer  /number of question  ie 12/20,
                }
                {
                "questions":
                {
                "question":,
                "correct_answer":
                "user_answer":,
                "Selected_choice":"right"
                }
                {
                "question":,
                "correct_answer":
                "user_answer":,
                "Selected_choice":"wrong"
                }
                }
                }

    """},
    {"role":"user","content":f"for the given mcq questions along with options and user selected options in {response_data89}, evaluate it as explained , agaist correct option and user selcted option , give each question 1 mark if it is correct or else 0 mark ofrwrong answer,finally the total score should be obtained.Make sure to give the response only in josn format in key value pairs, dont add unwanted string in the response"
    }]
    response10 = client.chat.completions.create(
            model="gpt-4",
            messages=message10,
            
            max_tokens=1000
        
        )
    response10 = dict(response10)
    tech_assessment_response = dict(dict(response10['choices'][0])['message'])[
                'content'].replace("\n", " ")
        # Remove extra spaces
    tech_assessment_response = ' '.join(tech_assessment_response.split())
    return (tech_assessment_response)
        
## API to store and do tech_msq evaluate 
@response_evaluate_bp.route('/store_tech_response', methods=['POST'])
def store_tech_response():
    # Extract inputs from request JSON
    data = request.get_json()
    job_id = data.get('job_id')
    name = data.get('name')
    question = data.get('question')
    
    if not job_id or not name or not question:
        return jsonify({'error': 'Missing required parameters.'}), 400

    # Perform technical MCQ question response generation using user-defined function
    tech_response = perform_techmcq_assessment(question)

    # Store the tech response in the database
    try:
        # Check if there is an existing entry for the same name and job_id
        existing_entry = TechResponse.query.filter_by(name=name, job_id=job_id).first()
        if existing_entry:
            db.session.delete(existing_entry)
            db.session.commit()

        # Create a new entry in the TechResponse table
        new_response = TechResponse(
            job_id=job_id,
            name=name,
            tech_response=tech_response
        )
        db.session.add(new_response)
        db.session.commit()

        # Normalize the candidate name for consistency
        normalized_name = name.replace(" ", "").lower().strip()

        # Update assessment_status in ResumeScore table
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

## To fetch the user response after the assessment (all types of questions)
@response_evaluate_bp.route('/fetch_user_responses', methods=['POST'])
def fetch_user_responses():
    data = request.get_json()
    candidate_name = data.get('candidate_name')
    job_id = data.get('job_id')

    # Normalize the candidate name for consistency
    normalized_name = candidate_name.replace(" ", "").lower().strip()

        # Update assessment_status in ResumeScore table
    resume_score_entry = ResumeScore.query.filter(
        func.lower(func.replace(ResumeScore.name, " ", "")) == normalized_name,
        ResumeScore.job_id == job_id
    ).first()

    # Check if assessment status is 1
    resume_score_entry = ResumeScore.query.filter(
        func.lower(func.replace(ResumeScore.name, " ", "")) == normalized_name,
        ResumeScore.job_id == job_id
    ).first()
    
    if not resume_score_entry or resume_score_entry.assessment_status != 1:
        return jsonify({'error': 'Assessment not completed or not found.'}), 400

    # Fetch data from CodeResponse table
    # Fetch code response
    code_responses = CodeResponse.query.filter(
        func.lower(func.replace(CodeResponse.name, " ", "")) == normalized_name,
        CodeResponse.job_id == job_id
    ).all()
    # Fetch tech response
    tech_responses = TechResponse.query.filter(
        func.lower(func.replace(TechResponse.name, " ", "")) == normalized_name,
        TechResponse.job_id == job_id
    ).all()

        # Fetch audio transcription
    audio_transcriptions = AudioTranscription.query.filter(
        func.lower(func.replace(AudioTranscription.name, " ", "")) == normalized_name,
        AudioTranscription.job_id == job_id
    ).all()

        # Process the audio_transcriptions to format them correctly if needed
    formatted_audio_transcriptions = []
    for audio_transcription in audio_transcriptions:
        formatted_audio_transcriptions.append({
            'question': audio_transcription.question,
            'User_response': audio_transcription.audio_transcript
        })
    # Format the data
    formatted_data = {
        'candidate_name':candidate_name,
        'job_id':job_id,
        'code_response': [code_response.code_response for code_response in code_responses],
        'tech_response': [tech_response.tech_response for tech_response in tech_responses],
        'audio_transcript':formatted_audio_transcriptions
    }

    return jsonify(formatted_data), 200