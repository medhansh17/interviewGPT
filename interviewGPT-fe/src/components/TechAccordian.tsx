import { useState, FC, useEffect } from "react";
import Popover from "./Popover";

interface QuestionAccordionProps {
  question: string;
  type: string;
  answer: string;
  keywords: any;
  updatePercentage: (title: string, percentage: number) => void;
}

const QuestionAccordion: FC<QuestionAccordionProps> = ({
  question,
  type,
  answer,
  keywords,
  updatePercentage,
}) => {
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
        return "bg-orange-500 text-white";
      case "Advanced":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white"; // Default color for unknown difficulty
    }
  };

  return (
    <div className="border rounded shadow-sm p-4 mt-4">
      <div className="cursor-pointer">
        <div className="flex flex-col items-baseline gap-4 flex-wrap">
          <div className={`inline-block h-3 w-3  ${getDifficultyColor()}`}>
            {/* {type} */}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-lg font-bold cursor-pointer">{question}</p>
            <Popover data={answer} />
          </div>
        </div>

        <div className="flex md:flex-wrap lg:flex-nowrap items-center gap-3">
          <div
            onClick={() => handleOptionClick("Correct")}
            className="cursor-pointer"
          >
            {selectedOption === "Correct" ? (
              <img
                width="25"
                height="25"
                src="https://img.icons8.com/color/48/checkmark--v1.png"
                alt="checkmark--v1"
              />
            ) : (
              <img
                width="25"
                height="25"
                src="https://img.icons8.com/material-sharp/24/checkmark--v1.png"
                alt="checkmark--v1"
              />
            )}
          </div>
          <div
            className="cursor-pointer"
            onClick={() => handleOptionClick("PartiallyCorrect")}
          >
            {selectedOption === "PartiallyCorrect" ? (
              <img
                width="25"
                height="25"
                src="https://img.icons8.com/color/48/inspection.png"
                alt="inspection"
              />
            ) : (
              <img
                width="25"
                height="25"
                src="https://img.icons8.com/fluency-systems-regular/48/inspection.png"
                alt="inspection"
              />
            )}
          </div>
          <div
            className="cursor-pointer"
            onClick={() => handleOptionClick("Incorrect")}
          >
            {selectedOption === "Incorrect" ? (
              <img
                width="25"
                height="25"
                src="https://img.icons8.com/external-others-agus-raharjo/64/external-incorrect-flat-website-ui-others-agus-raharjo.png"
                alt="external-incorrect-flat-website-ui-others-agus-raharjo"
              />
            ) : (
              <img
                width="25"
                height="25"
                src="https://img.icons8.com/external-filled-agus-raharjo/64/external-incorrect-glyph-website-ui-filled-agus-raharjo.png"
                alt="external-incorrect-glyph-website-ui-filled-agus-raharjo"
              />
            )}
          </div>
          {/* <button
                        onClick={() => handleOptionClick("Correct")}
                        className={` ${selectedOption === "Correct" ? 'bg-[green] text-white' : 'hover:bg-green-500 text-green-500 hover:text-white'} h-[2rem] py-0 px-4 border ${selectedOption === "Correct" ? 'border-green-500' : 'border-green-500 hover:border-transparent'} rounded font-medium`}
                    >
                        Correct
                    </button>
                    <button
                        onClick={() => handleOptionClick("PartiallyCorrect")}
                        className={`${selectedOption === "PartiallyCorrect" ? 'bg-yellow-500 text-white' : 'hover:bg-yellow-500 text-yellow-500 hover:text-white'} h-[2rem] py-0 px-4 border ${selectedOption === "PartiallyCorrect" ? 'border-yellow-500' : 'border-yellow-500 hover:border-transparent'} rounded font-medium`}
                    >
                        Acceptable
                    </button>
                    <button
                        onClick={() => handleOptionClick("Incorrect")}
                        className={` ${selectedOption === "Incorrect" ? 'bg-red-500 text-white' : 'hover:bg-red-500 text-red-500 hover:text-white'} h-[2rem] py-0 px-4 border ${selectedOption === "Incorrect" ? 'border-red-500' : 'border-red-500 hover:border-transparent'} rounded font-medium`}
                    >
                        Incorrect
                    </button> */}
          {/* <button
                        onClick={() => handleOptionClick("Skip")}
                        className={` ${selectedOption === "Skip" ? 'bg-orange-500 text-white' : 'hover:bg-orange-500 text-orange-500 hover:text-white'} h-[2rem] py-0 px-4 border ${selectedOption === "Skip" ? 'border-orange-500' : 'border-orange-500 hover:border-transparent'} rounded font-medium`}
                    >
                        Skip
                    </button> */}
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
            <hr className="my-2 border-gray-300 w-[100%]" />

            {/* <p className="text-gray-700">Technical Skill: {answer}</p> */}
            <p className="text-gray-500 mt-[0.5rem] font-bold">
              Keywords: {keywords}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

interface TechAccordionProps {
  title: string;
  techSkill: any;
  updateTechSkillPercentage: (title: string, percentage: string) => void;
}

const calc = (part: number, whole: number) =>
  isNaN(part) || isNaN(whole) || whole === 0 ? 0 : (part / whole) * 100;

const TechAccordion: FC<TechAccordionProps> = ({
  title,
  techSkill,
  updateTechSkillPercentage,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [percentages, setPercentages] = useState<any>({});

  const toggleAccordion = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  const updatePercentage = (question: string, percentage: number) => {
    setPercentages((prevPercentages: any) => ({
      ...prevPercentages,
      [question]: percentage,
    }));
    updateTechSkillPercentage(title, calculateTotalPercentage());
  };

  const calculateTotalPercentage = () => {
    let keys = Object.keys(percentages);
    let totalRightWrongSum = 0;
    keys?.map((itm) => {
      totalRightWrongSum += percentages[itm];
    });
    let percentage = calc(totalRightWrongSum, keys?.length);
    return percentage.toFixed(2) + "%";
  };

  return (
    <div className="border rounded shadow-sm">
      <button
        type="button"
        aria-label="Open item"
        title="Open item"
        className="flex items-center justify-between w-full p-4 focus:outline-none"
        onClick={toggleAccordion}
      >
        <p className={`font-semibold`}>{title}</p>
      </button>
      {isOpen && (
        <div className="p-4 pt-0">
          {techSkill?.technical_skills?.technical_skills
            ?.find((item: { name: string }) => item.name === title)
            ?.questions?.map((question: any, index: number) => (
              <QuestionAccordion
                key={index}
                question={question.question}
                type={question.type}
                answer={question.answer}
                updatePercentage={updatePercentage}
                keywords={question.keywords}
              />
            ))}
        </div>
      )}
    </div>
  );
};

interface FaqProps {
  techSkill: any;
  setTechSkillOne: any;
}

const Faq: FC<FaqProps> = ({ techSkill, setTechSkillOne }) => {
  const [techSkillPercentages, setTechSkillPercentages] = useState<{
    [key: string]: number;
  }>({});
  setTechSkillOne(techSkillPercentages);

  useEffect(() => {
    // Load data from local storage when component mounts
    const storedData = localStorage.getItem("techSkillPercentages");
    if (storedData) {
      setTechSkillPercentages(JSON.parse(storedData));
    }
  }, []);

  useEffect(() => {
    // Save data to local storage whenever techSkillPercentages changes
    localStorage.setItem(
      "techSkillPercentages",
      JSON.stringify(techSkillPercentages),
    );
  }, [techSkillPercentages]);

  const updateTechSkillPercentage = (title: string, percentage: string) => {
    setTechSkillPercentages((prevTechSkillPercentages: any) => ({
      ...prevTechSkillPercentages,
      [title]: percentage,
    }));
  };

  return (
    <div className="">
      <div className="max-w-xl sm:mx-auto lg:max-w-[90rem]">
        <div className="flex flex-col 6 sm:text-center">
          {techSkill && (
            <h1 className="text-[2.5rem] ">Technical Assessment</h1>
          )}
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {techSkill?.technical_skills?.technical_skills?.map(
            (item: { name: string }, index: number) => (
              <TechAccordion
                key={index}
                title={item?.name}
                techSkill={techSkill}
                updateTechSkillPercentage={updateTechSkillPercentage}
              />
            ),
          )}
        </div>
      </div>
    </div>
  );
};

export default Faq;
