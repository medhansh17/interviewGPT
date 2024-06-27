import { useEffect, useState } from "react";
import MonacoEditor from "react-monaco-editor";
import api from "../customAxios/Axios";
import { useNavigate } from "react-router-dom";
// import Timer from "../McqComp/Timer";
import { useLoader } from "@/context/loaderContext";
import New_Sidebar from "../navbar.component";

interface CodingQuestion {
  coding_ques_id: number;
  question: string;
  sample_input: string;
  sample_output: string;
}

const Code = () => {
  const { setLoading } = useLoader();
  const [code, setCode] = useState<string>("");
  const navigate = useNavigate();
  const [canName, setCanname] = useState("");
  const [id, setId] = useState<number>();
  const beha = sessionStorage.getItem("question");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [codingQuestions, setCodingQuestions] = useState<CodingQuestion[]>([]);
  const [codeResponses, setCodeResponses] = useState<
    { question_id: number; user_code: string }[]
  >([]);

  useEffect(() => {
    const storedItemString = localStorage.getItem("item");
    if (storedItemString) {
      const storedItem = JSON.parse(storedItemString);
      setCanname(storedItem?.candidate_name);
      setId(storedItem?.job_id);
    }
    const codeQues = async () => {
      setCodingQuestions(beha ? JSON.parse(beha).coding_question : []);
    };
    codeQues();
  }, [canName, id]);

  const handleNext = () => {
    if (currentQuestionIndex < codingQuestions.length - 1) {
      saveCurrentCode();
      setCode(""); // Clear the code editor for the next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      saveCurrentCode();
      setCode(""); // Clear the code editor for the previous question
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const saveCurrentCode = async () => {
    setCodeResponses((prevResponses) => {
      const updatedResponses = [...prevResponses];
      const currentResponseIndex = updatedResponses.findIndex(
        (response) =>
          response.question_id ===
          codingQuestions[currentQuestionIndex].coding_ques_id
      );

      if (currentResponseIndex > -1) {
        updatedResponses[currentResponseIndex].user_code = code;
      } else {
        updatedResponses.push({
          question_id: codingQuestions[currentQuestionIndex].coding_ques_id,
          user_code: code,
        });
      }
      setCodeResponses(updatedResponses);
      return updatedResponses;
    });
  };

  const codeSubmit = async () => {
    setLoading(true);
    console.log(code);
    codeResponses.push({
      question_id: codingQuestions[currentQuestionIndex].coding_ques_id,
      user_code: code,
    });
    const resp = await api.post("/store_code_response", {
      candidate_id: beha ? JSON.parse(beha).candidate_id : "",
      job_id: localStorage.getItem("job_id"),
      code: codeResponses,
    });

    if (resp.status === 200) {
      setLoading(false);
      navigate("/success");
    } else {
      setLoading(false);
      alert("Error submitting answers");
    }
  };

  useEffect(() => {
    const currentResponse = codeResponses.find(
      (response) =>
        response.question_id ===
        codingQuestions[currentQuestionIndex]?.coding_ques_id
    );
    setCode(currentResponse ? currentResponse.user_code : "");
  }, [currentQuestionIndex]);

  if (codingQuestions.length === 0) {
    navigate("/success");
    return null;
  }

  const currentQuestion = codingQuestions[currentQuestionIndex];

  return (
    <div className="flex h-screen">
      <New_Sidebar />
      <div className="w-fit">
        <div className="bg-zinc-200 dark:bg-zinc-900 p-2">
          <div className="flex justify-between items-center">
            <div className="text-lg font-semibold text-zinc-800 dark:text-white">
              Online Coding Assessment
            </div>
            <div className="flex gap-4 ">
              <h1 className="text-lg font-semibold h-fit my-auto">
                {localStorage.getItem("item")
                  ? JSON.parse(localStorage.getItem("item")!).candidate_name
                  : ""}
              </h1>
              {localStorage.getItem("userSelfie") ? (
                <img
                  src={localStorage.getItem("userSelfie")!}
                  alt="selfie"
                  width={"100px"}
                  height={"100px"}
                  className="p-0"
                />
              ) : (
                ""
              )}
            </div>
            {/* <Timer /> */}
          </div>
        </div>

        <div className="md:flex-row bg-white-600 text-zinc-900 dark:text-zinc-100">
          <div className="flex">
            <div
              className="md:w-1/3 p-4 border-r border-zinc-300 dark:border-zinc-700"
              style={{ height: "100%", overflowY: "scroll" }}
            >
              <h2 className="font-bold text-lg mb-2">Question</h2>
              <p className="mb-4">{currentQuestion.question}</p>
              <h2 className="font-bold text-lg mt-4 mb-2">Sample Input</h2>
              <p className="mb-4 font-mono bg-zinc-200 dark:bg-zinc-700 p-1 rounded">
                {currentQuestion.sample_input}
              </p>
              <h2 className="font-bold text-lg mt-4 mb-2">Sample Output</h2>
              <div className="font-mono bg-zinc-200 dark:bg-zinc-700 p-1 rounded">
                {currentQuestion.sample_output}
              </div>
            </div>

            <div
              className="w-2/3 p-4"
              style={{ height: "80vh", overflowY: "scroll" }}
            >
              <div className="bg-white dark:bg-zinc-700 p-4 rounded shadow h-full overflow-auto">
                <MonacoEditor
                  height="100%"
                  language="javascript" // Set the language mode according to your requirement
                  theme="vs-dark" // Set the theme (dark, light, etc.)
                  value={code} // Initialize with the current code state
                  options={{
                    automaticLayout: true, // Adjust layout automatically
                    minimap: { enabled: false }, // Disable minimap
                  }}
                  onChange={(newValue) => {
                    setCode(newValue); // Handle code changes
                  }}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end w-[95%] mt-4">
            {currentQuestionIndex > 0 && (
              <button
                onClick={handlePrevious}
                className="bg-gray-500 text-white px-3 py-1 rounded mr-2"
              >
                Previous
              </button>
            )}
            {currentQuestionIndex < codingQuestions.length - 1 ? (
              <button
                onClick={handleNext}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Next
              </button>
            ) : (
              <button
                onClick={codeSubmit}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Submit Final
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Code;
