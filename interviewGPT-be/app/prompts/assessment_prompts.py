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