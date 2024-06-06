import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "./customAxios/Axios";

const MainAssessment = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [technicalQuestions, setTechnicalQuestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();
  useEffect(() => {
    const fetchTechnicalQuestions = async () => {
      const resp = await api.post("/fetch_technical_questions", {
        candidate_name: "Medhansh Jain",
        job_id: "3b410f8c-3abc-4d22-ac96-fe2f98cae6be",
      });
      setTechnicalQuestions(resp.data.tech_questions);
    };
    fetchTechnicalQuestions();
  }, []);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className=" bg-zinc-100 p-3" style={{ width: "22%" }}>
      <div className="pb-3 text-center border-b-2 border-zinc-400 py-[2rem] pb-[1.1rem]">
        Problems
      </div>
      <ul className="mt-3">
        <Link to="">
          <li className="mb-2">
            <button
              className={`flex  items-center w-full p-2 ${
                location.pathname === "/test" ? "bg-blue-400" : "bg-blue-500"
              } text-white rounded-lg`}
            >
              <span className="mr-2">1.</span>Behavioral Round
            </button>
          </li>
        </Link>
        <Link to="">
          <li className="mb-2" onClick={toggleDropdown}>
            <button
              className={`flex  items-center w-full p-2 ${
                location.pathname === "/mcq-main"
                  ? "bg-blue-400"
                  : "bg-blue-500"
              } text-white rounded-lg`}
            >
              <span className="mr-2">2.</span>Technical Round
            </button>
          </li>
        </Link>
        {showDropdown && (
          <ul className="mt-3">
            {technicalQuestions.map((item: any, index: number) => {
              return (
                <li
                  className="mb-2"
                  key={item.id}
                  onClick={() => setCurrentIndex(index)}
                >
                  <button
                    className={
                      currentIndex == index
                        ? `flex  items-center w-full p-2 bg-blue-400 text-white rounded-lg`
                        : "w-full text-left p-2 bg-zinc-200 hover:bg-zinc-300 rounded"
                    }
                  >
                    <span className="mr-2">{index + 1}.</span> Question{" "}
                    {index + 1}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <Link to="">
          <li className="mb-2">
            <button
              className={`flex  items-center w-full p-2 ${
                location.pathname === "/code" ? "bg-blue-400" : "bg-blue-500"
              } text-white rounded-lg`}
            >
              <span className="mr-2">3.</span>Coding Round
            </button>
          </li>
        </Link>
      </ul>
    </div>
  );
};

export default MainAssessment;
