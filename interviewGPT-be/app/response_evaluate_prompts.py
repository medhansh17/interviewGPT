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