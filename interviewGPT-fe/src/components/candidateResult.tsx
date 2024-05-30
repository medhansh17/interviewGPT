const InterviewDataDisplay = (data: any, onClick: any) => {
  const { audio_transcript, candidate_name, code_response, tech_response } =
    data;

  return (
    <div className="absolute z-10 p-4 bg-white border-2 border-black flex justify-center flex-col">
      <button onClick={onClick}>
        <p className="font-bold">Close</p>
      </button>
      <h1>Interview Data for {candidate_name}</h1>

      <section>
        <h2>Audio Transcript</h2>
        {audio_transcript.map((item: any, index: any) => (
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
        <p>{JSON.stringify(tech_response, null, 2)}</p>
      </section>
    </div>
  );
};

export default InterviewDataDisplay;
