import json
import os
from openai import OpenAI
from crewai import Agent, Task, Crew, Process
from .config import client
from flask import app

client = OpenAI()
client.api_key = os.getenv("OPENAI_API_KEY")

llm=OpenAI(api_key=client.api_key)

def create_agents(app,text_resume, jd, mandatory_skills,role):
    with app.app_context():

        name_agent = Agent(
                role='Candidate Name Extractor',
                goal=f'Extract the candidate name from the resume {text_resume}',
                backstory='You extract names from resumes',
                verbose=True,
                allow_delegation=False,
                llm=llm
            )

        skills_agent = Agent(
                role='Skills Extractor',
                goal=f'Extract matching and missing skills from the resume{text_resume} and {jd}',
                backstory='You extract skills from resumes',
                verbose=True,
                allow_delegation=False,
                llm=llm
            )
        experience_agent = Agent(
                role='Experience Evaluator',
                goal=f"""Identify the years of experience required in the {jd} (e.g., "5+ years of experience").
            Check if the {text_resume} mentions the relevant years of experience explicitly.
            If years of experience are not explicitly mentioned in the {text_resume}, infer the total years of experience from the employment history dates provided in the resume. Calculate the total duration by summing up the periods from each employment entry.
            Ensure that the calculated or explicitly mentioned years of experience match the requirement in the jd.
            If the required experience is met, set experience_match to 1. If not, set experience_match to 0.""",
                backstory='You evaluate the experience from resume',
                verbose=True,
                allow_delegation=False,
                llm=llm
            )

        score_agent=Agent(
                role='ATS Score Evaluator',
                goal=f"""Calculate the jd_match JD Match score based on the proportion of matching_skills relative to the total skills required by the {jd},{role} and {mandatory_skills} common with {text_resume}.\n
            The score should reflect the relevance and completeness of the resumes in fulfilling the job requirements. Ensure that the scoring differentiates between resumes based on the presence of critical skills and required experience.\n
            Score should be too less, if number of matching skills is less than number of missing skills, in the same way, if number of matching skills is more than missing skills, then score should be higher.Always avoid giving Explanation for that score given""",
                backstory='You evaluate the experience from resumes',
                verbose=True,
                allow_delegation=False,
                llm=llm
            )
        """Add_agnets_output=Agent(
                role='join agents ouptut',
                goal= 'use all the agents output, it will be in json format, so append all the agents output and give it in single json',
                backstory='You perform well in appeneding the JOSN outputs of different agents',
                verbose=True,
                allow_delegation=False,
                llm=llm

            )"""


        task1 = Task(description="find out the candidate name and resumefile name from the given text resume",
                expected_output = 'try to give the resonse in JSON FORMAT like {"candidate_name":,"resume_filename":},dont need Explanation',
                agent=name_agent)

        task2 = Task(description=
                ("FIND the matching and missing skills of the candidate based on jd and text resume"),
                expected_output = 'try to give the resonse in JSON FORMAT, like {"Matching_Skills":,"Missing_Skills":},dont need Explanation',
                agent=skills_agent)

        task3 = Task(description="Based on text resume, try to find the experience",
                expected_output = 'try to give the resonse in JSON FORMAT, like {"experience_match":},dont need Explanation',
                agent=experience_agent)

        task4 = Task(description="Try to find out the resume score match",
                expected_output = 'try to give the resonse in JSON FORMAT, like {"JD_MATCH":,"MATCH_STATUS":},dont need Explanation',
                agent=score_agent)

        """task5 = Task(
                description="try to append all the agents' raw output into a single JSON variable",
                expected_output='try to give the response in single JSON FORMAT like {"score":[{"resume_filename":, "candidate_name":, "JD_MATCH":"%", "MATCH_STATUS":, "Matching_Skills":, "Missing_Skills":, "experience_match":}]}',
                agent=Add_agnets_output)"""


        # Create crew
        crew = Crew(
            agents=[name_agent,skills_agent,experience_agent,score_agent],
            tasks=[task1,task2,task3,task4],
            verbose = 2,
            process = Process.sequential
            )
        crew.kickoff()

                # Convert the string outputs to dictionaries
        task1_dict = json.loads(task1.output.raw_output)
        task2_dict = json.loads(task2.output.raw_output)
        task3_dict = json.loads(task3.output.raw_output)
        task4_dict = json.loads(task4.output.raw_output)

        # Combine all the dictionaries into a single dictionary
        combined_dict = {
                "resume_filename": task1_dict["resume_filename"],
                "candidate_name": task1_dict["candidate_name"],
                "JD_MATCH": f'{task4_dict["JD_MATCH"]}%',
                "MATCH_STATUS": task4_dict["MATCH_STATUS"],
                "Matching_Skills": task2_dict["Matching_Skills"],
                "Missing_Skills": task2_dict["Missing_Skills"],
                "experience_match": task3_dict["experience_match"]
            }

        # Format the final JSON structure
        final_json = {"score": [combined_dict]}

        # Convert the final dictionary to a JSON string
        final_json_str = json.dumps(final_json, indent=4)

        return(final_json_str)