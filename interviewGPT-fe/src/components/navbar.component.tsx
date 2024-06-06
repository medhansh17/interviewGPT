import { useState } from "react";
import { useLocation } from "react-router-dom";

interface BehavioralQuestion {
  b_question_id: string;
  b_question_text: string;
}

interface CodingQuestion {
  coding_ques_id: string;
  question: string;
  sample_input: string;
  sample_output: string;
}

interface TechnicalQuestion {
  tech_ques_id: string;
  question: string;
  options: { [key: string]: string };
  answer: string;
}

interface InterviewQuestions {
  Behaviour_q: BehavioralQuestion[];
  coding_question?: CodingQuestion[];
  tech_questions: TechnicalQuestion[];
}

const New_Sidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const questions = JSON.parse(
    sessionStorage.getItem("question") || "{}"
  ) as InterviewQuestions;
  const bhq = questions?.Behaviour_q;
  const codingQuestions = questions?.coding_question;
  const tech = questions?.tech_questions;

  return (
    <>
      {!sidebarOpen && (
        <span
          className="text-white text-4xl top-5 left-4 cursor-pointer"
          onClick={toggleSidebar}
        >
          <i className="md:hidden bi bi-filter-left px-2 bg-white rounded-md text-black"></i>
        </span>
      )}
      <div
        id="sidebar"
        className={`sidebar md:block ${
          sidebarOpen ? "block" : "hidden"
        } top-0 bottom-0 lg:left-0 p-2 w-[300px]  overflow-y-auto text-center bg-white border-r-[1px] border-gray-900`}
      >
        <div className="text-black text-xl">
          <div className="p-2.5 mt-1 ">
            <img src="./assets/blueticklogo.webp" alt="logo" />
            <i
              className="bi bi-x cursor-pointer ml-28 lg:hidden"
              onClick={toggleSidebar}
            ></i>
          </div>
        </div>
        <div className="my-2 bg-gray-600 h-[1px]"></div>

        {/* Behavioral Questions */}
        <div
          className={`p-2.5 mt-3 flex rounded-md   ${
            pathname === "/test"
              ? "text-white bg-blue-500"
              : pathname === "mcq-main" || "code"
              ? "text-gray-600"
              : ""
          }`}
        >
          <div className="flex justify-between w-full">
            <span className={`text-[15px]  font-bold `}>
              1. Behavioural Assessment
            </span>
          </div>
        </div>
        <div className="text-left text-sm mt-2 w-4/5 mx-auto text-black font-bold">
          {bhq &&
            bhq.map((question, index) => (
              <h1
                key={question.b_question_id}
                className="cursor-pointer p-2 hover:bg-blue-600 rounded-md mt-1 font-medium"
              >
                Question {index + 1}
              </h1>
            ))}
        </div>

        {/* Technical Questions */}
        <div
          className={`p-2.5 mt-3 flex rounded-md   ${
            pathname === "/mcq-main"
              ? "text-white bg-blue-500"
              : pathname === "/code"
              ? "text-gray-600"
              : ""
          }`}
        >
          <div className="flex justify-between w-full">
            <span className="text-[15px]  font-bold">
              2. Technical Assessment
            </span>
          </div>
        </div>
        <div className="text-left text-sm mt-2 w-4/5 mx-auto text-black font-bold">
          {tech &&
            tech.map((question, index) => (
              <h1
                key={question.tech_ques_id}
                className="cursor-pointer p-2 hover:bg-blue-600 rounded-md mt-1 font-medium"
              >
                Question {index + 1}
              </h1>
            ))}
        </div>

        {/* Coding Questions */}
        <div
          className={`p-2.5 mt-3 flex rounded-md   ${
            pathname === "/code" ? "text-white bg-blue-500" : ""
          }`}
        >
          <div className="flex justify-between w-full">
            <span className="text-[15px] font-bold">3. Coding Assessment</span>
          </div>
        </div>
        <div className="text-left text-sm mt-2 w-4/5 mx-auto text-black font-bold">
          {codingQuestions &&
            codingQuestions.map((question, index) => (
              <h1
                key={question.coding_ques_id}
                className="cursor-pointer p-2 hover:bg-blue-600 rounded-md mt-1 font-medium"
              >
                Question {index + 1}
              </h1>
            ))}
        </div>
      </div>
    </>
  );
};

export default New_Sidebar;
