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
