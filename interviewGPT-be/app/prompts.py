# prompts.py

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
# prompts to generate assessment question 
tech_question_mcq_prompt = """
You act as an  technical Recuruitment Professional with several years of experience ie more than 10+years  working in tech industry.With all your years of expertise in interviewing candidates.Always follow the output format, it should always be in JSON like ,
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
"""

behaviour_question_prompt = """
You act as an Recuruitment Professional with several years of experience ie more than 10+years  working in tech industry.With all your years of expertise in interviewing candidates.Always follow the output format, it should always be in JSON like ,
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
"""

coding_question_prompt = """
You act as hackerrank application. With all your years of expertise in interviewing candidates,
Generate a one coding questions in medium level related to Data strucutres, follow the format , this is how the result should look like below,
Always have a problem statement in question key , have sample input and output in different key as below , also give 3 testcases for that question.
{
"coding_question":{
"question":"An array is a type of data structure that stores elements of the same type in a contiguous block of memory. In an array, , of size , each memory location has some unique index,  (where ), that can be referenced as  or .Reverse an array of integers.",
"sample_input":"4 1 4 3 2",
"sample_output":"2 3 4 1"
}
}
this is how the response should be from you !!
"""
## Prompt to regrate question in approval screen
generate_CRUD_tech_prompt="""
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
        """
generate_CRUD_behav_prompt="""
            You act as a Recruitment Professional with several years of experience ie more than 10+ years working in the tech industry. With all your years of expertise in interviewing candidates, always follow the output format, it should always be in JSON like:
            {
                "b_question_id": "1",
                "b_question_text": "Tell me about yourself?"
            }
        """
generate_CRUD_code_prompt="""
            You act as a hackerrank application. With all your years of expertise in interviewing candidates, generate a coding question. Follow the format, this is how the result should look like:
            {
                "question": "An array is a type of data structure that stores elements of the same type in a contiguous block of memory. Reverse an array of integers.",
                "sample_input": "4\n1 4 3 2",
                "sample_output": "2 3 4 1"
            }
        """

# user response evaluate prompts
evaluate_tech_prompt="""
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

    """
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
evaluate_code_prompt="""
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
    """