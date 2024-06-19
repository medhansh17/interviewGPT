import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import api from "@/components/customAxios/Axios";
import { useToast } from "./toast";
import { EditQuestionData } from "./generatedQuesPopup";
import Loader from "./Loader";

const EditQuestionPopup = ({
  onClose,
  data,
}: {
  onClose: () => void;
  data: EditQuestionData | undefined;
}) => {
  const toast = useToast();
  const [question, setQuestion] = useState(data?.question || "");
  const [sampleInput, setSampleInput] = useState(data?.sample_input || "");
  const [sampleOutput, setSampleOutput] = useState(data?.sample_output || "");
  const [options, setOptions] = useState(data?.options || {});
  const [answer, setAnswer] = useState(data?.answer || ""); // State for answer
  const [updating, setUpdating] = useState(false);
  console.log(data);

  const handleUpdate = () => {
    if (!data) return;
    setUpdating(true);

    const payload = {
      resume_id: data.resume_id,
      job_id: data.job_id,
      question_id: data.question_id,
      question_type: data.question_type,
      question_data: {
        ...(data.question_type !== "behavioural" && { question: question }),
        ...(data.question_type === "coding" && {
          sample_input: sampleInput,
          sample_output: sampleOutput,
        }),
        ...(data.question_type === "technical" && {
          options: options,
          answer: answer,
        }),
        ...(data.question_type === "behavioural" && {
          b_question_text: question,
        }),
      },
    };

    api
      .post("/edit_candidate_question", payload, {
        headers: { "Content-Type": "application/json" },
      })
      .then((response) => {
        if (response.status === 200) {
          toast.success({
            type: "background",
            duration: 3000,
            status: "Success",
            title: "Question Updated Successfully",
            description: "",
            open: true,
          });
          onClose();
        }
      })
      .catch((error) => {
        console.error(
          "Error updating question:",
          error.response ? error.response.data : error.message
        );
        toast.error({
          type: "background",
          duration: 3000,
          status: "Error",
          title: "Error updating question",
          description: "",
          open: true,
        });
      })
      .finally(() => {
        setUpdating(false);
      });
  };

  const renderOptions = () => {
    return Object.keys(options).map((key) => (
      <div key={key} className="mb-2 flex items-center gap-2">
        <label className="block font-semibold mb-1">{`${key}`}</label>
        <input
          type="text"
          value={options[key]}
          onChange={(e) => setOptions({ ...options, [key]: e.target.value })}
          className="border border-gray-300 rounded px-2 py-1 w-full"
        />
      </div>
    ));
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-10">
      <div className="relative bg-white dark:bg-zinc-700 rounded-lg shadow p-6 w-full max-w-[600px] overflow-auto max-h-[calc(100vh-1rem)]">
        <button
          className="absolute top-2 right-2 text-black p-2"
          onClick={onClose}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <h2 className="text-xl font-semibold mb-2 text-center">
          Edit Question
        </h2>
        <div className="mb-4">
          <label htmlFor="question" className="block mb-2">
            {data?.question_type === "behavioural"
              ? "Enter Behavioral Question:"
              : "Enter Question:"}
          </label>
          <textarea
            id="question"
            className="border border-gray-300 rounded px-2 py-1 w-full"
            rows={5}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          ></textarea>
        </div>
        {data?.question_type === "technical" && (
          <>
            <div className="mb-4">
              <label className="block mb-2">Options:</label>
              {renderOptions()}
            </div>
            <div className="mb-4">
              <label htmlFor="answer" className="block mb-2">
                Answer:
              </label>
              <input
                id="answer"
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 w-full"
              />
            </div>
          </>
        )}
        {data?.question_type === "coding" && (
          <>
            <div className="mb-4">
              <label htmlFor="sampleInput" className="block mb-2">
                Sample Input:
              </label>
              <textarea
                id="sampleInput"
                className="border border-gray-300 rounded px-2 py-1 w-full"
                rows={3}
                value={sampleInput}
                onChange={(e) => setSampleInput(e.target.value)}
              ></textarea>
            </div>
            <div className="mb-4">
              <label htmlFor="sampleOutput" className="block mb-2">
                Sample Output:
              </label>
              <textarea
                id="sampleOutput"
                className="border border-gray-300 rounded px-2 py-1 w-full"
                rows={3}
                value={sampleOutput}
                onChange={(e) => setSampleOutput(e.target.value)}
              ></textarea>
            </div>
          </>
        )}
        <div className="flex justify-end">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleUpdate}
            disabled={updating}
          >
            {updating ? "Updating..." : "Update"}
          </button>
        </div>
        {updating && <Loader />}
      </div>
    </div>
  );
};

export default EditQuestionPopup;
