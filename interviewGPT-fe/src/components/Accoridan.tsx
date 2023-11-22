import { useState, FC } from "react";

interface AccordionProps {
    title: string;
    softSkill: any;
    updatePercentage: (percentage: number) => void;
    setsoftSkillPercentage: any;
}

const Accordion: FC<AccordionProps> = ({ title, softSkill, updatePercentage }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    console.log("selectedOption", selectedOption)
    const [percentageUpdated, setPercentageUpdated] = useState<boolean>(false);

    const toggleAccordion = () => {
        setIsOpen((prevIsOpen) => !prevIsOpen);
        setPercentageUpdated(false); // Reset the flag when the accordion is toggled
    };

    const handleOptionClick = (option: string) => {
        setSelectedOption(option);
        console.log("Selected Option:", option);
        if (!percentageUpdated) {
            updatePercentage(calculatePercentage(option));
            setPercentageUpdated(true); // Set the flag to true after updating the percentage
        }
    };

    const calculatePercentage = (option: string) => {
        // Define your scoring logic here
        switch (option) {
            case "Correct":
                return 1;
            case "PartiallyCorrect":
                return 0.75;
            case "Incorrect":
                return 0;
            default:
                return 0; // Skip does not contribute to the percentage calculation
        }
    };

    return (
        <div className="border rounded shadow-sm">

            <div className="md:flex gap-4 mx-[1rem]">
                <button
                    type="button"
                    aria-label="Open item"
                    title="Open item"
                    className="flex items-center justify-between w-full p-4 focus:outline-none"
                    onClick={toggleAccordion}
                >
                    <p  className="text-lg font-medium">
                        {title}
                    </p>

                </button>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleOptionClick("Correct")}
                        className={` ${selectedOption === "Correct" ? 'bg-[green] text-white' : 'hover:bg-green-500 text-green-500 hover:text-white'} h-[2rem] py-0 px-4 border ${selectedOption === "Correct" ? 'border-green-500' : 'border-green-500 hover:border-transparent'} rounded font-medium`}
                    >
                        Correct
                    </button>
                    <button
                        onClick={() => handleOptionClick("PartiallyCorrect")}
                        className={`md:w-[10rem] h-[4rem] md:h-[2rem]  ${selectedOption === "PartiallyCorrect" ? 'bg-yellow-500 text-white' : 'hover:bg-yellow-500 text-yellow-500 hover:text-white'} h-[2rem] py-0 px-4 border ${selectedOption === "PartiallyCorrect" ? 'border-yellow-500' : 'border-yellow-500 hover:border-transparent'} rounded font-medium`}
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
            {isOpen && (
                <div className="p-4 pt-0">
                    <div>
                        <p className="inline-block px-3 py-px mb-4 text-xs font-semibold tracking-wider text-[#fff] uppercase rounded-full bg-[green]">
                            {softSkill?.soft_skills?.soft_skills[0]?.questions?.find(
                                (item: { question: string }) => item.question === title
                            )?.type}
                        </p>
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

    setsoftSkillPercentage(overallPercentage / 5 * 100)

    const updateOverallPercentage = (percentage: number) => {
        console.log("percentage", percentage)
        setOverallPercentage((prevOverallPercentage: any) => prevOverallPercentage + percentage);
    };
    return (
        <div className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
            <div className="max-w-xl sm:mx-auto lg:max-w-[90rem]">
                <div className="flex flex-col 6 sm:text-center">

                    {softSkill && <h1 className="text-[2.5rem]">Soft Skills</h1>}
                </div>
                <div className="space-y-4">
                    {softSkill?.soft_skills?.soft_skills[0]?.questions?.map(
                        (item: { question: string }, index: number) => (
                            <Accordion
                                key={index}
                                title={item?.question}
                                softSkill={softSkill}
                                updatePercentage={updateOverallPercentage}
                                setsoftSkillPercentage={setsoftSkillPercentage}
                            />
                        )
                    )}
                </div>

            </div>
        </div>
    );
};

export default Faq;
