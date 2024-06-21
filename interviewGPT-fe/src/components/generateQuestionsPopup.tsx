import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useToast } from "./toast";
import { useLoader } from "@/context/loaderContext";
import api from "@/components/customAxios/Axios";

interface GenerateQuestionsPopupProps {
  resume_id: string;
  job_id: number | null;
  setPop: (show: boolean) => void;
}

export default function GenerateQuestionsPopup({
  resume_id,
  job_id,
  setPop,
}: GenerateQuestionsPopupProps) {
  const { setLoading } = useLoader();
  const toast = useToast();
  const [numBehavioral, setNumBehavioral] = useState(1);
  const [numMCQ, setNumMCQ] = useState(1);
  const [numCoding, setNumCoding] = useState(0);

  if (job_id === null) {
    toast.error({
      type: "background",
      duration: 3000,
      status: "Error",
      title: "Error fetching job details",
      description: "Job ID is null",
      open: true,
    });
    return null;
  }

  const handleProceed = async () => {
    setPop(false);
    setLoading(true);
    try {
      const resp = await api.post("/CHECK_Auto_assessment", {
        job_id,
        resume_id: resume_id,
        no_tech_questions: numMCQ,
        no_behav_questions: numBehavioral,
        no_code_question: numCoding,
      });
      if (resp.statusText === "OK") window.location.reload();
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      toast.error({
        type: "background",
        duration: 3000,
        status: "Error",
        title: "Error fetching candidate details",
        description: err?.message,
        open: true,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
      <div className="relative bg-white dark:bg-zinc-700 rounded-lg shadow p-6 w-full max-w-lg">
        <button
          className="absolute top-4 right-4 bg-blue-500 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center"
          onClick={() => setPop(false)}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <h2 className="text-lg font-semibold mb-4">
          Enter Number of Questions
        </h2>

        <div className="mb-4 flex">
          <div className="w-1/2">
            <label htmlFor="numBehavioral" className="block">
              Number of Behavioral Questions:
            </label>
            <p className="text-sm">*Max 5</p>
          </div>
          <div className="w-1/2">
            <input
              type="number"
              id="numBehavioral"
              min={1}
              max={5}
              value={numBehavioral}
              onChange={(e) => setNumBehavioral(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 w-full"
            />
          </div>
        </div>

        <div className="mb-4 flex">
          <div className="w-1/2">
            <label htmlFor="numMCQ" className="block">
              Number of MCQ Questions:
            </label>
            <p className="text-sm">*Max 5</p>
          </div>
          <div className="w-1/2">
            <input
              type="number"
              id="numMCQ"
              min={1}
              max={5}
              value={numMCQ}
              onChange={(e) => setNumMCQ(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 w-full"
            />
          </div>
        </div>

        <div className="mb-4 flex">
          <div className="w-1/2">
            <label htmlFor="numCoding" className="block">
              Number of Coding Questions:
            </label>
            <p className="text-sm">*Max 3</p>
          </div>
          <div className="w-1/2">
            <input
              type="number"
              id="numCoding"
              min={0}
              max={3}
              value={numCoding}
              onChange={(e) => setNumCoding(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 w-full"
            />
          </div>
        </div>

        <button
          className="bg-blue-500 text-white p-2 rounded-lg shadow w-full"
          onClick={handleProceed}
        >
          Proceed
        </button>
      </div>
    </div>
  );
}
