import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../customAxios/Axios";
import { useLoader } from "@/context/loaderContext";
// import Timer from "./Timer";

interface QuestionProps {
  candidate_id: string;
  questions: any[];
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
}

const McqMain: React.FC<QuestionProps> = ({
  candidate_id,
  questions,
  currentIndex,
  setCurrentIndex,
}: QuestionProps) => {
  const { setLoading } = useLoader();
  const [selectedOptions, setSelectedOptions] = useState<{
    [key: number]: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setSelectedOptions({});
  }, [questions]);

  const previousbtn = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
    }
  };

  const nextbtn = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handleOptionChange = (value: string) => {
    setSelectedOptions((prevOptions) => ({
      ...prevOptions,
      [currentIndex]: value,
    }));
  };

  const submitMcq = async () => {
    setLoading(true);
    setIsSubmitting(true);
    const payload = {
      candidate_id: candidate_id,
      job_id: localStorage.getItem("job_id"),
      answers: questions.map((question, index) => ({
        user_answer: selectedOptions[index] || "",
        question_id: question.tech_ques_id,
      })),
    };
    try {
      const resp = await api.post("/store_tech_response", payload);
      if (resp.status === 200) {
        setLoading(false);
        navigate("/code");
      } else {
        setLoading(false);
        alert("Error submitting answers");
      }
    } catch (error) {
      setLoading(false);
      alert("Error submitting answers");
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  // Check if all questions have been answered
  const allQuestionsAnswered = questions.every(
    (_, index) => selectedOptions[index] !== undefined
  );

  return (
    <div className="w-full">
      {questions ? (
        <>
          <div className="bg-zinc-200 dark:bg-zinc-900 p-2">
            <div className="flex justify-between items-center">
              <div className="text-lg font-semibold text-zinc-800 dark:text-white">
                Online Technical Assessment
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
            </div>
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
            <div className="flex justify-between mt-4">
              <span>
                <button
                  className={` text-white px-3 py-1 rounded-md ${
                    currentIndex === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                  onClick={previousbtn}
                  disabled={currentIndex === 0}
                >
                  PREVIOUS
                </button>
                <button
                  className={` text-white px-3 py-1 rounded-md ml-4 ${
                    currentIndex === questions.length - 1
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                  onClick={nextbtn}
                  disabled={currentIndex === questions.length - 1}
                >
                  NEXT
                </button>
              </span>
              <button
                className={`bg-blue-500 text-white px-4 py-2 rounded ${
                  allQuestionsAnswered
                    ? "hover:bg-blue-600"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
                disabled={!allQuestionsAnswered || isSubmitting}
                onClick={submitMcq}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </>
      ) : (
        <div>Loading questions...</div>
      )}
    </div>
  );
};

export default McqMain;
