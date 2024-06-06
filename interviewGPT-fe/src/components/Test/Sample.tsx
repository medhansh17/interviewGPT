import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone } from "@fortawesome/free-solid-svg-icons";
import AudioRecorder from "../audio_recorder";
import { useNavigate } from "react-router-dom";
import New_Sidebar from "../navbar.component";

const Sample: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const navigate = useNavigate();
  const [canName, setCanname] = useState("");
  const [behavioralQuestions, setBehavioralQuestions] = useState<any[]>([]);
  const jobId = localStorage.getItem("job_id");
  const beha = sessionStorage.getItem("question");

  useEffect(() => {
    const storedItemString = localStorage.getItem("item");
    if (storedItemString) {
      const storedItem = JSON.parse(storedItemString);
      setCanname(storedItem?.candidate_name);
    }

    const fetchBehavioralQuestions = async () => {
      setBehavioralQuestions(beha ? JSON.parse(beha).Behaviour_q : []);
    };
    fetchBehavioralQuestions();
  }, [canName, jobId]);

  const complete = () => {
    navigate("/mcq-main");
  };

  const onToNextQuestion = () => {
    if (currentQuestionIndex < behavioralQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="flex h-screen">
      <New_Sidebar />
      <div style={{ width: "-webkit-fill-available" }}>
        <div className="bg-zinc-200 dark:bg-zinc-900 p-4">
          <div className="flex justify-between items-center">
            <div className="text-lg font-semibold text-zinc-800 dark:text-white">
              Online Behavioural Assessment
            </div>
            <h1 className="text-lg font-semibold ">
              {localStorage.getItem("item")
                ? JSON.parse(localStorage.getItem("item")!).candidate_name
                : ""}
            </h1>
          </div>
        </div>
        <div className="mx-auto py-8" style={{ width: "84%" }}>
          <p style={{ fontSize: "1.3rem" }}>
            {behavioralQuestions[currentQuestionIndex]?.b_question_text}
          </p>
        </div>
        <div
          className="relative m-auto p-4 bg-white shadow-lg rounded-lg flex justify-around"
          style={{ width: "84%", height: "70vh", flexDirection: "column" }}
        >
          <div className="text-xl font-semibold mb-4 text-center">
            Speak the answer to the question you hear
          </div>
          <div className="flex justify-center items-center ">
            <button className="bg-orange-500 text-white p-3 rounded-full w-20 h-20 flex items-center justify-center">
              <FontAwesomeIcon
                icon={faMicrophone}
                style={{ fontSize: "2rem" }}
              />
            </button>
          </div>
          <div className="flex justify-center items-center mt-4">
            <AudioRecorder
              question_id={
                behavioralQuestions[currentQuestionIndex]?.b_question_id
              }
              candidate_id={beha ? JSON.parse(beha).candidate_id : ""}
              jobId={localStorage?.getItem("job_id")}
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-4 ">
              <div className="text-orange-500 font-semibold text-center"></div>
              {currentQuestionIndex === behavioralQuestions.length - 1 ? (
                <button
                  onClick={complete}
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg"
                >
                  Finish
                </button>
              ) : (
                <button
                  onClick={onToNextQuestion}
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg"
                >
                  Next
                </button>
              )}
            </div>
            <div className="flex justify-end mt-4"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sample;
