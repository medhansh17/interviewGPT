import { useState, FC } from "react";
import Header from "./Header";

interface AccordionProps {
    title: string;
    softSkill: any;
    updatePercentage: (percentage: number) => void;
}

const Accordion: FC<AccordionProps> = ({ title, softSkill, updatePercentage }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [percentageUpdated, setPercentageUpdated] = useState<boolean>(false);

    const toggleAccordion = () => {
        setIsOpen((prevIsOpen) => !prevIsOpen);
        setPercentageUpdated(false);
    };

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
            (item: { question: string }) => item.question === title
        )?.type;

        console.log("difficulty", difficulty)

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
        <div className="border rounded shadow-sm">
            <div className="md:flex justify-between  gap-4 mx-[1rem]">
                <button
                    type="button"
                    aria-label="Open item"
                    title="Open item"
                    className="flex items-center  p-4 focus:outline-none"
                    onClick={toggleAccordion}
                >
                    <div className="flex flex-col items-baseline gap-4 flex-wrap">
                        <p className={`inline-block px-3 py-px text-xs font-semibold tracking-wider text-[#fff] uppercase rounded-full ${getDifficultyColor()}`}>
                            {softSkill?.soft_skills?.soft_skills[0]?.questions?.find(
                                (item: { question: string }) => item.question === title
                            )?.type}
                        </p>
                        <p className="text-lg font-medium">
                            {title}

                        </p>




                    </div>

                </button>

                <div className="flex md:flex-wrap lg:flex-nowrap items-center gap-3">
                    <button
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
                    </button>
                    {/* <button
                        onClick={() => handleOptionClick("Skip")}
                        className={` ${selectedOption === "Skip" ? 'bg-orange-500 text-white' : 'hover:bg-orange-500 text-orange-500 hover:text-white'} h-[2rem] py-0 px-4 border ${selectedOption === "Skip" ? 'border-orange-500' : 'border-orange-500 hover:border-transparent'} rounded font-medium`}
                    >
                        Skip
                    </button> */}
                </div>
            </div>
            {isOpen && (
                <div className="p-4 pt-0">
                    <div>
                        <hr className="my-2 border-gray-300 w-[100%]" />
                        <p className="text-gray-700">
                            Soft Skill:{" "}
                            {softSkill?.soft_skills?.soft_skills[0]?.questions?.find(
                                (item: { question: string }) => item.question === title
                            )?.answer}
                        </p>
                        <p className="text-gray-700 mt-[0.5rem] font-bold	">
                            Keywords:{" "}
                            {softSkill?.soft_skills?.soft_skills[0]?.questions?.find(
                                (item: { question: string }) => item.question === title
                            )?.keywords}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

interface FaqProps {
    softSkill: any;
    setsoftSkillPercentage: any;
}

const Faq: FC<FaqProps> = ({ softSkill, setsoftSkillPercentage }) => {
    const [overallPercentage, setOverallPercentage] = useState<any>(null);

    setsoftSkillPercentage(overallPercentage / 5 * 100);

    const updateOverallPercentage = (percentage: number) => {
        setOverallPercentage((prevOverallPercentage: any) => prevOverallPercentage + percentage);
    };

    return (
        <>
        <Header />
        <div className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:w-[100%] md:px-24 lg:px-8 lg:py-8">
            <div className="max-w-xl sm:mx-auto lg:max-w-[90rem]">
                <div className="flex flex-col 6 sm:text-center">
                    {softSkill && <h1 className="text-[2.5rem]">Behavioural Assessment</h1>}
                </div>
                <div className="space-y-4">
                    {softSkill?.soft_skills?.soft_skills[0]?.questions?.map(
                        (item: { question: string }, index: number) => (
                            <Accordion
                                key={index}
                                title={item?.question}
                                softSkill={softSkill}
                                updatePercentage={updateOverallPercentage}
                            />
                        )
                    )}
                </div>
            </div>
        </div>
        </>
    );
};

export default Faq;
