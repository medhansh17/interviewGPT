import React, { useState, useEffect } from "react";
import api from "@/components/customAxios/Axios";
import { useToast } from "./toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

interface InterviewDataProps {
  onClick: () => void;
  resume_id: string;
  jobId: string;
}

interface AudioTranscript {
  audio_file_path: string;
  question: string;
  score: string; // Assuming it's a JSON string
}

interface TechResponse {
  tech_report: {
    Total_score: string;
  };
  questions: {
    question: string;
    correct_answer: string;
    user_answer: string;
    Selected_choice: string;
  }[];
}

interface CodeEvaluation {
  code_score: Record<string, number>;
  coding_question: {
    question: string;
    sample_input: string;
    sample_output: string;
  };
  user_code: {
    code: string;
  };
}

interface CodeResponse {
  coding_evaluation: CodeEvaluation[];
}

const InterviewDataDisplay: React.FC<InterviewDataProps> = ({
  onClick,
  resume_id,
  jobId,
}) => {
  const [resultData, setResultData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const toast = useToast();

  const showResultHandler = async () => {
    try {
      const resp = await api.post("/fetch_user_responses", {
        resume_id,
        job_id: jobId,
      });
      setResultData(resp.data);
    } catch (err: any) {
      toast.error({
        type: "background",
        duration: 3000,
        status: "Error",
        title: "Error fetching result",
        description: err.response?.error || "An unknown error occurred",
        open: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    showResultHandler();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!resultData) {
    onClick();
    return null;
  }

  const { audio_transcript, candidate_name, code_response, tech_response } =
    resultData;

  const parseJSON = (response: string) => {
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return null;
    }
  };

  const renderCodeResponses = (codeResponses: string) => {
    const parsedCodeResponses: CodeResponse | null = parseJSON(codeResponses);
    if (!parsedCodeResponses) {
      return <div>Error parsing code responses</div>;
    }

    return parsedCodeResponses.coding_evaluation.map((evaluation, index) => (
      <div key={index} className="mb-4">
        <h3 className="text-base mb-2">
          <strong>Question:</strong> {evaluation.coding_question.question}
        </h3>
        <p className="mb-1">
          <strong>Sample Input:</strong>{" "}
          {evaluation.coding_question.sample_input}
        </p>
        <p className="mb-1">
          <strong>Sample Output:</strong>{" "}
          {evaluation.coding_question.sample_output}
        </p>
        <p className="mb-1">
          <strong>User Code:</strong> {evaluation.user_code.code}
        </p>
        <h4 className="text-sm font-bold mb-1">Code Score:</h4>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border-2 border-gray-400 p-2">Aspect</th>
              <th className="border-2 border-gray-400 p-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(evaluation.code_score).map(([key, value]) => (
              <tr key={key}>
                <td className="border-2 border-gray-400 p-2">
                  {key.replace(/_/g, " ")}
                </td>
                <td
                  className={`${
                    value >= 8 ? "bg-green-700" : "bg-red-200"
                  } border-2 border-gray-400`}
                >
                  {value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ));
  };

  const renderTechResponses = (techResponses: string) => {
    const parsedTechResponses: TechResponse | null = parseJSON(techResponses);
    if (!parsedTechResponses) {
      return <div>Error parsing tech responses</div>;
    }

    return (
      <div className="mb-6">
        <h3 className="font-bold">
          Total Score: {parsedTechResponses.tech_report.Total_score}
        </h3>
        <table className="w-full border-collapse mb-6">
          <thead>
            <tr>
              <th className="border-2 border-gray-400 p-2">Question</th>
              <th className="border-2 border-gray-400 p-2">Correct Answer</th>
              <th className="border-2 border-gray-400 p-2">User Answer</th>
              <th className="border-2 border-gray-400 p-2">Selected Choice</th>
            </tr>
          </thead>
          <tbody>
            {parsedTechResponses.questions.map((question, index) => (
              <tr key={index}>
                <td className="border-2 border-gray-400 p-2">
                  {question.question}
                </td>
                <td className="border-2 border-gray-400 p-2">
                  {question.correct_answer}
                </td>
                <td className="border-2 border-gray-400 p-2">
                  {question.user_answer}
                </td>
                <td
                  className={`${
                    question.correct_answer === question.user_answer
                      ? "bg-green-200"
                      : "bg-red-200"
                  } border-2 border-gray-400 p-2`}
                >
                  {question.Selected_choice}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderAudioTranscripts = (transcripts: AudioTranscript[]) => {
    return transcripts.map((item, index) => {
      const parsedScore = parseJSON(item.score);
      return (
        <div key={index} className="mb-4">
          <p className="mb-1">
            <strong>Question:</strong> {item.question}
          </p>
          <audio controls className="mb-1">
            <source src={item.audio_file_path} type="audio/wav" />
            Your browser does not support the audio element.
          </audio>
          <h4 className="text-sm font-bold mb-1">Scores:</h4>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-2 border-gray-400 p-2">Aspect</th>
                <th className="border-2 border-gray-400 p-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {parsedScore ? (
                Object.entries(parsedScore.scores).map(([key, value]) => (
                  <tr key={key}>
                    <td className="border-2 border-gray-400 p-2">
                      {key.replace(/_/g, " ")}
                    </td>
                    <td className="border-2 border-gray-400 p-2">
                      {value as React.ReactNode}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="border-2 border-gray-400 p-2">
                    Error parsing scores
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      );
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-10">
      <div className="relative bg-white dark:bg-zinc-700 rounded-lg shadow p-6 w-full max-w-5xl overflow-auto max-h-[calc(100vh-1rem)]">
        <button
          className="absolute top-2 right-2 text-black p-2"
          onClick={onClick}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <h1 className="text-2xl font-bold mb-6 text-center">
          Interview Data for {candidate_name}
        </h1>

        <section>
          <h2 className="text-lg font-bold mb-4">Audio Transcript</h2>
          {renderAudioTranscripts(audio_transcript)}
        </section>

        <section>
          <h2 className="text-lg font-bold mb-4">Code Responses</h2>
          {renderCodeResponses(code_response)}
        </section>

        <section>
          <h2 className="text-lg font-bold mb-4">Technical Response</h2>
          {renderTechResponses(tech_response)}
        </section>
      </div>
    </div>
  );
};

export default InterviewDataDisplay;
