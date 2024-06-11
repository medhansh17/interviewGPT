import {
  faEdit,
  faRedo,
  faTimes,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UpdateQuestionPopup from "./updateQuestionPopup";
import { deleteQuestion } from "@/api/deleteCandidateQuestion";
import { useToast } from "./toast";
import EditQuestionPopup from "./editQuestionPopup";
import { approveCandidate } from "@/api/approveCandidate";

export interface UpdateQuestionData {
  resume_id: string;
  job_id: string;
  question_id: string;
  question_type: "behavioral" | "technical" | "coding";
}

export interface EditQuestionData {
  resume_id: string;
  job_id: string;
  question_id: string;
  question_type: "behavioral" | "technical" | "coding";
  question: string;
  sample_input?: string;
  sample_output?: string;
  options?: { [key: string]: string };
}

export default function GeneratedQuesPopup({
  behavioralQuestions,
  technicalQuestions,
  codingQuestion,
  resume_id,
  onClose,
}: {
  behavioralQuestions: { b_question_id: string; b_question_text: string }[];
  technicalQuestions: {
    tech_ques_id: string;
    question: string;
    options: { [key: string]: string };
    answer: string;
  }[];
  codingQuestion?: {
    coding_ques_id: string;
    question: string;
    sample_input: string;
    sample_output: string;
  }[];
  resume_id: string;
  onClose: () => void;
}) {
  const toast = useToast();
  const [updateStatus, setUpdateStatus] = useState(false);
  const [editStatus, setEditStatus] = useState(false);
  const [data, setData] = useState<UpdateQuestionData | undefined>();
  const [editData, setEditData] = useState<EditQuestionData | undefined>();
  const navigate = useNavigate();

  const handleApproval = async () => {
    // const item = sessionStorage.getItem("question");
    // const candidate_id = item ? JSON.parse(item).candidate_id : "";
    // const resp = await approveCandidate(candidate_id);
    // console.log(resp);
    navigate(`/online-assess/`);
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
      <div className="relative bg-white dark:bg-zinc-700 rounded-lg shadow p-6 w-full max-w-5xl overflow-auto max-h-[calc(100vh-1rem)]">
        {updateStatus && data && (
          <UpdateQuestionPopup
            onClose={() => setUpdateStatus(false)}
            data={data}
          />
        )}
        {editStatus && editData && (
          <EditQuestionPopup
            onClose={() => setEditStatus(false)}
            data={editData}
          />
        )}
        <button
          className="absolute top-2 right-2 text-black p-2"
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
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setData({
                        resume_id: resume_id,
                        job_id: localStorage.getItem("job_id") || "",
                        question_id: question.b_question_id,
                        question_type: "behavioral",
                      });
                      setUpdateStatus(true);
                    }}
                    className="ml-2"
                  >
                    <FontAwesomeIcon icon={faRedo} color="black" />
                  </button>
                  <button
                    onClick={() => {
                      deleteQuestion({
                        resume_id: resume_id,
                        jobId: localStorage.getItem("job_id") || "",
                        question_id: question.b_question_id,
                        question_type: "behavioral",
                        toast: toast,
                      });
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} color="red" />
                  </button>
                  <button
                    onClick={() => {
                      setEditData({
                        resume_id: resume_id,
                        job_id: localStorage.getItem("job_id") || "",
                        question_id: question.b_question_id,
                        question_type: "behavioral",
                        question: question.b_question_text,
                      });
                      setEditStatus(true);
                    }}
                  >
                    <FontAwesomeIcon icon={faEdit} color="green" />
                  </button>
                </div>
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
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setData({
                        resume_id: resume_id,
                        job_id: localStorage.getItem("job_id") || "",
                        question_id: question.tech_ques_id,
                        question_type: "technical",
                      });
                      setUpdateStatus(true);
                    }}
                    className="ml-2"
                  >
                    <FontAwesomeIcon icon={faRedo} />
                  </button>
                  <button
                    onClick={() =>
                      deleteQuestion({
                        resume_id: resume_id,
                        jobId: localStorage.getItem("job_id") || "",
                        question_id: question.tech_ques_id,
                        question_type: "technical",
                        toast: toast,
                      })
                    }
                  >
                    <FontAwesomeIcon icon={faTrash} color="red" />
                  </button>
                  <button
                    onClick={() => {
                      setEditData({
                        resume_id: resume_id,
                        job_id: localStorage.getItem("job_id") || "",
                        question_id: question.tech_ques_id,
                        question_type: "technical",
                        question: question.question,
                        options: question.options,
                      });
                      setEditStatus(true);
                    }}
                  >
                    <FontAwesomeIcon icon={faEdit} color="green" />
                  </button>
                </div>
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
            {codingQuestion.map((question, index) => (
              <div key={index} className="mb-4 relative">
                <div className="flex justify-between items-center mb-2">
                  <p>
                    <span className="font-semibold">Question:</span>{" "}
                    {question.question}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setData({
                          resume_id: resume_id,
                          job_id: localStorage.getItem("job_id") || "",
                          question_id: question.coding_ques_id,
                          question_type: "coding",
                        });
                        setUpdateStatus(true);
                      }}
                      className="ml-2"
                    >
                      <FontAwesomeIcon icon={faRedo} />
                    </button>
                    <button
                      onClick={() =>
                        deleteQuestion({
                          resume_id: resume_id,
                          jobId: localStorage.getItem("job_id") || "",
                          question_id: question.coding_ques_id,
                          question_type: "coding",
                          toast: toast,
                        })
                      }
                    >
                      <FontAwesomeIcon icon={faTrash} color="red" />
                    </button>
                    <button
                      onClick={() => {
                        setEditData({
                          resume_id: resume_id,
                          job_id: localStorage.getItem("job_id") || "",
                          question_id: question.coding_ques_id,
                          question_type: "coding",
                          question: question.question,
                          sample_input: question.sample_input,
                          sample_output: question.sample_output,
                        });
                        setEditStatus(true);
                      }}
                    >
                      <FontAwesomeIcon icon={faEdit} color="green" />
                    </button>
                  </div>
                </div>
                <p>
                  <span className="font-semibold">Sample Input:</span>{" "}
                  {question.sample_input}
                </p>
                <p>
                  <span className="font-semibold">Sample Output:</span>{" "}
                  {question.sample_output}
                </p>
              </div>
            ))}
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
