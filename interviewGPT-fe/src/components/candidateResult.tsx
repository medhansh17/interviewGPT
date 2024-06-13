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

interface CodeResponse {
  coding_evaluation: {
    code_score: Record<string, number>;
    coding_question: {
      question: string;
      sample_input: string;
      sample_output: string;
    };
    user_code: {
      code: string;
    };
  }[];
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
        resume_id: resume_id,
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
    return <div>No data available</div>;
  }

  const { audio_transcript, candidate_name, code_response, tech_response } =
    resultData;

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
          {audio_transcript.map((item: any, index: any) => (
            <div key={index} className="mb-4">
              <p className="mb-1">
                <strong>Question:</strong> {item.question}
              </p>
              <p className="mb-4">
                <strong>User Response:</strong> {item.User_response}
              </p>
            </div>
          ))}
        </section>

        <section>
          <h2 className="text-lg font-bold mb-4">Code Responses</h2>
          {code_response.map((response: string, index: number) => {
            const parsedResponse: CodeResponse = JSON.parse(response);
            return (
              <div key={index} className="mb-6">
                {parsedResponse.coding_evaluation.map((evaluation, idx) => (
                  <div key={idx} className="mb-4">
                    <h3 className="text-base mb-2">
                      <strong> Question: </strong>{" "}
                      {evaluation.coding_question.question}
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
                          <th className="border-2 border-gray-400 p-2">
                            Aspect
                          </th>
                          <th className="border-2 border-gray-400 p-2">
                            Score
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(evaluation.code_score).map(
                          ([key, value]) => (
                            <tr key={key}>
                              <td className="border-2 border-gray-400 p-2">
                                {key.replace(/_/g, " ")}
                              </td>
                              <td
                                className={
                                  value >= 80
                                    ? "bg-green-700 border-2 border-gray-400"
                                    : "bg-red-200 border-2 border-gray-400"
                                }
                              >
                                {value}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            );
          })}
        </section>
        <section>
          <h2 className="text-lg font-bold mb-4">Technical Response</h2>
          <div className="mb-6">
            <h3 className="font-bold">
              Total Score:{" "}
              {JSON.parse(tech_response[0]).tech_report.Total_score}
            </h3>
          </div>
          <table className="w-full border-collapse mb-6">
            <thead>
              <tr>
                <th className="border-2 border-gray-400 p-2">Question</th>
                <th className="border-2 border-gray-400 p-2">Correct Answer</th>
                <th className="border-2 border-gray-400 p-2">User Answer</th>
                <th className="border-2 border-gray-400 p-2">
                  Selected Choice
                </th>
              </tr>
            </thead>
            <tbody>
              {tech_response
                .slice(0, 1)
                .map((response: string, index: number) => {
                  const parsedResponse: TechResponse = JSON.parse(response);
                  return parsedResponse.questions.map(
                    (question, questionIdx) => (
                      <tr key={`${index}-${questionIdx}`}>
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
                          } border-2 border-gray-400`}
                        >
                          {question.Selected_choice}
                        </td>
                      </tr>
                    )
                  );
                })}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
};

export default InterviewDataDisplay;
