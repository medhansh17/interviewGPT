import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import { EditQuestionData } from "./generatedQuesPopup";
import api from "@/components/customAxios/Axios";
import { useToast } from "./toast";

export default function EditQuestionDataPopup({
  onClose,
  data,
}: {
  onClose: () => void;
  data: EditQuestionData | undefined;
}) {
  const toast = useToast();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<{ [key: string]: string }>({});
  const [sampleInput, setSampleInput] = useState("");
  const [sampleOutput, setSampleOutput] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (data) {
      setQuestion(data.question || "");
      setOptions(data.options || {});
      setSampleInput(data.sample_input || "");
      setSampleOutput(data.sample_output || "");
    }
  }, [data]);

  const handleUpdate = () => {
    if (!data) return;
    setUpdating(true);
    const payload = {
      resume_id: data.resume_id,
      job_id: data.job_id,
      question_id: data.question_id,
      question_type: data.question_type,
      question: question,
      options: data.question_type === "technical" ? options : undefined,
      sample_input: data.question_type === "coding" ? sampleInput : undefined,
      sample_output: data.question_type === "coding" ? sampleOutput : undefined,
    };
    api
      .post("/update_candidate_question", payload, {
        headers: { "Content-Type": "application/json" },
      })
      .then((response) => {
        if (response.status === 200) {
          onClose();
          toast.success({
            type: "background",
            duration: 3000,
            status: "Success",
            title: "Question Updated Successfully",
            description: "",
            open: true,
          });
        }
        setUpdating(false);
      })
      .catch((error) => {
        toast.error({
          type: "background",
          duration: 3000,
          status: "Error",
          title: "Error updating question",
          description: error.response ? error.response.data.message : "",
          open: true,
        });
        setUpdating(false);
      });
  };

  const handleOptionChange = (key: string, value: string) => {
    setOptions((prevOptions) => ({ ...prevOptions, [key]: value }));
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
            Question:
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
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Options:</h3>
            {Object.entries(options).map(([key, value]) => (
              <div key={key} className="flex items-center mb-2">
                <label className="mr-2">{key}:</label>
                <input
                  type="text"
                  value={value}
                  className="border border-gray-300 rounded px-2 py-1 flex-grow"
                  onChange={(e) => handleOptionChange(key, e.target.value)}
                />
              </div>
            ))}
          </div>
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
      </div>
    </div>
  );
}
