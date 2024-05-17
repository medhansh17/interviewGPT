import React, { useEffect, useState } from "react";
import McqMain from "./McqMain";
import api from "../customAxios/Axios";
import MainAssessment from "../MainAssessment";
import SideBar2 from "../SideBar2";

const Mcq = () => {
  const [canName, setCanname] = useState("");
  const [id, setId] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [technicalQuestions, setTechnicalQuestions] = useState<any[]>([]);
  useEffect(() => {
    const storedItemString = localStorage.getItem("item");
    if (storedItemString) {
      const storedItem = JSON.parse(storedItemString);
      setCanname(storedItem?.candidate_name);
    }
    const id = localStorage.getItem("job_id");
    const behaveQues = async () => {
      const resp = await api.post("/fetch_technical_questions", {
        candidate_name: canName,
        job_id: id,
      });
      setTechnicalQuestions(resp.data.tech_questions);
      console.log(resp);
    };
    behaveQues();
  }, [canName, id]);

  const previousbtn = () => {
    if (currentIndex == 0) {
      setCurrentIndex(technicalQuestions.length - 1);
    } else setCurrentIndex(currentIndex - 1);
  };
  const nextbtn = () => {
    if (currentIndex == technicalQuestions.length - 1) {
      setCurrentIndex(0);
    } else setCurrentIndex(currentIndex + 1);
  };

  // const questions=[
  //   {id:1,question:"What is blah blah1 nbgctxawsgom t eswa    nbgctxawsgom t eswa            u  yf xw fgyffswwrtrpmbcfedggyrrewd nbgctxawsgom t eswa            u  yf xw fgyffswwrtrpmbcfedggyrrewd nbgctxawsgom t eswa            u  yf xw fgyffswwrtrpmbcfedggyrrewd         u  yf xw fgyffswwrtrpmbcfedggyrrewd"},
  //   {id:2,question:"What is blah blah2"},
  //   {id:3,question:"What is blah blah3"},
  //   {id:4,question:"What is blah blah4"},
  // ]
  console.log(technicalQuestions);
  // const {id,question}=questions[currentIndex]
  return (
    <div className="flex h-screen">
      {technicalQuestions.length > 0 && (
        <>
          <SideBar2
            questions={technicalQuestions}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
          />
          <McqMain
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
