import { useEffect, useState } from "react";
import McqMain from "./McqMain";
import New_Sidebar from "../navbar.component";
import { useNavigate } from "react-router-dom";

const Mcq = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [technicalQuestions, setTechnicalQuestions] = useState<any[]>([]);
  const beha = sessionStorage.getItem("question");
  useEffect(() => {
    const behaveQues = async () => {
      setTechnicalQuestions(beha ? JSON.parse(beha).tech_questions : []);
    };
    behaveQues();
  }, []);
  if (technicalQuestions.length === 0) navigate("/code");
  return (
    <div className="flex h-screen">
      {technicalQuestions.length > 0 && (
        <>
          <New_Sidebar />
          <McqMain
            candidate_id={beha ? JSON.parse(beha).candidate_id : ""}
            questions={technicalQuestions}
            setCurrentIndex={setCurrentIndex}
            currentIndex={currentIndex}
          />
        </>
      )}
    </div>
  );
};

export default Mcq;
