import { useEffect, useState } from "react";
import MonacoEditor from "react-monaco-editor";
import api from "../customAxios/Axios";
import { useNavigate } from "react-router-dom";
import MainAssessment from "../MainAssessment";
import Timer from "../McqComp/Timer";
import New_Sidebar from "../navbar.component";

interface CodingQuestion {
  question: string;
  sample_input: string;
  sample_output: string;
}

const Code = () => {
  const [code, setCode] = useState<string>("");
  const navigate = useNavigate();
  const [canName, setCanname] = useState("");
  const [id, setId] = useState<number>();
  const [codingQuestion, setCodingQuestion] = useState<CodingQuestion>({
    question: "",
    sample_input: "",
    sample_output: "",
  });

  useEffect(() => {
    const storedItemString = localStorage.getItem("item");
    if (storedItemString) {
      const storedItem = JSON.parse(storedItemString);
      setCanname(storedItem?.candidate_name);
      setId(storedItem?.job_id);
    }
    const codeQues = async () => {
      const job_id = localStorage.getItem("job_id");
      const resp = await api.post("/fetch_coding_question", {
        candidate_name: canName,
        job_id: job_id,
      });
      console.log(resp);
      setCodingQuestion(resp.data.coding_question);
    };
    codeQues();
  }, [canName, id]);

  const codeSubmit = async () => {
    const resp = await api.post("/store_code_response", {
      name: canName,
      job_id: localStorage.getItem("job_id"),
      question: codingQuestion.question,
      code: code,
    });
    if (resp.statusText == "OK") {
      navigate("/success");
    }
  };
  return (
    <div className="flex h-screen">
      {/* <New_Sidebar /> */}
      <New_Sidebar />
      <div className="w-fit">
        <div className="bg-zinc-200 dark:bg-zinc-900 p-4">
          <div className="flex justify-between items-center">
            <div className="text-lg font-semibold text-zinc-800 dark:text-white">
              Online Coding Assessment
            </div>
            <Timer />
          </div>
        </div>

        <div className=" md:flex-row bg-white-600 text-zinc-900 dark:text-zinc-100 ">
          <div className="flex ">
            <div
              className="md:w-1/3 p-4 border-r border-zinc-300 dark:border-zinc-700"
              style={{ height: "100%", overflowY: "scroll" }}
            >
              <h2 className="font-bold text-lg mb-2">Question</h2>
              <p className="mb-4">{codingQuestion.question}</p>
              {/* <h2 className="font-bold text-lg mb-2">Output Format</h2>
    <p>Print the following two lines of output:</p>
    <ol className="list-decimal ml-4">
      <li>
        On the first line, print{' '}
        <span className="font-mono bg-zinc-200 dark:bg-zinc-700 p-1 rounded">Hello, World!</span>
      </li>
      <li>
        On the second line, print the contents of <span className="italic">parameterVariable</span>.
      </li>
    </ol> */}

              <h2 className="font-bold text-lg mt-4 mb-2">Sample Input </h2>
              <p className="mb-4 font-mono bg-zinc-200 dark:bg-zinc-700 p-1 rounded">
                {codingQuestion.sample_input}
              </p>

              <h2 className="font-bold text-lg mt-4 mb-2">Sample Output </h2>
              <div className="font-mono bg-zinc-200 dark:bg-zinc-700 p-1 rounded">
                {codingQuestion.sample_output}
              </div>

              <h2 className="font-bold text-lg mt-4 mb-2">Explanation 0</h2>
              <p>We printed two lines of output:</p>
              {/* <ol className="list-decimal ml-4">
      <li>
        We printed the literal string{' '}
        <span className="font-mono bg-zinc-200 dark:bg-zinc-700 p-1 rounded">Hello, World!</span> using
        the code provided in the editor.
      </li>
      <li>
        The value of <span className="italic">parameterVariable</span> passed to our main function in
        this Sample Case was{' '}
        <span className="font-mono bg-zinc-200 dark:bg-zinc-700 p-1 rounded">
          Welcome to 10 Days of JavaScript!
        </span>
        . We then passed our variable to <span className="font-mono">console.log</span>, which printed
        the contents of <span className="italic">parameterVariable</span>.
      </li>
    </ol> */}
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
                  value="" // You can initialize it with some code if needed
                  options={{
                    automaticLayout: true, // Adjust layout automatically
                    minimap: { enabled: false }, // Disable minimap
                  }}
                  onChange={(newValue) => {
                    setCode(newValue); // Handle code changes if needed
                  }}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end w-[95%]">
            <button
              onClick={codeSubmit}
              className="bg-green-500 text-white px-3 py-1 rounded"
            >
              Submit Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Code;
