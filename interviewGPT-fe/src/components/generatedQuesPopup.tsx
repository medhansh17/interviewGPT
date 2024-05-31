import { faRedo, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UpdateQuestionPopup from "./updateQuestionPopup";

export default function GeneratedQuesPopup({
  behavioralQuestions,
  technicalQuestions,
  codingQuestion,
  onClose,
}: {
  behavioralQuestions: { b_question_text: string }[];
  technicalQuestions: {
    question: string;
    options: { [key: string]: string };
    answer: string;
  }[];
  codingQuestion?: {
    question: string;
    sample_input: string;
    sample_output: string;
  };
  onClose: () => void;
}) {
  const [updateStatus, setUpdateStatus] = useState(false);
  const navigate = useNavigate();
  // const [approval, setApproval] = useState(true);
  
  const handleApproval = () => {
    // Handle approval logic here
    navigate(`/online-assess/`);
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
      <div className="relative bg-white dark:bg-zinc-700 rounded-lg shadow p-6 w-full max-w-5xl overflow-auto max-h-[calc(100vh-1rem)]">
        {updateStatus && (
          <UpdateQuestionPopup
            handleUpdate={() => console.log("Handle Update")}
          />
        )}
        <button
          className="absolute top-2 right-2 text-black bg-gray-300 rounded-full p-2"
          onClick={onClose}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Behavioral Questions:</h2>
          <ul className="list-disc pl-4">
            {behavioralQuestions.map((question, index) => (
              <li key={index} className="relative flex items-center">
                <span className="flex-grow">{question.b_question_text}</span>
                <button
                  onClick={() => setUpdateStatus(!updateStatus)}
                  className="ml-2"
                >
                  <FontAwesomeIcon icon={faRedo} />
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Technical Questions:</h2>
          {technicalQuestions.map((question, index) => (
            <div key={index} className="mb-4 relative">
              <div className="flex justify-between items-center mb-2">
                <p>
                  <span className="font-semibold">Question:</span>{" "}
                  {question.question}
                </p>
                <button
                  onClick={() => setUpdateStatus(!updateStatus)}
                  className="ml-2"
                >
                  <FontAwesomeIcon icon={faRedo} />
                </button>
              </div>
              <ul className="list-disc pl-4">
                {Object.entries(question.options).map(([key, value]) => (
                  <li key={key}>
                    {key}. {value}
                  </li>
                ))}
              </ul>
              <p>
                <span className="font-semibold">Answer:</span> {question.answer}
              </p>
            </div>
          ))}
        </div>
        {codingQuestion && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Coding Question:</h2>
            <p>
              <span className="font-semibold">Question:</span>{" "}
              {codingQuestion.question}
            </p>
            <button
              onClick={() => setUpdateStatus(!updateStatus)}
              className="ml-2"
            >
              <FontAwesomeIcon icon={faRedo} />
            </button>
            <p>
              <span className="font-semibold">Sample Input:</span>{" "}
              {codingQuestion.sample_input}
            </p>
            <p>
              <span className="font-semibold">Sample Output:</span>{" "}
              {codingQuestion.sample_output}
            </p>
          </div>
        )}
        <div className="flex justify-between mt-4">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600"
            onClick={handleApproval}
          >
            Approve
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
