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
                "correct_answer":,
                "user_answer":,
                "Selected_choice":"right"
                }
                {
                "question":,
                "correct_answer":,
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
  "coding_evaluation": [
    {
      "code_score": {
        "Correctness": ,
        "Efficiency": ,
        "Clarity_and_Readability": ,
        "Modularity_and_Maintainability": ,
        "Edge_Cases_Handling": ,
        "Error_Handling_and_Robustness": ,
        "Testing": ,
        "Optimization": ,
        "Language_Proficiency": ,
        "Problem_Solving_Approach": ,
        "OVERALL_SCORE": "32/100"
      },
      "coding_question": {
        "question": "Write a function to reverse a string.",
        "sample_input": "hello",
        "sample_output": "olleh"
      },
      "user_code": {
        "code": "def reverse_string(s): return s[::-1]"
      }
    },
    {
      "code_score": {
        "Correctness": ,
        "Efficiency": ,
        "Clarity_and_Readability": ,
        "Modularity_and_Maintainability": ,
        "Edge_Cases_Handling": ,
        "Error_Handling_and_Robustness": ,
        "Testing": ,
        "Optimization": ,
        "Language_Proficiency": ,
        "Problem_Solving_Approach": ,
        "OVERALL_SCORE": "60/100"
      },
      "coding_question": {
        "question": "Write a function to check if a number is prime.",
        "sample_input": 7,
        "sample_output": true
      },
      "user_code": {
        "code": "def is_prime(n): if n <= 1: return False for i in range(2, int(n**0.5) + 1): if n % i == 0: return False return True"
      }
    }
  ]
}

    """
evaluate_behavioural_prompt="""

You are experienced person in interviewing where your tasked with evaluating a candidate's responses{transcript} to behavioral interview question{question_text}. The evaluation should be based on the following criteria:
1. **Relevance**: Does the candidate address the question directly and provide relevant examples?
2. **Clarity**: Are their responses clear and well-structured?
3. **Depth**: Do they provide detailed and comprehensive answers, showing thorough understanding and experience?
4. **Examples**: Do they use specific examples to illustrate their points?
5. **Outcome**: Do they discuss the outcomes of their actions and reflect on what they learned or how they grew from the experience?
6. **Grammar**: Are their responses grammatically correct and fluent?

Each criterion should be scored on a scale from 1 to 5, where:
- **0** = very Poor 
- **1** = Poor
- **2** = Fair
- **3** = Good
- **4** = Very Good
- **5** = Excellent

question : {question_text}
transcripts: {transcript}

Important Considerations:
Make sure not to change the key values in the output JSON
the response should like the below example json,
{
      "question": "Tell me about a time you faced a challenge at work.",
      "scores": {
        "relevance": 4,
        "clarity": 5,
        "depth": 4,
        "examples": 4,
        "outcome": 3,
        "grammar": 4
      }
    }
proper evalaution should be done, if not proper response is given or response is out of context then it is fine to give  zero (0) for the given criteria.
Mandatory to follow the same keys used in above example will all key in lower case letters\
Please make sure the JSON data provided follows the correct JSON format as illustrated below. This will ensure that the JSON string can be parsed without errors. Pay attention to the following points:\
Ensure all keys and string values are enclosed in double quotes.\
Close all braces  and brackets  properly.\
Avoid trailing commas after the last element in objects and arrays.
"""