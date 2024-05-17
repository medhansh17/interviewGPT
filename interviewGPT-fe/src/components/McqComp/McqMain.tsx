import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../customAxios/Axios";
import Timer from "./Timer";
interface QuestionProps {
  questions: any[];
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
}

const McqMain: React.FC<QuestionProps> = ({
  questions,
  currentIndex,
  setCurrentIndex,
}: QuestionProps) => {
  const [selectedOptions, setSelectedOptions] = useState<{
    [key: number]: string;
  }>({});
  const navigate = useNavigate();
  const [canName, setCanname] = useState("");
  const [id, setId] = useState<number>();

  useEffect(() => {
    const storedItemString = localStorage.getItem("item");
    if (storedItemString) {
      const storedItem = JSON.parse(storedItemString);
      setCanname(storedItem?.candidate_name);
      setId(storedItem?.job_id);
    }
    // Initialize selected options when questions change
    setSelectedOptions({});
  }, [questions]);

  const previousbtn = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? questions.length - 1 : prevIndex - 1
    );
  };

  const nextbtn = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === questions.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleOptionChange = (value: string) => {
    setSelectedOptions((prevOptions) => ({
      ...prevOptions,
      [currentIndex]: value,
    }));
  };

  const submitMcq = async () => {
    const payload = {
      name: canName, // Replace with the actual name
      job_id: localStorage.getItem("job_id"), // Replace with the actual job ID
      question: {
        tech_questions: questions.map((question, index) => ({
          user_choice: selectedOptions[index] || "",
          options: question.options,
          question: question.question,
        })),
      },
    };
    navigate("/code");
    const resp = await api.post("/store_tech_response", payload);
    console.log(resp);
  };

  // Check if all questions have been answered
  const allQuestionsAnswered =
    Object.keys(selectedOptions).length === questions.length;

  return (
    <div className="flex-1">
      {questions ? (
        <div className="p-4">
          <div className="flex justify-between items-center mb-3 py-3 border-b-2 border-zinc-400">
            <h1 className="text-lg font-semibold ">MCQ Assessment</h1>
            <Timer />
          </div>
          <div className="mx-auto p-4">
            <h2 className="text-xl font-bold mb-4">
              Question {currentIndex + 1}
            </h2>
            <p className="mb-4">{questions[currentIndex].question}</p>
            <form>
              {Object.entries<string>(questions[currentIndex].options).map(
                ([key, value]) => (
                  <div key={key} className="mb-2 border p-2 rounded">
                    <label className="block">
                      <input
                        type="radio"
                        name={`question-${currentIndex}`}
                        value={key}
                        checked={selectedOptions[currentIndex] === key}
                        onChange={() => handleOptionChange(key)}
                        className="mr-2"
                      />
                      {`${key}) ${value}`}
                    </label>
                  </div>
                )
              )}
            </form>
            <div className="flex" style={{ justifyContent: "space-between" }}>
              <div>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md"
                  onClick={previousbtn}
                >
                  PREVIOUS
                </button>
                <button
                  className="bg-green-500 ml-8 hover:bg-green-600 text-white px-3 py-1 rounded-md mr-2"
                  onClick={nextbtn}
                >
                  NEXT
                </button>
              </div>
              <div>
                <button
                  className={`bg-blue-500 text-white px-4 py-2 rounded ${
                    allQuestionsAnswered ? "" : "bg-gray-400 cursor-not-allowed"
                  }`}
                  disabled={!allQuestionsAnswered}
                  onClick={submitMcq}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>helloooo</div>
      )}
    </div>
  );
};

export default McqMain;
