import React, { useEffect, useState } from "react";
import {
  TETabs,
  TETabsContent,
  TETabsItem,
  TETabsPane,
} from "tw-elements-react";
import Popover from "./Popover";
// import Header from "./Header";

// interface QuestionAccordionProps {
//     question: string;
//     type: string;
//     answer: string;
//     keywords: any;
//     updatePercentage: (title: string, percentage: number) => void;
// }

const QuestionAccordion = ({
  question,
  type,
  answer,
  keywords,
  updatePercentage,
}: any) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(true);
  console.log("setShowAnswer", setShowAnswer);

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);

    const percentage = calculatePercentage(option);

    updatePercentage(question, percentage);
  };

  const calculatePercentage = (option: string) => {
    switch (option) {
      case "Correct":
        return 1;
      case "PartiallyCorrect":
        return 0.75;
      case "Incorrect":
        return 0;
      default:
        return 0;
    }
  };

  // const toggleAnswer = () => {
  //     setShowAnswer((prevShowAnswer) => !prevShowAnswer);
  // };

  // const getDifficultyColor = () => {
  //     const difficulty = softSkill?.soft_skills?.soft_skills[0]?.questions?.find(
  //         (item: { question: string }) => item.question === title
  //     )?.type;

  //     console.log("difficulty", difficulty)

  //     switch (difficulty) {
  //         case "Basic":
  //             return "bg-green-500 text-white";
  //         case "Intermediate":
  //             return "bg-orange-500 text-white";
  //         case "Hard":
  //             return "bg-red-500 text-white";
  //         default:
  //             return "bg-gray-500 text-white"; // Default color for unknown difficulty
  //     }
  // };

  const getDifficultyColor = () => {
    switch (type) {
      case "Basic":
        return "bg-green-500 text-white";
      case "Intermediate":
        return "bg-yellow-500 text-white";
      case "Advanced":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white"; // Default color for unknown difficulty
    }
  };

  return (
    <div className="border rounded shadow-sm p-4 mt-4 mx-[1rem] md:w-[100%] " style={{backgroundColor:"rgba(173, 216, 230, 0.25)"}}>
      <div className="cursor-pointer">
        <div className="flex flex-col items-baseline gap-4 flex-wrap">
          <div className={`inline-block h-3.5 w-3.5 rounded-full  ${getDifficultyColor()}`}>
            {/* {type} */}
          </div>
          <div className="flex items-center justify-between gap-2 w-full">
            <p className="text-lg  cursor-pointer font-medium mb-4">{question}</p>
            <Popover data={answer} />
          </div>
        </div>

        <div className="flex md:flex-wrap lg:flex-nowrap items-center gap-3">
          <button
            title="correct"
            onClick={() => handleOptionClick("Correct")}
            className={`cursor-pointer bg-slate-50 ${selectedOption === "Correct" ? "bg-green-500 text-white" : "hover:bg-green-500 text-green-500 hover:text-white"} h-[2rem] py-0 px-4 border ${selectedOption === "Correct" ? "border-green-500" : "border-green-500 hover:border-transparent"} rounded font-medium`}
          >
            <img
              width="25"
              height="25"
              src={
                selectedOption === "Correct"
                  ? "https://img.icons8.com/color/48/checkmark--v1.png"
                  : "https://img.icons8.com/material-sharp/24/checkmark--v1.png"
              }
              alt="checkmark--v1"
            />
          </button>

          <button
            title="PartiallyCorrect"
            onClick={() => handleOptionClick("PartiallyCorrect")}
            className={`cursor-pointer bg-slate-50 ${selectedOption === "PartiallyCorrect" ? "bg-yellow-500 text-white" : "hover:bg-yellow-500 text-yellow-500 hover:text-white"} h-[2rem] py-0 px-4 border ${selectedOption === "PartiallyCorrect" ? "border-yellow-500" : "border-yellow-500 hover:border-transparent"} rounded font-medium`}
          >
            <img
              width="25"
              height="25"
              src={
                selectedOption === "PartiallyCorrect"
                  ? "https://img.icons8.com/color/48/inspection.png"
                  : "https://img.icons8.com/fluency-systems-regular/48/inspection.png"
              }
              alt="inspection"
            />
          </button>

          <button
            title="Incorrect"
            onClick={() => handleOptionClick("Incorrect")}
            className={`cursor-pointer bg-slate-50 ${selectedOption === "Incorrect" ? "bg-red-500 text-white" : "hover:bg-red-500 text-red-500 hover:text-white"} h-[2rem] py-0 px-4 border ${selectedOption === "Incorrect" ? "border-red-500" : "border-red-500 hover:border-transparent"} rounded font-medium`}
          >
            <img
              width="16"
              height="16"
              src={
                selectedOption === "Incorrect"
                  ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrGHgsTnDoquPLJ-NoOUq60tVZDgwd8YRGJw&usqp=CAU"
                  : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrGHgsTnDoquPLJ-NoOUq60tVZDgwd8YRGJw&usqp=CAU"
              }
              alt="external-incorrect"
            />
            
          </button>
        </div>
      </div>

      {/* <p className="text-gray-700">Technical Skill: {answer}</p> */}

      {/* Answer Accordion */}
      <div className="mt-4">
        {/* <button
                    onClick={toggleAnswer}
                    className="text-blue-500 hover:underline focus:outline-none"
                >
                    {showAnswer ? "Hide Answer" : "Show Answer"}
                </button> */}
        {showAnswer && (
          <div className="mt-2 text-gray-700">
            <hr className="my-2 border-blue-300 w-[100%] border-2" />

            {/* <p className="text-gray-700">Technical Skill: {answer}</p> */}
            <p className="text-gray-500 mt-[0.5rem] font-bold">
              <span className="text-green-600">Keywords</span>: {keywords}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

interface TabsProps {
  softSkill: any;
  setsoftSkillPercentage: any;
  techSkill: any;
  setTechSkillOne: any;
}
// interface AccordionProps {
//     title: string;
//     softSkill: any;
//     updatePercentage: (percentage: number) => void;
// }

const Accordion = ({ title, softSkill, updatePercentage }: any) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [percentageUpdated, setPercentageUpdated] = useState<boolean>(false);
  console.log("setIsOpen", setIsOpen);

  // const toggleAccordion = () => {
  //     setIsOpen((prevIsOpen) => !prevIsOpen);
  //     setPercentageUpdated(false);
  // };

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    if (!percentageUpdated) {
      updatePercentage(calculatePercentage(option));
      setPercentageUpdated(true);
    }
  };

  const calculatePercentage = (option: string) => {
    switch (option) {
      case "Correct":
        return 1;
      case "PartiallyCorrect":
        return 0.75;
      case "Incorrect":
        return 0;
      default:
        return 0;
    }
  };

  const getDifficultyColor = () => {
    const difficulty = softSkill?.soft_skills?.soft_skills[0]?.questions?.find(
      (item: { question: string }) => item.question === title,
    )?.type;

    console.log("difficulty", difficulty);

    switch (difficulty) {
      case "Basic":
        return "bg-green-500 text-white";
      case "Intermediate":
        return "bg-orange-500 text-white";
      case "Hard":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white"; // Default color for unknown difficulty
    }
  };

  return (
    <div className="border rounded shadow-sm " style={{backgroundColor:"#add8e640"}}>
      <div className="mx-[1rem]">
        <div className="flex flex-col items-baseline gap-4 flex-wrap">
          <div className={`inline-block mt-3 h-3.5 w-3.5 rounded-full  ${getDifficultyColor()}`}>
            {/* {type} */}
          </div>
          <div className="flex items-center justify-between mb-3 gap-8 w-full">
            <p className="text-lg text-black-400  font-medium">{title}</p>
            <Popover
              data={
                softSkill?.soft_skills?.soft_skills[0]?.questions?.find(
                  (item: { question: string }) => item.question === title,
                )?.answer
              }
            />
          </div>
        </div>

        <div className="flex md:flex-wrap lg:flex-nowrap items-center gap-3">
          <button
            title="correct"
            onClick={() => handleOptionClick("Correct")}
            className={`cursor-pointer bg-slate-50 ${selectedOption === "Correct" ? "bg-green-500 text-white" : "hover:bg-green-500 text-green-500 hover:text-white"} h-[2rem] py-0 px-4 border ${selectedOption === "Correct" ? "border-green-500" : "border-green-500 hover:border-transparent"} rounded font-medium`}
          >
            <img
              width="25"
              height="25"
              src={
                selectedOption === "Correct"
                  ? "https://img.icons8.com/color/48/checkmark--v1.png"
                  : "https://img.icons8.com/material-sharp/24/checkmark--v1.png"
              }
              alt="checkmark--v1"
            />
          </button>

          <button
            title="PartiallyCorrect"
            onClick={() => handleOptionClick("PartiallyCorrect")}
            className={`cursor-pointer bg-slate-50 ${selectedOption === "PartiallyCorrect" ? "bg-yellow-500 text-white" : "hover:bg-yellow-500 text-yellow-500 hover:text-white"} h-[2rem] py-0 px-4 border ${selectedOption === "PartiallyCorrect" ? "border-yellow-500" : "border-yellow-500 hover:border-transparent"} rounded font-medium`}
          >
            <img
              width="25"
              height="25"
              src={
                selectedOption === "PartiallyCorrect"
                  ? "https://img.icons8.com/color/48/inspection.png"
                  : "https://img.icons8.com/fluency-systems-regular/48/inspection.png"
              }
              alt="inspection"
            />
          </button>

          <button
            title="Incorrect"
            onClick={() => handleOptionClick("Incorrect")}
            className={`cursor-pointer bg-slate-50 ${selectedOption === "Incorrect" ? "bg-red-500 text-white" : "hover:bg-red-500 text-red-500 hover:text-white"} h-[2rem] py-0 px-4 border ${selectedOption === "Incorrect" ? "border-red-500" : "border-red-500 hover:border-transparent"} rounded font-medium`}
          >
            <img
              width="19"
              height="19"
              src={
                selectedOption === "Incorrect"
                  ? "./assets/intgptinto.png"
                  : "./assets/intgptinto.png"
              }
              alt="external-incorrect"
            />
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="p-4 ">
          <div>
            <hr className="my-2 border-blue-300 w-[100%] border-2" />
            {/* <p className="text-gray-700">
                            Soft Skill:{" "}
                            {softSkill?.soft_skills?.soft_skills[0]?.questions?.find(
                                (item: { question: string }) => item.question === title
                            )?.answer}
                        </p> */}
            <div>
              <p className="text-gray-600 mt-[0.5rem] font-bold mb-[0.5rem]">
                <span className="text-green-600">Keywords</span>:{" "}
                {
                  softSkill?.soft_skills?.soft_skills[0]?.questions?.find(
                    (item: { question: string }) => item.question === title,
                  )?.keywords
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Tabs: React.FC<TabsProps> = ({
  setsoftSkillPercentage,
  softSkill,
  techSkill,
}) => {
  const [basicActive, setBasicActive] = useState<string>("tab1");
  const [nestedActive, setNestedActive] = useState<string>("nestedTab1");

  useEffect(() => {
    setNestedActive("nestedTab1");
  }, []);

  console.log("datamain", techSkill);

  const handleBasicClick = (value: string) => {
    if (value === basicActive) {
      return;
    }
    setBasicActive(value);
  };

  const handleNestedClick = (value: string) => {
    if (value === nestedActive) {
      return;
    }
    setNestedActive(value);
  };

  const [overallPercentage, setOverallPercentage] = useState<any>(null);

  setsoftSkillPercentage((overallPercentage / 5) * 100);

  const updateOverallPercentage = (percentage: number) => {
    setOverallPercentage(
      (prevOverallPercentage: any) => prevOverallPercentage + percentage,
    );
  };

  return (
    <div>
      <div className="mb-1 md:mx-[2rem] shadow-lg">
        < div style={{backgroundColor:"lightblue"}}>
        <TETabs className="hover-style">
          <TETabsItem
            onClick={() => handleBasicClick("tab1")}
            active={basicActive === "tab1"}
            style={{ fontWeight: "bold", fontSize: "0.8rem",paddingTop:'0!important'}}
            className="font-bold"
          >
            Behavioural Assessment
          </TETabsItem>
          <TETabsItem
            onClick={() => handleBasicClick("tab2")}
            active={basicActive === "tab2"}
            style={{ fontWeight: "bold", fontSize: "0.8rem" }}
            className="font-bold"
          >
            Technical Assessment
          </TETabsItem>
        </TETabs>
        </div>

        <TETabsContent>
          <TETabsPane show={basicActive === "tab1"}>
            <div className="flex item-start">
              <TETabs>
                <TETabsItem
                  onClick={() => handleNestedClick("nestedTab1")}
                  active={nestedActive === "nestedTab1"}
                  style={{ fontWeight: "bold" }}
                  className="font-bold"
                >
                  Questions
                </TETabsItem>
              </TETabs>
            </div>

            <div className="flex" style={{ flexDirection: "row" }}>
              <TETabsContent>
                <TETabsPane show={nestedActive === "nestedTab1"}>
                  <div className="md:grid md:grid-cols-2 gap-8 mx-[3rem] mb-4">
                    {softSkill?.soft_skills?.soft_skills[0]?.questions?.map(
                      (item: { question: string }, index: number) => (
                        <Accordion
                          key={index}
                          title={item?.question}
                          softSkill={softSkill}
                          updatePercentage={updateOverallPercentage}
                        />
                      ),
                    )}
                  </div>
                </TETabsPane>
              </TETabsContent>
            </div>
          </TETabsPane>

          <TETabsPane show={basicActive === "tab2"}>
            <TETabs style={{display:"flex",gap:"20px",alignItems:"center"}} className="">
              {techSkill?.technical_skills?.technical_skills?.map(
                (item: { name: string }, index: number) => (
             
                  <TETabsItem
                    key={index}
                    onClick={() => handleNestedClick(item.name)}
                    active={nestedActive === item.name}
                    style={{ fontWeight: "bold" ,backgroundColor:"lightgray" }}
                    className="font-bold "
                  >
                    {item?.name}
                  </TETabsItem>
                ),
              )}

              {/* <TETabsItem
                            onClick={() => handleNestedClick("nestedTab2")}
                            active={nestedActive === "nestedTab2"}
                        >
                            Nested Tab 2
                        </TETabsItem> */}
            </TETabs>
            <div className="flex" style={{ flexDirection: "row" }}>
            <TETabsContent>
              {techSkill?.technical_skills?.technical_skills?.map(
                (item: { name: string; questions: any }, index: number) => (
                  // <TechAccordion
                  //     key={index}
                  //     title={item?.name}
                  //     techSkill={techSkill}
                  //     updateTechSkillPercentage={updateTechSkillPercentage}
                  // />
                  <TETabsPane key={index} show={nestedActive === item.name}>
                    <div className="md:grid md:grid-cols-2 gap-8 mx-[3rem] mb-4">
                    {item.questions?.map(
                      (question: any, questionIndex: number) => (
                        <QuestionAccordion
                          key={questionIndex}
                          question={question.question}
                          type={question.type}
                          answer={question.answer}
                          keywords={question.keywords}
                        />
                      ),
                    )}
                    </div>
                  </TETabsPane>
                ),
              )}

              <TETabsPane show={nestedActive === "nestedTab2"}>
                Nested Tab 2 content
              </TETabsPane>
              
            </TETabsContent>
            </div>
          </TETabsPane>
          <TETabsPane show={basicActive === "tab3"}>Tab 3 content</TETabsPane>
          <TETabsPane show={basicActive === "tab4"}>Tab 4 content</TETabsPane>
        </TETabsContent>
      </div>
    </div>
  );
};

export default Tabs;
