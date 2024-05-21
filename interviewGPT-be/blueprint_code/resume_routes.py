from flask import Blueprint, request, jsonify
"""from models import *
from app import *
import os
import PyPDF2
from PyPDF2 import PdfReader
import json
from threading import Thread
import shutil
from datetime import datetime
import uuid
from werkzeug.utils import secure_filename"""

ats_bp = Blueprint('ats', __name__)








# API endpoint to fetch extracted_info table details based on candidate name and job_id
# After selecting the candiate name it should display the his/her details
@ats_bp.route('/extracted_info', methods=['GET'])
def get_extracted_info():
    # Get the candidate name and job ID from the query parameters
    candidate_name = request.args.get('candidate_name')
    job_id = request.args.get('job_id')

    # Validate if both candidate name and job ID are provided
    if not candidate_name or not job_id:
        return jsonify({'error': 'Candidate name and job ID are required in the query parameters'}), 400

    # Get the extracted_info details from the database based on the provided candidate name (case-insensitive) and job ID
    extracted_info = ExtractedInfo.query.filter(
        ExtractedInfo.job_id == job_id,
        ExtractedInfo.resume_id.ilike(candidate_name)  # Perform case-insensitive match
    ).first()

    if extracted_info:
        # Construct a dictionary containing the extracted_info details
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
            # Add other fields as needed
        }
        return jsonify({'extracted_info_details': extracted_info_details}), 200
    else:
        return jsonify({'error': 'Extracted info not found for the provided candidate name and job ID'}), 404
#2nd screen search bar
@ats_bp.route('/search_jobs', methods=['GET'])
def search_jobs():

    role=request.args.get('role')
    job_id=request.args.get('job_id')

    # Get the job details from the database based on the provided job_id
    job = Job.query.get(job_id)

    if job:
        # Construct a dictionary containing the job details
        job_details = {
            'job_id': job.id,
            'role': job.role,
            'jd': job.jd
            # Add other fields as needed
        }
        return jsonify({'job_details': job_details}), 200
    else:
        return jsonify({'error': 'Job not found'}), 404
########################
# 3nd screen
## Thread concept functionality code
#thread to execute the extract_resume_info function
def extract_resume_info(job_id, role):
    with app.app_context():

        # Get resume scores for the given job_id
        resume_scores_list = ResumeScore.query.filter_by(job_id=job_id).all()

        # Get the filenames of already processed resumes
        processed_filenames = [resume.resume_filename for resume in resume_scores_list]

        # Initialize an empty string to store extracted text from all resumes
        text_resume = ""
        path = os.path.join(resume_folder, role)
        
        # Iterate through each file in the resumes folder
        for filename in os.listdir(path):
            if filename.endswith(".pdf") and filename not in processed_filenames:  # Check if the file is a PDF and not processed:  # Check if the file is a PDF
                file_path = os.path.join(path, filename)  # Get the full file path
                reader = PyPDF2.PdfReader(file_path)
                
                # Add a separator with the filename before extracting text from each PDF
                text_resume += f"Text extracted from: {filename}\n"
                
                # Iterate through each page of the PDF and extract text
                for page in reader.pages:
                    text_resume += page.extract_text()
                    text_resume += "\n"  # Add a newline after each page
                
                # Add a separator between different PDFs
                text_resume += "\n---\n"
        print("pdf content")
        print(text_resume)
        # prompt template for open ai 
        message_resumefetch = [
            {"role": "system", "content": """
            You act like as ATS tool, where you get {text_resume}resume of candidate,You will get multiple resumes or single resume that will vary,each resume will be differentiated by "Text extracted from: {filename}",so from that resume
            extract the information like candidate name, date of birth, work experience in years, phone number, address, email id, linkedin link, github link, technical skills, soft skills.
            IF total year of experience is not given, then you do analysis of total years the candidate worked in different company, and say total years of experience, not the company name details,Always avoid hallucination-problem,the extracted information should be in JSON format like below example:
            IF any key values is not there, mention as "NIL", don't need explanation, just the JSON details like below
            {
                "resume_details": [
                    {
                        "candidate_name": "KEERTHI GANESH M",
                        "work_exp": "3 YEARS",
                        "phone_number": "78787878787",
                        "address": "KAIALSH NAGAR TRICHY, TAMIL NADU",
                        "email_id": "KEERTHI@GMAIL.COM",
                        "linkedin_id": " "https://linkedin.com/keerthi",
                        "github_id": ,
                        "technical_skills": ["PYTHON", "DEVOPS", "SQL", "AI"],
                        "soft_skills": ["GOOD COMMUNICATION", "TEAM PLAYER"],
                        "date_of_birth": "04-09-1998",
                        "nationality": "Indian"
                    },
                    {
                        "candidate_name": "kishore M",
                        "work_exp": "1 YEARS",
                        "phone_number": "345678983",
                        "address": "balaji street,kerala",
                        "email_id": "kishore@GMAIL.COM",
                        "linkedin_id": "https://linkedin.com/kishore",
                        "github_id": ,
                        "technical_skills": ["c++", "springboot", "JAVA", "REACT"],
                        "soft_skills": ["COMMUNICATION", "CRITICAL THINKER"],
                        "date_of_birth": "20-11-2000",
                        "nationality": "Indian"
                    }
                ]
            }
            if only one resume is given the give the response like below
            {
                "resume_details": [
                    {
                        "candidate_name": "KEERTHI GANESH M",
                        "work_exp": "3 YEARS",
                        "phone_number": "78787878787",
                        "address": "KAIALSH NAGAR TRICHY , TAMIL NADU",
                        "email_id": "KEERTHI@GMAIL.COM",
                        "linkedin_id": ,
                        "github_id": ,
                        "technical_skills": ["PYTHON", "DEVOPS", "SQL", "AI"],
                        "soft_skills": ["GOOD COMMUNICATION", "TEAM PLAYER"],
                        "date_of_birth": "04-09-1998",
                        "nationality": "Indian"
                    }
                ]
            }
            """
            },
            {"role": "user", "content": f"""use the {text_resume} resume to details which are stated like name (get full name with inital if it is there), work experience,phone number,address,email id, linkedin id and github id
             fetch all the techincal skills and soft skills separtely dont mix it from the resume {text_resume}  and give the details as per instructed.If years of experience are not explicitly mentioned in the {text_resume}, calculate the total years of experience based on the dates provided in the candidate's employment history and use it for work_exp """}

        ]

        client = OpenAI()
        # Set up OpenAI API key
        client.api_key = os.getenv("OPENAI_API_KEY")

        response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=message_resumefetch,
            max_tokens=1000
        )
        response = dict(response)
        response_data = dict(dict(response['choices'][0])['message'])[
            'content'].replace("\n", " ")
        # Remove extra spaces
        response_data = ' '.join(response_data.split())
        
        # Remove unwanted characters from the response data
        response_data = response_data.strip().strip('```json').strip().strip('```')
        print("response_data")
        print(response_data)
        # Parse the JSON data containing extracted details
        extracted_info = json.loads(response_data)
        
        # Iterate through each resume detail extracted by OpenAI and save it to the database
        try:
            for resume_detail in extracted_info['resume_details']:
                # Add a new record if it doesn't already exist
                extracted_record = ExtractedInfo(
                    job_id=job_id,
                    resume_id=resume_detail['candidate_name'],  # Use candidate name as resume ID
                    name=resume_detail.get('candidate_name', 'NIL'),
                    total_experience=resume_detail.get('work_exp', 'NIL'),
                    phone_number=resume_detail.get('phone_number', 'NIL'),
                    email_id=resume_detail.get('email_id', 'NIL'),
                    address=resume_detail.get('address', 'NIL'),
                    linkedin_id=resume_detail.get('linkedin_id', 'NIL'),
                    github_id=resume_detail.get('github_id', 'NIL'),
                    nationality=resume_detail.get('nationality', 'NIL'),
                    tech_skill=resume_detail.get('technical_skills', []),
                    behaviour_skill=resume_detail.get('soft_skills', []),
                    date_of_birth=resume_detail.get('date_of_birth', 'NIL')
                )
                db.session.add(extracted_record)

            # Commit changes to the database
            db.session.commit()

            return jsonify({'message': 'Information extracted and saved successfully.'}), 200
        
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
#thread to execute the calculate_resume_scores function
#function to support calculate_resume_score (resume_details_extract and chatgpt_message)
def resume_details_extract(role,job_id):
   
    
    # Get resume scores for the given job_id
    resume_scores = ResumeScore.query.filter_by(job_id=job_id).all()

    # Get the filenames of already processed resumes
    processed_filenames = [resume.resume_filename for resume in resume_scores]

    # Define the directory containing your PDF files
    directory = os.path.join(resume_folder,role)

    # Initialize an empty string to store extracted text
    text_resume = ""
    print("keerthi")
    # Iterate through each file in the directory
    for filename in os.listdir(directory):
        if filename.endswith(".pdf")  and filename not in processed_filenames:  # Check if the file is a PDF and not processed:  # Check if the file is a PDF:  # Check if the file is a PDF
            file_path = os.path.join(directory, filename)  # Get the full file path
            reader = PyPDF2.PdfReader(file_path)
            
            # Add a separator with the filename before extracting text from each PDF
            text_resume += f"Text extracted from: {filename}\n"
            
            # Iterate through each page of the PDF and extract text
            for page in reader.pages:
                text_resume += page.extract_text()
                text_resume += "\n"  # Add a newline after each page
            
            # Add a separator between different PDFs
            text_resume += "\n---\n"
            
    # Print the extracted text
    return (text_resume)
def chatgpt_message(jd,job_role,text_resume,mandatory_skills):


    prompt12= """
    Hey Act like a skilled or very experience ATS(Application Tracking System) 
with a deep understanding of the field .Your task is to evaluate the resume based on the given job description.
Also for jd match look deeply/ analaysis/ come to conclusion with respective to job role, job description and resume.correct varation in score should be seen  in mutplie resume,also score should not always be in round numbers.
JD Match Scoring:

Calculate the jd_match score based on the proportion of matching_skills relative to the total skills required by the jd and mandatory_skills.
Consider the experience_match value in the final score calculation.
The score should reflect the relevance and completeness of the resumes in fulfilling the job requirements. Ensure that the scoring differentiates between resumes based on the presence of critical skills and required experience.
For "Match Status", say if job match % is below 50 % then "Rejected", if it is greater or equal to 50 % but below 80% then "ON HOLD",if job match is greater than or equal to 80% then say "SELECTED FOR REVIEW".

The response should be in a JSON having the structure like below example:
{
"score":[
{
    "resume_filename": "devops-engineer-resume-example",
    "candidate_name":keerthi ganesh M,
    "JD_MATCH":"%",
    "MATCH_STATUS":"",
    "Matching_Skills":[],
    "Missing_Skills":[],
    "experience_match":
},
{
    "resume_filename": "python-resume",
    "candidate_name":Kishore Kumar M,
    "JD_MATCH":"%",
    "MATCH_STATUS":"",
    "Matching_Skills":[],
    "Missing_Skills":[],
    "experience_match":
}]
}
"""
    
    messages=[
{
    "role":'system',
    "content":prompt12},
{"role":"user",
 "content":f"""
Use the given {text_resume}, {job_role}, and {jd} (job description) to evaluate the jd_match score by acting as an ATS (Applicant Tracking System) tool. The score should be able to differentiate between multiple resumes.
Candidate name should be full name with inital if it is there, if inital is not there in resume then fine.
Resume Extraction:

Only use the resumes provided in the {text_resume} input. Each resume is separated by the text "Text extracted from:filename".
Do not generate any new candidate details or any JSON objects that were not part of the original input.

Matching Skills Evaluation:
Extract and list skills that are present in both the {jd} and the {text_resume}.
Extract and list skills that are present in both the {mandatory_skills} and the {text_resume}.
Combine both the list of skills from above list and use it for matching_skills.
Ensure that every skill from the {mandatory_skills} is checked:
If a mandatory skill is found in the {text_resume}, include it in the matching_skills.
If a mandatory skill is not found in the {text_resume}, include it in the missing_skills.
The matching_skills should contain a maximum of 20 skills, prioritizing mandatory skills if the limit is reached. Include at least 1 skill, if possible. If no skills match, set jd_match to 0 and list matching skills as "NIL".



Missing Skills Evaluation:

Identify skills mentioned in the jd and {mandatory_skills} that are not present in {text_resume}.
Ensure that skills from {mandatory_skills} which are not present in {text_resume} are always included in the missing skills, along with other missing skills from jd.
Limit the list of missing skills to a maximum of 8. If there are fewer than 8 missing skills, include as many as are identified.
If no missing skills are found, list the missing skills as "NIL".

Experience Check:

Identify the years of experience required in the {jd} (e.g., "5+ years of experience").
Check if the {text_resume} mentions the relevant years of experience explicitly.
If years of experience are not explicitly mentioned in the {text_resume}, infer the total years of experience from the employment history dates provided in the resume. Calculate the total duration by summing up the periods from each employment entry.
Ensure that the calculated or explicitly mentioned years of experience match the requirement in the jd.
If the required experience is met, set experience_match to 1. If not, set experience_match to 0.

JD Match Scoring:

Calculate the jd_match JD Match score based on the proportion of matching_skills relative to the total skills required by the {jd} and {mandatory_skills} common with {text_resume}.
The score should reflect the relevance and completeness of the resumes in fulfilling the job requirements. Ensure that the scoring differentiates between resumes based on the presence of critical skills and required experience
Score should be too less, if number of matching skills is less than number of missing skills,in the same way , if number of matching skills is more than missing skills, then score should be higher.

text_resume: The resume text provided by the candidate.
job_role: The job role for which the candidate is applying.
jd: The job description provided by the employer.
mandatory_skills: A list of mandatory skills required for the job.

Important Considerations:

Matching Skills: Skills which are common between {jd} and {text_resume} ,along with that find common between  {mandatory_skills} and {text_resume}, with a cap of 8 skills.
Mandatory Skills Inclusion: Ensure mandatory skills provided by the user are included in either matching_skills or missing_skills.
Missing Skills: Skills from {jd} not found in {text_resume}, with a cap of 8 skills.
Minimum and Maximum Skills: Ensure at least 1 matching skill, if possible, and list up to 8 matching and missing skills.
NIL for No Skills: Clearly specify "NIL" if no matching or missing skills are found.

Dont generate exaple response by your own unless you get resume details in {text_resume} variable.
The response should only be in a JSON having the structure like above.
""" }
]
    


    client = OpenAI()
    client.api_key = os.getenv("OPENAI_API_KEY")
    response1 = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=messages,
            temperature=0,
            max_tokens=1000,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0
        )
    print(response1.choices[0].message)
    response1= dict(response1)
    response_data = dict(dict(response1['choices'][0])['message'])[
            'content'].replace("\n", " ")

    print("knfdklfn")
 
    return (response_data)

def calculate_resume_scores(job_id,mandatory_skills):
    with app.app_context():
        # Get job details from the database using job_id
        job = Job.query.filter_by(id=job_id).first()

        if not job:
            return jsonify({'error': 'Job not found.'}), 404

        jd = job.jd
        role = job.role

        # Call user defined function for resume extract and call OpenAI to score
        text_resume = resume_details_extract(role,job_id)
        AI_score_response = chatgpt_message(jd, role, text_resume,mandatory_skills)

        # Convert AI_score_response string to dictionary
        AI_score_response_dict = json.loads(AI_score_response)
        print(AI_score_response_dict)
        # Parse AI score response and extract relevant information
        scores = []
        for resume_info in AI_score_response_dict['score']:
            resume_filename = resume_info['resume_filename']
            jd_match = resume_info['JD_MATCH']
            match_status = resume_info['MATCH_STATUS']
            matching_skills = resume_info['Matching_Skills']
            missing_skills = resume_info['Missing_Skills']
            candidate_name = resume_info['candidate_name']
            experience_match=resume_info['experience_match']

            # Store the calculated scores into your Resume_score table
            new_score = ResumeScore(
                resume_filename=resume_filename,
                name=candidate_name,
                job_id=job_id,  # Add job ID here if available
                jd_match=jd_match,
                match_status=match_status,
                matching_skills=matching_skills,
                missing_skills=missing_skills,
                experience_match=experience_match
            )
            db.session.add(new_score)

            # Append the score details to the response
            scores.append({
                "resume_filename": resume_filename,
                "candidate_name": candidate_name,
                "JD_MATCH": jd_match,
                "MATCH_STATUS": match_status,
                "Matching_Skills": matching_skills,
                "Missing_Skills": missing_skills,
                "role": role,
                "jd": jd,
                "experience_match":experience_match
            })

        # Commit changes to the database
        db.session.commit()
        print("calcu_done")
        return jsonify({'scores': scores}), 200

@ats_bp.route('/upload_resume_to_job', methods=['POST'])
def upload_resume_to_job():
    # First, handle the resume upload functionality
    data = request.form
    role = data.get('role')
    id = data.get('id')
    mandatory_skills=data.get('mandatory_skills')
    # Limit the maximum number of files that can be uploaded
    MAX_FILES = 5
    # Check if both role and JD are provided
    if not role or not id:
        return jsonify({'message': 'Role and JD are required fields.'}), 400
    
    
    folder_path = os.path.join(resume_folder, role)
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)
    
    try:
        uploaded_files = request.files.getlist('resume')
        
        # Check if the number of uploaded files exceeds the maximum limit
        if len(uploaded_files) > MAX_FILES:
            return jsonify({'message': f'Exceeded maximum number of files ({MAX_FILES}) allowed for upload.'}), 400


        # Save the resume file(s) to the resume folder
        for resume_file in uploaded_files:
            if resume_file.filename == '':
                return jsonify({'message': 'No selected file'}), 400
            

            # Generate a unique filename
            resume_filename = secure_filename(resume_file.filename)

            # Save the resume file to the resume folder
            resume_path = os.path.join(folder_path, resume_filename)
            resume_file.save(resume_path)

            # Associate the resume file with the job in the database
            job = Job.query.filter_by(role=role, id=id).first()
            jd=job.jd
            if not job:
                return jsonify({'message': 'Specified job role or description does not exist.'}), 400
            
            new_resume = Resume(filename=resume_filename, job_id=job.id)
            db.session.add(new_resume)
            db.session.commit()

        # Once the resumes are uploaded, start a thread to execute the extract_resume_info function
        extract_thread = Thread(target=extract_resume_info, args=(job.id, role))
        extract_thread.start()

        # Then, start another thread to execute the calculate_resume_scores function
        score_thread = Thread(target=calculate_resume_scores, args=(job.id,mandatory_skills))
        score_thread.start()

        return jsonify({'message': 'Resumes uploaded successfully and processing started.'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
#After the resume is uploaded or before resume is uploaded , this api should be called every 1 minute  
@ats_bp.route('/get_resume_scores', methods=['GET'])
def get_resume_scores():
    
    job_id = request.args.get('job_id')
    # Check if job_id and role are provided
    if not job_id:
        return jsonify({'error': 'Job ID and role are required parameters.'}), 400

    # Query the ResumeScore table based on job_id and role
    resume_scores = ResumeScore.query.filter_by(job_id=job_id).all()

    # Convert resume scores to JSON format
    scores_fetch= []
    for score in resume_scores:
        scores_fetch.append({
            "resume_filename": score.resume_filename,
            "candidate_name": score.name,
            "JD_MATCH": score.jd_match,
            "MATCH_STATUS": score.match_status,
            "Matching_Skills": score.matching_skills,
            "Missing_Skills": score.missing_skills,
            "selected_status":score.selected_status,
            "assessment_status":score.assessment_status,
            "experience_match":score.experience_match,
            "status":score.status
        })

    return jsonify({'resume_scores': scores_fetch}), 200



@ats_bp.route('/delete_resume', methods=['GET'])
def delete_resume():
    # Get candidate name and job_id from the request JSON data
    #data = request.get_json()
    #candidate_name = data.get('candidate_name')
    #job_id = data.get('job_id')

    candidate_name = request.args.get('candidate_name')
    job_id = request.args.get('job_id')
    
    job = Job.query.filter_by(id=job_id).first()
    role = job.role
    
    # Check if candidate name and job_id are provided
    if not candidate_name or not job_id:
        return jsonify({'error': 'Candidate name and job ID are required parameters.'}), 400

    try:
        # Delete records from ExtractedInfo table
        num_deleted_info = ExtractedInfo.query.filter(
            func.lower(ExtractedInfo.name) == func.lower(candidate_name),  # Case-insensitive match
            ExtractedInfo.job_id == job_id
        ).delete()
        
        # Delete records from ResumeScore table
        resume_scores = ResumeScore.query.filter(func.lower(ResumeScore.name) == func.lower(candidate_name), ResumeScore.job_id == job_id).all()
        for score in resume_scores:
            # Delete record from ResumeScore table
            db.session.delete(score)
            # Delete record from Resume table and move the file to the archive folder
            resume = Resume.query.filter_by(filename=score.resume_filename, job_id=job_id).first()
            if resume:
                # Move the file to the archive folder with a timestamp appended to its name
                archive_role_folder = os.path.join(archive_path, role)
                if not os.path.exists(archive_role_folder):
                    os.makedirs(archive_role_folder)
                timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
                new_filename = f"{resume.filename}_{timestamp}.pdf"
                file_to_delete_path = os.path.join(archive_role_folder, new_filename)
                shutil.move(os.path.join(resume_folder, role, resume.filename), file_to_delete_path)
                # Delete the record from the Resume table
                db.session.delete(resume)

        # Commit changes to the database
        db.session.commit()

        return jsonify({'message': f'Resume deleted successfully. {num_deleted_info} records deleted from ExtractedInfo table.'}), 200
    
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({'error': 'IntegrityError: Database constraint violation.'}), 500
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# to select the resume is selected or not 
@ats_bp.route('/update_resume_status', methods=['POST'])
def update_resume_status():
    data = request.get_json()
    name = data.get('name')
    status = data.get('status')  # give 'True' or 'False'

    if name is None or status is None:
        return jsonify({'error': 'Candidate name and status are required fields.'}), 400

    # Convert status string to boolean
    if status.lower() == 'true':
        status_bool = True
    elif status.lower() == 'false':
        status_bool = False
    else: 
        return jsonify({'error': 'Invalid value for status. Must be "True" or "False".'}), 400
    

    # Convert candidate name to lowercase
    name_lower = name.lower()
    print(f"Searching for candidate with name: {name_lower}")

    # Find the resume score record by name (case-insensitive search)
    resume_score = ResumeScore.query.filter(func.lower(ResumeScore.name) == name_lower).first()
    
    if resume_score is None:
        return jsonify({'error': 'Resume score record not found.'}), 404

    # Update the status
    resume_score.selected_status = status_bool

    # Commit changes to the database
    db.session.commit()

    return jsonify({'message': f'Resume status updated to {status_bool} for candidate {name}.'}), 200