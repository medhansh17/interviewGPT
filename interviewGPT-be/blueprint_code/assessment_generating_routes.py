from flask import Blueprint, request, jsonify
"""from models import *
from app import *"""

assessment_bp = Blueprint('assessment', __name__)

##QUESTION GENERATION 
##user defined function for each type of question 

def tech_question_mcq(jd13,no_tech_questions,Tech_skills):

    # To generate technical mcq
    
    message=[
                {"role": "system", "content":
        """You act as an  technical Recuruitment Professional with several years of experience ie more than 10+years  working in tech industry.With all your years of expertise in interviewing candidates.Always follow the output format, it should always be in JSON like ,
        {
    "tech_questions":[ {
        "question": "What is the purpose of a firewall in a network?",
        "options": {
        "A": "Prevents hacker attacks",
        "B": "Reduces network traffic",
        "C": "Increases network speed",
        "D": "Bypass security protocols"
        },
        "answer": "A"
    },
    {
        "question": "What is the primary purpose of an operating system?",
        "options": {
        "A": "Manage the computer's resources",
        "B": "Provide an interface for users to interact with the computer",
        "C": "Run applications on the computer",
        "D": "All of the above"
        },
        "answer": "D"
    }]
    }

    
    this is how the response should be from you !!

    """},
                {"role": "user", "content":f"""always manadotry to Generate {no_tech_questions} technical question, the difficulty level should be medium to hard, should not be easy questions,even question should not repeat.
                important information, options sshould be too hard, so that candiate can get confuse easily with other choices.
                Questions should be entirely based on job description {jd13} and candiate technical skills found from {Tech_skills}.
                """}
                
            ]

    tech_response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=message,
            
            max_tokens=1000
        
        )
    tech_response = dict(tech_response)
    tech_response = dict(dict(tech_response['choices'][0])['message'])[
                'content'].replace("\n", " ")
        # Remove extra spaces
    tech_response = ' '.join(tech_response.split())
    return (tech_response)

 #To generate Behaiviour questions
def behaviour_questions(no_behav_questions,behav_skills):
    
    
    message=[
                {"role": "system", "content":
        """You act as an Recuruitment Professional with several years of experience ie more than 10+years  working in tech industry.With all your years of expertise in interviewing candidates.Always follow the output format, it should always be in JSON like ,
    Always give 1st question as "Tell me about yourself".
        {
        "Behaviour_q":[
        {
            "b_question_id":"1",
            "b_question_text":"Tell me about yourself ?"
        },
        {
            "b_question_id":"2",
            "b_question_text":"Describe a situation where you had a conflict with team members ?"

        }]

        }
    b_question_id should always start from 1.
    this is how the response should be from you !!

    """},
                {"role": "user", "content":f"always manadotry to Generate {no_behav_questions} behaivour questions not more than that,and based on behaviour skills which candidate have {behav_skills}, if they dont have,give a question by your choice.ie soft skill question"}
                
            ]

    behav_response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=message,
            
            max_tokens=1000
        
        )
    behav_response= dict(behav_response)
    behav_response = dict(dict(behav_response['choices'][0])['message'])[
                'content'].replace("\n", " ")
        # Remove extra spaces
    behav_response = ' '.join(behav_response.split())
    return (behav_response)
#TO generate coding question 
def coding_question_generate():

    
    message=[
                {"role": "system", "content":
        """You act as  hackerrank application.With all your years of expertise in interviewing candidates,
    Generate a one coding questions in medium level related to Data strucutres, follow the format , this is how the result should look like below,
    Always have a problem statement in question key , have sample input and output in different key as below , also give 3 testcases for that question.

    {
    "coding_question":{
    "question":"An array is a type of data structure that stores elements of the same type in a contiguous block of memory. In an array, , of size , each memory location has some unique index,  (where ), that can be referenced as  or .Reverse an array of integers.",
    "sample_input":"
        4
        1 4 3 2",
    "sample_output:"2 3 4 1"
    }
    }
    this is how the response should be from you !!

    """},
                {"role": "user", "content":"Generate coding question, questions should not repeat."}
                
            ]

    coding_response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=message,
            
            max_tokens=1000
        
        )
    coding_response = dict(coding_response)
    coding_response = dict(dict(coding_response['choices'][0])['message'])[
                'content'].replace("\n", " ")
        # Remove extra spaces
    coding_response = ' '.join(coding_response.split())
    return (coding_response)

def tech_question_mcq(jd13,no_tech_questions,Tech_skills):

    # To generate technical mcq
    
    message=[
                {"role": "system", "content":
        """You act as an  technical Recuruitment Professional with several years of experience ie more than 10+years  working in tech industry.With all your years of expertise in interviewing candidates.Always follow the output format, it should always be in JSON like ,
        {
    "tech_questions":[ {
        "question": "What is the purpose of a firewall in a network?",
        "options": {
        "A": "Prevents hacker attacks",
        "B": "Reduces network traffic",
        "C": "Increases network speed",
        "D": "Bypass security protocols"
        },
        "answer": "A"
    },
    {
        "question": "What is the primary purpose of an operating system?",
        "options": {
        "A": "Manage the computer's resources",
        "B": "Provide an interface for users to interact with the computer",
        "C": "Run applications on the computer",
        "D": "All of the above"
        },
        "answer": "D"
    }]
    }

    
    this is how the response should be from you !!

    """},
                {"role": "user", "content":f"""always manadotry to Generate {no_tech_questions} technical question, the difficulty level should be medium to hard, should not be easy questions,even question should not repeat.
                important information, options sshould be too hard, so that candiate can get confuse easily with other choices.
                Questions should be entirely based on job description {jd13} and candiate technical skills found from {Tech_skills}.
                """}
                
            ]

    tech_response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=message,
            
            max_tokens=1000
        
        )
    tech_response = dict(tech_response)
    tech_response = dict(dict(tech_response['choices'][0])['message'])[
                'content'].replace("\n", " ")
        # Remove extra spaces
    tech_response = ' '.join(tech_response.split())
    return (tech_response)

 #To generate Behaiviour questions
def behaviour_questions(no_behav_questions,behav_skills):
    
    
    message=[
                {"role": "system", "content":
        """You act as an Recuruitment Professional with several years of experience ie more than 10+years  working in tech industry.With all your years of expertise in interviewing candidates.Always follow the output format, it should always be in JSON like ,
    Always give 1st question as "Tell me about yourself".
        {
        "Behaviour_q":[
        {
            "b_question_id":"1",
            "b_question_text":"Tell me about yourself ?"
        },
        {
            "b_question_id":"2",
            "b_question_text":"Describe a situation where you had a conflict with team members ?"

        }]

        }
    b_question_id should always start from 1.
    this is how the response should be from you !!

    """},
                {"role": "user", "content":f"always manadotry to Generate {no_behav_questions} number of behaivour questions,and based on behaviour skills which candidate have {behav_skills}, if they dont have,give a question by your choice.ie soft skill question"}
                
            ]

    behav_response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=message,
            
            max_tokens=1000
        
        )
    behav_response= dict(behav_response)
    behav_response = dict(dict(behav_response['choices'][0])['message'])[
                'content'].replace("\n", " ")
        # Remove extra spaces
    behav_response = ' '.join(behav_response.split())
    return (behav_response)
#TO generate coding question 
def coding_question_generate():

    
    message=[
                {"role": "system", "content":
        """You act as  hackerrank application.With all your years of expertise in interviewing candidates,
    Generate a one coding questions in medium level related to Data strucutres, follow the format , this is how the result should look like below,
    Always have a problem statement in question key , have sample input and output in different key as below , also give 3 testcases for that question.

    {
    "coding_question":{
    "question":"An array is a type of data structure that stores elements of the same type in a contiguous block of memory. In an array, , of size , each memory location has some unique index,  (where ), that can be referenced as  or .Reverse an array of integers.",
    "sample_input":"
        4
        1 4 3 2",
    "sample_output:"2 3 4 1"
    }
    }
    this is how the response should be from you !!

    """},
                {"role": "user", "content":"Generate coding question, questions should not repeat."}
                
            ]

    coding_response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=message,
            
            max_tokens=1000
        
        )
    coding_response = dict(coding_response)
    coding_response = dict(dict(coding_response['choices'][0])['message'])[
                'content'].replace("\n", " ")
        # Remove extra spaces
    coding_response = ' '.join(coding_response.split())
    return (coding_response)

def save_assessment_to_db(job_id, role, candidate_name, tech_questions, behaviour_questions, coding_question,version_number):
    # Create or retrieve job record
    job = Job.query.get(job_id)
    if not job:
        return jsonify({'error': 'Invalid job ID.'}), 400

    # Create or retrieve candidate record
    candidate = Candidate.query.filter_by(name=candidate_name).first()
    if not candidate:
        # If candidate does not exist, it's the first assessment, so set version number to 1
        version_number=1
        candidate = Candidate(name=candidate_name, job_id=job_id,version_number=version_number)
        db.session.add(candidate)
        db.session.commit()
    else:
        # If candidate exists, increment the version number
        candidate.version_number += 1
        db.session.commit()
        

    # Save technical questions
    for question in tech_questions:
        tech_question = TechnicalQuestion(question_text=question['question'], options=json.dumps(question['options']), correct_answer=question['answer'], job_id=job_id,name=candidate_name,version_number=version_number)
        db.session.add(tech_question)
        # Commit the technical question to the database to obtain its ID
        #db.session.add(tech_question)
        db.session.commit()
        

        # Print the ID to ensure it's not None
        print("Tech Question ID:", tech_question.id)
        # Associate question with candidate
        candidate_question = CandidateQuestion(candidate_id=candidate.id, question_type='technical', question_id=tech_question.id, job_id=job_id,name=candidate_name,version_number=version_number)
        db.session.add(candidate_question)
        

    print("Behaviour Questions:", behaviour_questions)
    # Save behavioural questions
    for question in behaviour_questions:
        # Print the question object to check its structure and values
        print("Behaviour Question:", question)
        behav_question = BehaviouralQuestion(question_text=question['b_question_text'], job_id=job_id,name=candidate_name,version_number=version_number)
        db.session.add(behav_question)
         # Print the newly created behavioural question object to check its attributes
        print("New Behavioural Question:", behav_question)
        # Commit the behavioural question to the database to obtain its ID
        db.session.add(behav_question)
        db.session.commit()
        # Print the ID to ensure it's not None
        print("Behaviour Question ID:", behav_question.id)
        # Associate question with candidate
        candidate_question = CandidateQuestion(candidate_id=candidate.id, question_type='behavioural', question_id=behav_question.id, job_id=job_id,name=candidate_name,version_number=version_number)
        db.session.add(candidate_question)
        # Print the newly created candidate question object to check its attributes
        print("New Candidate Question:", candidate_question)

    # Save coding question
    coding_question = CodingQuestion(question_text=coding_question['question'], sample_input=coding_question['sample_input'], sample_output=coding_question['sample_output'], job_id=job_id,name=candidate_name,version_number=version_number)
    db.session.add(coding_question)
    db.session.commit()

    # Print the ID to ensure it's not None
    print("Coding Question ID:", coding_question.id)
    # Associate question with candidate
    candidate_question = CandidateQuestion(candidate_id=candidate.id, question_type='coding', question_id=coding_question.id, job_id=job_id,name=candidate_name,version_number=version_number)
    db.session.add(candidate_question)

    # Save assessment attempt
    assessment_attempt = AssessmentAttempt(candidate_id=candidate.id, job_id=job_id,version_number=version_number)
    db.session.add(assessment_attempt)

    db.session.commit()

    return jsonify({'message': 'Assessment data saved successfully.'}), 200

## SAMPLE THREAD FOR AUTO ASSESSMT USING THREAD
def generate_and_save_assessment(job_id, candidate_name, no_tech_questions, no_behav_questions, resume_score_id):
    with app.app_context():
        try:
            resume_score = ResumeScore.query.get(resume_score_id)

            if resume_score is None:
                raise ValueError("ResumeScore not found")
            
            print("thread_started")
            # Query the ResumeScore table to find the selected status of the candidate
            selected_status = resume_score.selected_status

            if not selected_status:
                # If the candidate is in a rejected state, return an error message
                #return jsonify({'error': 'Candidate is in a rejected state.'})
                #print("error': 'Candidate is in a rejected state.")
                resume_score.status = 'candidate_rejected'
                db.session.commit()
                return

            # Proceed with generating assessment questions
            job = Job.query.get(job_id)
            jd = job.jd
            role = job.role

            # Convert candidate name to lowercase without spaces for comparison
            candidate_name_formatted = candidate_name.lower().replace(" ", "")
            # Delete from TechnicalQuestion
            TechnicalQuestion.query.filter(
                    func.lower(func.replace(TechnicalQuestion.name, " ", "")) == candidate_name_formatted,
                    TechnicalQuestion.job_id == job_id
                ).delete()

            # Delete from BehaviouralQuestion
            BehaviouralQuestion.query.filter(
                    func.lower(func.replace(BehaviouralQuestion.name, " ", "")) == candidate_name_formatted,
                    BehaviouralQuestion.job_id == job_id
                ).delete()

            # Delete from CodingQuestion
            CodingQuestion.query.filter(
                    func.lower(func.replace(CodingQuestion.name, " ", "")) == candidate_name_formatted,
                    CodingQuestion.job_id == job_id
                ).delete()

            db.session.commit()  
            print("old question deleted")
            # Query the database to find the candidate's technical and behavioral skills
            candidate_name_formatted = candidate_name.lower().replace(" ", "")
            # Query the database to find the candidate's technical and behavioral skills
            candidate_info = ExtractedInfo.query.filter_by(job_id=job_id).filter(func.lower(func.replace(ExtractedInfo.name, " ", "")) == candidate_name_formatted).first()
            # Check if candidate already has records for this job
            # Version control code
            existing_candidate = Candidate.query \
                .filter(func.lower(func.replace(Candidate.name, " ", "")) == candidate_name_formatted) \
                .filter_by(job_id=job_id) \
                .first()

            if existing_candidate:
                # If candidate already has records, get the highest version number and increment it by 1
                existing_version_number = db.session.query(func.max(Candidate.version_number)) \
                    .filter_by(name=candidate_name, job_id=job_id) \
                    .scalar()
                if existing_version_number is None:
                    version_number = 1
                else:
                    version_number = existing_version_number + 1
            else:
                # If it's the first time generating questions for the candidate and job, set version number to 1
                version_number = 1

            #till here version code

            # If candidate_info exists, proceed with generating assessment questions
            if candidate_info:
                # Extract technical and behavioral skills
                technical_skills = candidate_info.tech_skill
                behavioral_skills = candidate_info.behaviour_skill

                # Generate technical, behavioral, and coding questions
                question_tech = tech_question_mcq(jd, no_tech_questions, technical_skills)
                question_behav = behaviour_questions(no_behav_questions, behavioral_skills)
                question_coding = coding_question_generate()
                print("question genraion fucntion called")
                # Convert questions to JSON format
                tech_questions_json = json.loads(question_tech).get('tech_questions', [])
                behaviour_questions_json = json.loads(question_behav).get('Behaviour_q', [])
                coding_question_json = json.loads(question_coding).get('coding_question', {})

                # Save assessment data to the database
                save_assessment_to_db(job_id, role, candidate_name, tech_questions_json, behaviour_questions_json, coding_question_json, version_number)
                print("question saved in")
                # Update the status to "assessment_generated"
                resume_score.status = 'assessment_generated'
                db.session.commit()
            else:
                
                #return jsonify({'error': 'Candidate information not found.'})
                print("'error': 'Candidate information not found.'")
                # Update the status to "candidate_info_not_found"
                resume_score.status = 'candidate_info_not_found'
                db.session.commit()
    
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

        if not job_id or not candidate_name:
            return jsonify({'error': 'Job ID and candidate name are required parameters.'}), 400

        candidate_name_formatted = candidate_name.lower().replace(" ", "")
        resume_score = ResumeScore.query.filter_by(job_id=job_id).filter(func.lower(func.replace(ResumeScore.name, " ", "")) == candidate_name_formatted).first()

        if resume_score:
            resume_score.status = 'generating_assessment'
            db.session.commit()

            thread = Thread(target=generate_and_save_assessment, args=(job_id, candidate_name, no_tech_questions, no_behav_questions, resume_score.id))
            thread.start()

            return jsonify({'message': 'Assessment generation started.'}), 200
        else:
            return jsonify({'error': 'Resume score record not found for the candidate.'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
# for the aprroval of questions 
@assessment_bp.route('/fetch_candidate_questions_after_selected', methods=['POST'])
def fetch_candidate_questions():
    # Get candidate name and job_id IN JSON
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

    # Fetch technical questions
    technical_questions = []
    for question in candidate.job.technical_questions:
        if question.version_number == version_number and question.name.replace(" ", "").lower().strip() == normalized_candidate_name and question.job_id == job_id:
            technical_questions.append({
                'question': question.question_text,
                'options': json.loads(question.options),
                'answer': question.correct_answer,
                'tech_ques_id':question.id
            })

    # Fetch behavioural questions
    behavioural_questions = []
    for question in candidate.job.behavioural_questions:
        if question.version_number == version_number and question.name.replace(" ", "").lower().strip() == normalized_candidate_name and question.job_id == job_id:
            behavioural_questions.append({
                'b_question_id': question.id,
                'b_question_text': question.question_text
            })
    
    # Fetch coding question with the specific version number
    coding_question = {}
    if candidate.job.coding_questions:
        for coding_question_data in candidate.job.coding_questions:
            if coding_question_data.version_number == version_number and coding_question_data.name.replace(" ", "").lower().strip() == normalized_candidate_name and coding_question_data.job_id == job_id:
                coding_question = {
                    'question': coding_question_data.question_text,
                    'sample_input': coding_question_data.sample_input,
                    'sample_output': coding_question_data.sample_output,
                    'coding_ques_id':coding_question_data.id
                }
                break  # Stop searching once the correct version is found
    return jsonify({
        'tech_questions': technical_questions,
        'Behaviour_q': behavioural_questions,
        'coding_question': coding_question
    }), 200
    
