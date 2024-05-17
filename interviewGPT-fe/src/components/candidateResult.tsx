
const InterviewDataDisplay = ({ data }) => {
  const { audio_transcript, candidate_name, code_response, tech_response } =
    data;

  return (
    <div className="absolute z-10 p-4">
      <h1>Interview Data for {candidate_name}</h1>

      <section>
        <h2>Audio Transcript</h2>
        {audio_transcript.map((item, index) => (
          <div key={index}>
            <p>
              <strong>Question:</strong> {item.question}
            </p>
            <p>
              <strong>User Response:</strong> {item.User_response}
            </p>
          </div>
        ))}
      </section>

      <section>
        <h2>Code Response</h2>
        <p>{code_response[0]}</p>
      </section>

      <section>
        <h2>Technical Response</h2>
        <pre>{JSON.stringify(tech_response, null, 2)}</pre>
      </section>
    </div>
  );
};

// Example usage
const interviewData = {
  audio_transcript: [
    {
      User_response:
        "If you find the video useful, please like, share the video, and subscribe. Thanks for watching it.\n",
      question: "medhansh",
    },
    {
      User_response: "Thank you for watching.\n",
      question:
        "Can you describe a project where you demonstrated strong leadership skills?",
    },
    {
      User_response:
        "\ud83d\ude32\ud83d\ude32\ud83d\ude32\ud83d\ude32\ud83d\ude32\n",
      question: "Tell me about yourself ?",
    },
    {
      User_response: "You\n",
      question:
        "Describe an instance when your leadership abilities had a significant impact on a project outcome?",
    },
    {
      User_response: ". . \n",
      question:
        "Can you give an example of a time when you had to take ownership of a problem and guide it to a resolution?",
    },
  ],
  candidate_name: "Akash Kumar P",
  code_response: [
    'Your data format seems to have some wrong information. The code part has a name "Medhansh Jain" instead of a code snippet. The problem statement is correctly given but I need a matching actual code snippet to evaluate it. Please provide the code snippet and try again.',
  ],
  job_id: "ec98540f-cfca-4236-a63a-c4b273bec74b",
  tech_response: [
    '{ "tech_report": { "Total_score": 3 }, "questions":[ { "question": "Which of the following is NOT a characteristic of server-side rendering (SSR) in frameworks like Next.js?", "correct_answer": "Immediate interaction with the webpage without loading external JavaScript", "user_answer": "Initial page loading is slower because the server renders the content", "Selected_choice": "wrong" }, { "question": "In Redux, which component is responsible for updating the state based on the action\'s outcome?", "correct_answer": "Reducer", "user_answer": "Reducer", "Selected_choice": "right" }, { "question": "When integrating a React application with a charting library like d3.js, what is the primary challenge?", "correct_answer": "Ensuring that d3.js manipulates the DOM without conflicting with React\'s Virtual DOM", "user_answer": "Synchronizing state between Redux and d3.js internal mechanisms", "Selected_choice": "wrong" }] }',
  ],
};

export default InterviewDataDisplay;
