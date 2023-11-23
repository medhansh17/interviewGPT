
import Accoridan from "./components/Accoridan";
import TechAccordian from "./components/TechAccordian";
import { useState, useEffect } from "react";
import ReportTable from "./components/ReportTable";
import html2canvas from 'html2canvas';


const MainPage = () => {
    const [softSkill, setSoftSkill] = useState<any | null>(null)
    const [techSkillOne, setTechSkillOne] = useState<any | null>(null)
    console.log("softSkill", techSkillOne)
    const [softSkillPercentage, setsoftSkillPercentage] = useState<any | null>(null)
    const [isReportGenerated, setIsReportGenerated] = useState(false);
    const [techSkill, setTechSkill] = useState<any | null>(null)
    const [storedDatas, setStoredDatas] = useState<any | null>(null)





    // useEffect(() => {

    //     const clearLocalStorage = () => {
    //         localStorage.clear();
    //     };


    //     window.addEventListener("beforeunload", clearLocalStorage);

    //     return () => {
    //         window.removeEventListener("beforeunload", clearLocalStorage);
    //     };
    // }, []);

    const handleGenerateReport = () => {

        setIsReportGenerated(true);
    };

    const btnGenerate = () => {
        if (techSkillOne && softSkillPercentage) {
            return <button
                className="mt-[0rem] px-6 py-2 w-[12rem] font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80"
                onClick={handleGenerateReport}
            >
                Generate Report
            </button>
        }
        return ""
    }



    useEffect(() => {
        const storedData = localStorage.getItem("techSkillPercentages") || '{}';
        setStoredDatas(storedData);

        const storedDataone = localStorage.getItem("softSkill") || '{}';
        const storedDatatwo = localStorage.getItem("techSkill") || '{}';
        setTechSkill(JSON.parse(storedDatatwo));
        setSoftSkill(JSON.parse(storedDataone));

        const parsedData = JSON.parse(storedData) || {};
        console.log("maindatastore", parsedData);

        Object.keys(parsedData).map(itm => {
            console.log('Question ->', itm);
            console.log('Answer ->', parsedData[itm]);
            return null; // Make sure to return something when using map
        });
    }, []);


    const handlePrintScreen = () => {

        const mainContent = document.getElementById('main-content');


        if (mainContent) {

            html2canvas(mainContent).then((canvas) => {

                const dataUrl = canvas.toDataURL('image/png');


                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = 'screenshot.png';


                link.click();
            });
        }
    };


    return (
        <div id="main-content">
            {/* <h1>hello</h1> */}
            <Accoridan setsoftSkillPercentage={setsoftSkillPercentage} softSkill={softSkill} />
            <TechAccordian
                techSkill={techSkill}
                setTechSkillOne={setTechSkillOne}
            // setTechSkillOne={setTechSkillOne}
            // setTechSkillTwo={setTechSkillTwo}
            // setTechSkillThree={setTechSkillThree}
            // setTechSkillFour={setTechSkillFour}
            // setTechSkillFive={setTechSkillFive}
            // setTechSkillSix={setTechSkillSix}
            />
            <div className="flex justify-center items-center ">
                {
                    btnGenerate()
                }

            </div>

            {isReportGenerated && techSkillOne && softSkillPercentage && (
                <ReportTable
                    data={JSON.parse(storedDatas)}
                    softSkillPercentage={softSkillPercentage}
                    techSkillOne={techSkillOne}
                />
            )}

            <div className="flex justify-center items-center">
                {
                    isReportGenerated && techSkillOne && softSkillPercentage && (
                        <button
                            className="mt-[0rem] px-6 py-2 w-[12rem] font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80"
                            onClick={handlePrintScreen}
                        >
                            Print Screen
                        </button>
                    )
                }

            </div>
        </div>
    )
}

export default MainPage