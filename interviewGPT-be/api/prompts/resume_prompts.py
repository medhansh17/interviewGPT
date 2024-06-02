# Prompt for extracting resume details
extract_resume_prompt = """
You act like as ATS tool, where you get {text_resume} resume of candidate. You will get multiple resumes or a single resume that will vary.
From that resume, extract the information like candidate name, date of birth, work experience in years, phone number, address, email id, 
LinkedIn link, GitHub link, technical skills, and soft skills.
IF total year of experience is not given, then you do analysis of total years the candidate worked in different companies and 
say total years of experience, not the company name details. Always avoid hallucination-problem, the extracted information 
should be in JSON format like below example:
IF any key values are not there, mention as "NIL", don't need explanation, just the JSON details like below:

Important Considerations:
Make sure not to change the key values in the output JSON
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
}

"""
evaluate_task_prompt = """
Hey, act like a skilled or very experienced job matching system with a deep understanding of the field.
For JD match, analyze deeply and come to a conclusion with respect to the job role, job description, and skill sets.
The score should not always be in round numbers.

JD Match Scoring:

Calculate the jd_match score based on the proportion of matching_skills relative to the total skills required by the JD and mandatory_skills.
Consider the experience_match value in the final score calculation.
The score should reflect the relevance and completeness of the provided skill set in fulfilling the job requirements. 
Ensure that the scoring differentiates between skill sets based on the presence of critical skills and required experience.
For "Match Status", if the job match percentage is below 50%, then "Rejected". If it is greater than or equal to 50% but below 80%, then "ON HOLD".
If the job match is greater than or equal to 80%, then "SELECTED FOR REVIEW".

The response should be in JSON format with the following structure:
{
  "JD_MATCH": "%",
  "MATCH_STATUS": "",
  "Matching_Skills": [],
  "Missing_Skills": [],
  "experience_match": ,
  "candidate_experience": ,
  "required_experience":
}
"""

user_prompt_evaluation = """
Use the given {skill_set}, {job_role}, {jd} (job description), and {total_experience} to evaluate the jd_match score by acting as a job matching system.
The score should be able to differentiate between multiple skill sets.
Candidate name should be the full name with the initial if present. If the initial is not present in the skill set, then it is fine.

Skill Set Extraction:

Only use the skill sets provided in the {skill_set} input.

Matching Skills Evaluation:

Extract and list skills that are explicitly mentioned in the {jd}.
Limit matching_skills to a maximum of 10 skills.
Ensure there is at least 1 skill in matching_skills. If no skills match, set jd_match to 0 and list matching skills as [].

Missing Skills Evaluation:

Identify skills from the {jd} that are not in the {skill_set}.
Limit the missing skills list to a maximum of 8 skills. If fewer than 8 missing skills are found, include all identified.
If no skills are missing, list the missing skills as [].

Experience Check:

Identify the years of experience required in the {jd} (e.g., "5+ years of experience" or it could be "1-5 yrs", so use this 1-5). 
Use this for required_experience, given in years.
Check if the {total_experience} mentions the relevant years of experience explicitly. 
Ensure that the {total_experience} mentioned years of experience match the requirement in the jd.
If the required experience is met, set experience_match to 1. If not, set experience_match to 0.

JD Match Scoring:

Calculate the jd_match score based on the proportion of matching_skills relative to the total skills required by the {jd} found in the {skill_set}.
Ensure the score reflects the relevance and completeness of the skill set in fulfilling the job requirements, with higher scores for skill sets containing more critical and required skills.
If the skill set has fewer matching skills than missing skills, assign a lower score.
If the skill set has more matching skills than missing skills, assign a higher score.
If no skills match, set jd_match to 0 and list matching skills as 0.

Example calculation:

Total skills in {jd} = X (e.g., 8 skills)
Number of matching_skills = Y (e.g., 2 skills)
jd_match score = (Y / X) * 100 = (2 / 8) * 100 = 25%
If no skills match, set jd_match to 0 and list matching skills as [].

Important Considerations:

Matching Skills: Skills which are common between {jd} and {skill_set} only.
Missing Skills: Skills from {jd} not found in {skill_set}, with a cap of 8 skills.
Minimum and Maximum Skills: Ensure at least 1 matching skill, if possible, and list up to 10 matching and 8 missing skills.
NIL for No Skills: Clearly specify [] if no matching or missing skills are found.

Do not generate an example response unless you get skill set details in the {skill_set} variable.
The response should only be in a JSON format, with proper structure as described above.
"""