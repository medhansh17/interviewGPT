import React, { useState, FC, useEffect } from "react";

interface QuestionProps {
    question: string;
    type: string;
    answer: string;
    updatePercentage: (title: string, percentage: number) => void;
    keywords: any;
}

const QuestionAccordion: FC<QuestionProps> = ({ question, type, answer, keywords, updatePercentage }) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

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

    return (
        <div className="border rounded shadow-sm p-4 mt-4">
            <div className="md:flex gap-4">
                <p className="text-lg font-medium">{question}</p>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleOptionClick("Correct")}
                        className={` ${selectedOption === "Correct" ? 'bg-[green]' : 'hover:bg-green-500 text-green-500 hover:text-white'} h-[2rem] py-0 px-4 border ${selectedOption === "Correct" ? 'border-green-500' : 'border-green-500 hover:border-transparent'} rounded font-medium`}
                    >
                        Correct
                    </button>
                    <button
                        onClick={() => handleOptionClick("PartiallyCorrect")}
                        className={`w-[10rem]  ${selectedOption === "PartiallyCorrect" ? 'bg-yellow-500 text-white' : 'hover:bg-yellow-500 text-yellow-500 hover:text-white'} h-[2rem] py-0 px-4 border ${selectedOption === "PartiallyCorrect" ? 'border-yellow-500' : 'border-yellow-500 hover:border-transparent'} rounded font-medium`}
                    >
                        Partially Correct
                    </button>
                    <button
                        onClick={() => handleOptionClick("Incorrect")}
                        className={` ${selectedOption === "Incorrect" ? 'bg-red-500 text-white' : 'hover:bg-red-500 text-red-500 hover:text-white'} h-[2rem] py-0 px-4 border ${selectedOption === "Incorrect" ? 'border-red-500' : 'border-red-500 hover:border-transparent'} rounded font-medium`}
                    >
                        Incorrect
                    </button>
                    <button
                        onClick={() => handleOptionClick("Skip")}
                        className={` ${selectedOption === "Skip" ? 'bg-orange-500 text-white' : 'hover:bg-orange-500 text-orange-500 hover:text-white'} h-[2rem] py-0 px-4 border ${selectedOption === "Skip" ? 'border-orange-500' : 'border-orange-500 hover:border-transparent'} rounded font-medium`}
                    >
                        Skip
                    </button>
                </div>
            </div>

            <div className="inline-block px-3 py-px mb-4 text-xs font-semibold tracking-wider text-[#fff] uppercase rounded-full bg-[green]">
                {type}
            </div>
            <p className="text-gray-700">Technical Skill: {answer}</p>
            <p className="text-gray-700 mt-[0.5rem] font-bold">Keywords: {keywords}</p>

        </div>
    );
};

interface AccordionProps {
    title: string;
    techSkill: any;
    updateTechSkillPercentage: (title: string, percentage: string) => void;
}

const calc = (part: number, whole: number) => isNaN(part) || isNaN(whole) || whole === 0 ? 0 : (part / whole) * 100;


const TechAccordion: FC<AccordionProps> = ({ title, techSkill, updateTechSkillPercentage }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [percentages, setPercentages] = useState<any>({});
    console.log("perc", percentages)

    const toggleAccordion = () => {
        setIsOpen((prevIsOpen) => !prevIsOpen);
    };

    const updatePercentage = (question: string, percentage: number) => {
        setPercentages((prevPercentages: String) => ({
            ...prevPercentages,
            [question]: percentage,
        }));
        updateTechSkillPercentage(title, calculateTotalPercentage());
    };

    const calculateTotalPercentage = () => {
        let keys = Object.keys(percentages);
        let totalRightWrongSum = 0;
        keys?.map(itm => {
            console.log('addnibg -> ', percentages[itm])
            totalRightWrongSum += percentages[itm]
        })
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
            >
                <p onClick={toggleAccordion} className={`font-semibold	`}>
                    {title}
                </p>
            </button>
            {isOpen && (
                <div className="p-4 pt-0">
                    {techSkill?.technical_skills?.technical_skills?.find(
                        (item: { name: string }) => item.name === title
                    )?.questions?.map((question: any, index: number) => (
                        <QuestionAccordion
                            key={index}
                            question={question.question}
                            type={question.type}
                            answer={question.answer}
                            updatePercentage={updatePercentage}
                            keywords={question.keywords}
                        />
                    ))}
                    {/* <p>Total Percentage: {calculateTotalPercentage()}%</p> */}
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
    const [techSkillPercentages, setTechSkillPercentages] = useState<{ [key: string]: number }>({});
    setTechSkillOne(techSkillPercentages)
    console.log("texhskill", techSkillPercentages)
    useEffect(() => {
        // Load data from local storage when component mounts
        const storedData = localStorage.getItem("techSkillPercentages");
        if (storedData) {
            setTechSkillPercentages(JSON.parse(storedData));
        }
    }, []);

    useEffect(() => {
        // Save data to local storage whenever techSkillPercentages changes
        localStorage.setItem("techSkillPercentages", JSON.stringify(techSkillPercentages));
    }, [techSkillPercentages]);

    const updateTechSkillPercentage = (title: string, percentage: string) => {
        setTechSkillPercentages((prevTechSkillPercentages: any) => ({
            ...prevTechSkillPercentages,
            [title]: percentage,
        }));
    };

    return (
        <div className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
            <div className="max-w-xl sm:mx-auto lg:max-w-[90rem]">
                <div className="flex flex-col 6 sm:text-center">
                    {techSkill && <h1 className="text-[2.5rem] ">Technical Skills</h1>}
                </div>
                <div className="space-y-4">
                    {techSkill?.technical_skills?.technical_skills?.map(
                        (item: { name: string }, index: number) => (
                            <TechAccordion
                                key={index}
                                title={item?.name}
                                techSkill={techSkill}
                                updateTechSkillPercentage={updateTechSkillPercentage}
                            />
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default Faq;
