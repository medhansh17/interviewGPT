import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { UpdateQuestionData } from "./generatedQuesPopup";
import api from "@/components/customAxios/Axios";
import { useToast } from "./toast";
export default function UpdateQuestionPopup({
  onClose,
  data,
}: {
  onClose: () => void;
  data: UpdateQuestionData | undefined;
}) {
  const toast = useToast();
  const [question, setQuestion] = useState("");
  const [updating, setUpdating] = useState(false);
  const handleUpdate = () => {
    if (!data) return;
    setUpdating(true);
    const payload = {
      resume_id: data.resume_id,
      job_id: data.job_id,
      question_id: data.question_id,
      question_type: data.question_type,
      topic_prompt: question,
    };
    try {
      api
        .post("/update_candidate_question", payload, {
          headers: { "Content-Type": "application/json" },
        })
        .then((response) => {
          if (response.status === 200) {
            onClose();
          }
          toast.success({
            type: "background",
            duration: 3000,
            status: "Success",
            title: "Question Updated Successfully",
            description: "",
            open: true,
          });
          setUpdating(false);
        })
        .catch((error) => {
          console.error(
            "Error updating question:",
            error.response ? error.response.data : error.message
          );
          setUpdating(false);
        });
    } catch (err) {
      console.log(err);
      setUpdating(false);
    }
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
          Update Question
        </h2>
        <div className="mb-4">
          <label htmlFor="question" className="block">
            Enter Prompt:
          </label>
          <textarea
            id="question"
            className="border border-gray-300 rounded px-2 py-1 w-full"
            rows={5}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          ></textarea>
        </div>
        <div className="flex justify-end">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleUpdate}
            disabled={updating}
          >
            {updating ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}
