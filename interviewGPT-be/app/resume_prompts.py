# Prompt for extracting resume details
extract_resume_prompt = """
You act like as ATS tool, where you get {text_resume} resume of candidate. You will get multiple resumes or a single resume that will vary. Each resume will be differentiated by "Text extracted from: {filename}". From that resume, extract the information like candidate name, date of birth, work experience in years, phone number, address, email id, LinkedIn link, GitHub link, technical skills, and soft skills.
IF total year of experience is not given, then you do analysis of total years the candidate worked in different companies and say total years of experience, not the company name details. Always avoid hallucination-problem, the extracted information should be in JSON format like below example:
IF any key values are not there, mention as "NIL", don't need explanation, just the JSON details like below:
{
    "resume_details": [
        {
            "candidate_name": "KEERTHI GANESH M",
            "work_exp": "3 YEARS",
            "phone_number": "78787878787",
            "address": "KAIALSH NAGAR TRICHY, TAMIL NADU",
            "email_id": "KEERTHI@GMAIL.COM",
            "linkedin_id": "https://linkedin.com/keerthi",
            "github_id": "",
            "technical_skills": ["PYTHON", "DEVOPS", "SQL", "AI"],
            "soft_skills": ["GOOD COMMUNICATION", "TEAM PLAYER"],
            "date_of_birth": "04-09-1998",
            "nationality": "Indian"
        },
        {
            "candidate_name": "kishore M",
            "work_exp": "1 YEARS",
            "phone_number": "345678983",
            "address": "balaji street, kerala",
            "email_id": "kishore@GMAIL.COM",
            "linkedin_id": "https://linkedin.com/kishore",
            "github_id": "",
            "technical_skills": ["C++", "Springboot", "JAVA", "REACT"],
            "soft_skills": ["COMMUNICATION", "CRITICAL THINKER"],
            "date_of_birth": "20-11-2000",
            "nationality": "Indian"
        }
    ]
}
If only one resume is given, then give the response like below:
{
    "resume_details": [
        {
            "candidate_name": "KEERTHI GANESH M",
            "work_exp": "3 YEARS",
            "phone_number": "78787878787",
            "address": "KAIALSH NAGAR TRICHY, TAMIL NADU",
            "email_id": "KEERTHI@GMAIL.COM",
            "linkedin_id": "",
            "github_id": "",
            "technical_skills": ["PYTHON", "DEVOPS", "SQL", "AI"],
            "soft_skills": ["GOOD COMMUNICATION", "TEAM PLAYER"],
            "date_of_birth": "04-09-1998",
            "nationality": "Indian"
        }
    ]
}
"""
# Prompt for evaluating resume scores
evaluate_resume_prompt = """
Hey Act like a skilled or very experienced ATS (Application Tracking System) 
with a deep understanding of the field. Your task is to evaluate the resume based on the given job description.
Also, for JD match, look deeply/analyze/come to a conclusion with respect to job role, job description, and resume. Correct variation in score should be seen in multiple resumes; also score should not always be in round numbers.

JD Match Scoring:

Calculate the jd_match score based on the proportion of matching_skills relative to the total skills required by the JD and mandatory_skills.
Consider the experience_match value in the final score calculation.
The score should reflect the relevance and completeness of the resumes in fulfilling the job requirements. Ensure that the scoring differentiates between resumes based on the presence of critical skills and required experience.
For "Match Status", say if job match % is below 50 % then "Rejected", if it is greater or equal to 50 % but below 80% then "ON HOLD", if job match is greater than or equal to 80% then say "SELECTED FOR REVIEW".

The response should be in a JSON having the structure like below example:
{
"score":[
{
    "resume_filename": "devops-engineer-resume-example",
    "candidate_name": "keerthi ganesh M",
    "JD_MATCH":"%",
    "MATCH_STATUS":"",
    "Matching_Skills":[],
    "Missing_Skills":[],
    "experience_match":
},
{
    "resume_filename": "python-resume",
    "candidate_name": "Kishore Kumar M",
    "JD_MATCH":"%",
    "MATCH_STATUS":"",
    "Matching_Skills":[],
    "Missing_Skills":[],
    "experience_match":
}]
}
"""
# User prompt for resume evaluation
user_prompt_resume_evaluation = """
Use the given {text_resume}, {job_role}, and {jd} (job description) to evaluate the jd_match score by acting as an ATS (Applicant Tracking System) tool. The score should be able to differentiate between multiple resumes.
Candidate name should be full name with initial if it is there, if initial is not there in resume then fine.
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
The score should reflect the relevance and completeness of the resumes in fulfilling the job requirements. Ensure that the scoring differentiates between resumes based on the presence of critical skills and required experience.
Score should be too less, if number of matching skills is less than number of missing skills, in the same way, if number of matching skills is more than missing skills, then score should be higher.

text_resume: The resume text provided by the candidate.
job_role: The job role for which the candidate is applying.
jd: The job description provided by the employer.
mandatory_skills: A list of mandatory skills required for the job.

Important Considerations:

Matching Skills: Skills which are common between {jd} and {text_resume}, along with that find common between {mandatory_skills} and {text_resume}, with a cap of 8 skills.
Mandatory Skills Inclusion: Ensure mandatory skills provided by the user are included in either matching_skills or missing_skills.
Missing Skills: Skills from {jd} not found in {text_resume}, with a cap of 8 skills.
Minimum and Maximum Skills: Ensure at least 1 matching skill, if possible, and list up to 8 matching and missing skills.
NIL for No Skills: Clearly specify "NIL" if no matching or missing skills are found.

Don't generate example response by your own unless you get resume details in {text_resume} variable.
The response should only be in a JSON having the structure like above.
"""