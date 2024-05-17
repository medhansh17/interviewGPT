import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone } from "@fortawesome/free-solid-svg-icons";
import AudioRecorder from "../audio_recorder";
import api from "../customAxios/Axios";
import { useNavigate } from "react-router-dom";
import MainAssessment from "../MainAssessment";

const Sample: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const navigate = useNavigate();
  const [canName, setCanname] = useState("");
  const [behavioralQuestions, setBehavioralQuestions] = useState<any[]>([]);
  const jobId = localStorage.getItem("job_id");

  useEffect(() => {
    const storedItemString = localStorage.getItem("item");
    if (storedItemString) {
      const storedItem = JSON.parse(storedItemString);
      console.log(storedItem);
      setCanname(storedItem?.candidate_name);
    }

    const fetchBehavioralQuestions = async () => {
      console.log(canName, jobId);
      try {
        if (canName && jobId) {
          const resp = await api.post("/fetch_behavioural_questions", {
            candidate_name: canName,
            job_id: jobId,
          });
          setBehavioralQuestions(resp.data.Behaviour_q);
        }
      } catch (error) {
        console.error("Error fetching behavioral questions:", error);
      }
      console.log("Fired");
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
    <div className="flex">
      <MainAssessment />
      <div style={{ width: "-webkit-fill-available" }}>
        <div className="bg-zinc-200 dark:bg-zinc-900 p-4">
          <div className="flex justify-between items-center">
            <div className="text-lg font-semibold text-zinc-800 dark:text-white">
              Online Coding Assessment
            </div>
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
              question="medhansh"
              canName={canName}
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
