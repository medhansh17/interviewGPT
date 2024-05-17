import TextArea from "./components/TextArea";
import Table from "./components/Table";
import { useState, useEffect } from "react";
import Header from "./components/Header";
import Image from "./assets/loader.gif";
import Modal from "react-modal";

Modal.setAppElement("#root");

// import html2canvas from 'html2canvas';
import axios from "axios";
import ErrorAlert from "./components/Alerts/ErrorAlert";
import TechSkillTable from "./components/TechSkillTable";
import { FetchSkillsData } from "./types";
import api from "./components/customAxios/Axios";
import { Link, useNavigate } from "react-router-dom";
import AddJd from "./components/AddJd";
import TextArea2 from "./components/TextArea2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";

function Application() {
  const [file, setFile] = useState<any | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mainData, setMainData] = useState<any | null>(null);
  const [mainTextArea, setMainTextArea] = useState<any | null>("");
  const [load, setLoad] = useState(false);
  const [mainData2, setMainData2] = useState<any | null>(null);
  const [mainTextArea2, setMainTextArea2] = useState<any | null>("");
  // const [mainSkill, setMainSkill] = useState<any | null>(null);
  // const [softSkill, setSoftSkill] = useState<any | null>(null);
  // const [techSkill, setTechSkill] = useState<any | null>(null);
  // const [techSkillOne, setTechSkillOne] = useState<any | null>(null);
  // const [softSkillPercentage, setsoftSkillPercentage] = useState<any | null>(
  // 	null,
  // );
  // const [isReportGenerated, setIsReportGenerated] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [empty, setEmpty] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>("");
  const [fetchSkill, setFetchSkill] = useState<
    FetchSkillsData & { timestamp: number }
  >();
  console.log(mainData, mainTextArea);
  const [error, setError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<string>("");
  const [role2, setRole2] = useState<string>("");
  const [doc, setDoc] = useState(false);
  const [manual, setManual] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const clearLocalStorage = () => {
      localStorage.clear();
    };

    window.addEventListener("beforeunload", clearLocalStorage);

    return () => {
      window.removeEventListener("beforeunload", clearLocalStorage);
    };
  }, []);

  const customStyles = {
    content: {
      top: "20%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "0%",
      transform: "translate(-50%, -50%)",
      // width:"52%",
      borderRadius: "5px",
      // boxShadow:'0 2px 9px grey',
      fontFamily: "sans-serif",

      borderBottom: success ? "2px solid green" : "2px solid red",
    },
  };

  const uploadJD = async () => {
    setIsHidden(true);
    console.log(mainTextArea2, mainTextArea);
    const wordCountRegex = /\S+/g; // Regular expression to match non-whitespace characters
    const wordCount =
      (mainTextArea2.match(wordCountRegex) || []).length ||
      (mainTextArea.match(wordCountRegex) || []).length;
    if ((load == false && wordCount < 50) || wordCount > 10000) {
      // If word count is not within the specified range, display an error message
      setError(wordCount);
      setTimeout(() => {
        setError(null);
      }, 10000);
      navigate("/dashboard");
      return;
    }

    setIsLoading(true);
    setModalIsOpen(true);
    console.log("kere");
    console.log("hhh", {
      role: mainData?.role || mainData2?.role || role || "",
      jd: mainData?.jd || mainData2?.jd || mainTextArea || mainTextArea2,
    });
    try {
      const response = await api.post("/Manual_upload_job", {
        role: mainData?.role || mainData2?.role || role || "",
        jd: mainData?.jd || mainData2?.jd || mainTextArea || mainTextArea2,
      });
      console.log("kkkkk", response);
      if (response.data.message === "Job uploaded successfully.") {
        setIsLoading(false);
        // Display modal for 3 seconds
        setSuccess(true);
        setModalMessage("Successfully added JD");
        setShowModal(true);
        setMainTextArea(null);
        setMainTextArea2(null);
        setMainData("");
        setMainData2("");
        setEmpty(true);
        setRole("");
        setRole2("");
        setTimeout(() => {
          setShowModal(false);
        }, 5000);
        navigate("/dashboard");
      } else if (response.data.message == "Job JD already exists.") {
        setIsLoading(false);
        setSuccess(false);
        setEmpty(true);
        setModalMessage("Job JD already exists.");
        setShowModal(true);
        setMainTextArea(null);
        setMainTextArea2(null);
        setMainData(null);
        setRole("");
        setRole2("");
        setTimeout(() => {
          setShowModal(false);
        }, 5000);
      }
      console.log("rr", response);
    } catch (error: any) {
      console.error("Error uploading jd data:", error);
      console.error("API Error:", error);
      // setError(error);
      // setTimeout(() => {
      // 	setError(null);
      // }, 3000);
    }
  };
  const fetchDataFetchSkill = async () => {
    setIsLoading(true);
    setModalIsOpen(true);
    try {
      const response = await api.post<FetchSkillsData>("/fetch_skills", {
        role: mainData?.role || "",
        job_description: mainData?.jd || mainTextArea,
      });

      setFetchSkill({ ...response.data, timestamp: Date.now() });
      localStorage.setItem("mainSkill", JSON.stringify(response.data));
      // setMainSkill(response.data);
      await fetchSoftSkillQuestions(response.data);
      // await fetchSoftTechQuestions(response.data);
      setIsHidden(true);

      // window.location.href = "#/app-submit"
    } catch (error: any) {
      console.error("Error fetching data:", error);
      console.error("API Error:", error);
      setError(error);
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
    setIsLoading(false);
  };

  const uploadDoc = async () => {
    if (!file || !role2) {
      console.log("ree");
      return;
    }

    const newResume = new FormData();
    newResume.append("role", role2);
    newResume.append("jd_file", file);

    try {
      const response = await api.post("/file_upload_jd", newResume);

      if (response.statusText === "OK") {
        // Display modal for 3 seconds
        setSuccess(true);
        setModalMessage("Successfully added JD");
        setShowModal(true);
        setMainTextArea(null);
        setMainTextArea2(null);
        setMainData(null);
        setRole("");
        setRole2("");
        setTimeout(() => {
          setShowModal(false);
        }, 5000);
        navigate("/dashboard");
      } else {
        setSuccess(false);
        setModalMessage("Error Uploading JD");
        setShowModal(true);
        setTimeout(() => {
          setShowModal(false);
        }, 5000);
      }

      console.log("Response:", response);
    } catch (error) {
      console.error("Error uploading jd:", error);
      // Handle error and display appropriate message
    }
  };
  // const generateQuestion=async ()=>{
  //   try {
  //     const response = await axios.post(
  //       "https://coops-backend.bluetickconsultants.com:8000/fetch_skills",
  //       {
  //         technical_skills:[
  //           {
  //             num_basic:"" ,
  //             intermediate:"",
  //             advance: "",
  //           }
  //         ],
  //         name:"role"
  //       },
  //     );
  //   }
  //   catch(err){
  //     console.error(err)
  //   }
  // }
  const fetchSoftSkillQuestions = async (data: any) => {
    try {
      const softSkillResponse = await api.post(
        "/generate_soft_skill_questions",
        {
          name: mainData?.role,
          soft_skills: data?.skills?.soft_skills.join(","), // Ensure soft_skills is an array
          experience: data?.skills?.experience,
        }
      );

      localStorage.setItem(
        "softSkill",
        JSON.stringify(softSkillResponse?.data)
      );
      // setSoftSkill(softSkillResponse?.data);
    } catch (error: any) {
      console.error("Error fetching soft skill questions:", error);
      console.error("Error fetching data:", error);
      console.error("API Error:", error);
      setError(error);
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  // const fetchSoftTechQuestions = async (data: any) => {
  // 	try {
  // 		const techSkillResponse = await axios.post(
  // 			"https://coops-backend.bluetickconsultants.com:8000/generate_technical_questions",
  // 			{
  // 				name: mainData?.role,
  // 				experience: data?.skills?.experience,
  // 				technical_skills: data?.skills?.technical_skills.join(","),
  // 			},
  // 		);

  // 		localStorage.setItem(
  // 			"techSkill",
  // 			JSON.stringify(techSkillResponse?.data),
  // 		);

  // 		// setTechSkill(techSkillResponse?.data);
  // 	} catch (error: any) {
  // 		console.error("Error fetching soft skill questions:", error);
  // 		console.error("Error fetching data:", error);
  // 		console.error("API Error:", error);
  // 		setError(error);
  // 		setTimeout(() => {
  // 			setError(null);
  // 		}, 3000);
  // 	}
  // };

  const handleReset = () => {
    setMainData(null);
    // setMainSkill(null);
    // setSoftSkill(null);
    // setTechSkill(null);
    // setsoftSkillPercentage(null);
    // setTechSkillOne(null);
    // setIsReportGenerated(false);
  };

  // const storedData = localStorage.getItem("techSkillPercentages") ?? "{}";

  // Object.keys(JSON.parse(storedData))?.map((itm) => {
  // });

  // const handleGenerateReport = () => {

  //   setIsReportGenerated(true);
  // };

  // const handlePrintScreen = () => {

  //   const mainContent = document.getElementById('main-content');

  //   if (mainContent) {

  //     html2canvas(mainContent).then((canvas) => {

  //       const dataUrl = canvas.toDataURL('image/png');

  //       const link = document.createElement('a');
  //       link.href = dataUrl;
  //       link.download = 'screenshot.png';

  //       link.click();
  //     });
  //   }
  // };

  // const btnGenerate = () => {
  //   if (techSkillOne && softSkillPercentage) {
  //     return <button
  //       className="mt-[0rem] px-6 py-2 w-[12rem] font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80"
  //       onClick={handleGenerateReport}
  //     >
  //       Generate Report
  //     </button>
  //   }
  //   return ""
  // }
  const docHanler = () => {
    setManual(false);
    setDoc(true);
    setLoad(false);
  };
  const manualHandler = () => {
    setDoc(false);
    setManual(true);
    setLoad(false);
    setMainData(null);
  };

  return (
    <main id="main-content">
      <Header />
      <div className="flex justify-end"></div>
      <div
        onClick={() => navigate("/dashboard")}
        className="w-[10rem] text-center bg-gray-200 px-4 py-2 rounded-md shadow-md hover:bg-gray-300 cursor-pointer mt-[-3rem] mb-[2rem] ml-[3rem] font-bold"
      >
        JD Dashboard
      </div>
      <div className="md:flex md:justify-center md:items-center 2xl:gap-8 xl:gap-0 gap-2">
        <div className="">
          <div className="mx-[3rem]">
            <div>
              <p className="flex justify-left items-center mb-2 font-bold md:text-[2rem] text-[1rem]">
                Add Job Description
              </p>
              <p>
                Insert your own job description or select one from the examples
                provided below.
              </p>
              <div>
                <button
                  onClick={docHanler}
                  className="  mt-[1rem]  py-2 w-[7rem] font-medium tracking-wide text-white text-center capitalize transition-colors duration-300 transform bg-blue-500 rounded-lg hover:bg-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80"
                >
                  Document
                </button>
                <button
                  onClick={manualHandler}
                  className=" ml-[2rem] mt-[1rem]  py-2 w-[8rem] font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-blue-500 rounded-lg hover:bg-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80"
                >
                  Type Manually
                </button>
              </div>

              <form onSubmit={doc ? uploadDoc : uploadJD}>
                {doc && load == false && (
                  <>
                    <input
                      required
                      type="text"
                      onChange={(e) => setRole2(e.target.value)}
                      value={role2}
                      className="border my-4 border-zinc-300 shadow-sm w-[700px] px-3 py-2 placeholder-zinc-400 text-zinc-700 bg-white rounded-lg focus:outline-none focus:shadow-outline"
                      placeholder="Enter Role"
                    />

                    <AddJd file={file} setFile={setFile} />
                  </>
                )}
                {doc == false && manual == true && load == false && (
                  <>
                    <input
                      required
                      type="text"
                      onChange={(e) => setRole(e.target.value)}
                      value={role}
                      className="border my-4 border-zinc-300 shadow-sm w-full px-3 py-2 placeholder-zinc-400 text-zinc-700 bg-white rounded-lg focus:outline-none focus:shadow-outline"
                      placeholder="Enter Role"
                    />
                    {error && (
                      <span style={{ fontSize: "0.9rem" }}>
                        <span style={{ color: "red", fontSize: "1rem" }}>
                          *
                        </span>
                        {error}
                      </span>
                    )}
                    <TextArea2
                      setEmpty={setEmpty}
                      empty={empty}
                      setMainTextArea2={setMainTextArea2}
                      mainData2={mainData2}
                    />
                  </>
                )}
                {load && doc == false && (
                  <>
                    <input
                      type="text"
                      value={mainData.role}
                      className="border mt-4 border-zinc-300 shadow-sm w-full px-3 py-2 placeholder-zinc-400 text-zinc-700 bg-white rounded-lg focus:outline-none focus:shadow-outline"
                    />
                    <TextArea
                      setMainTextArea={setMainTextArea}
                      mainData={mainData}
                    />
                  </>
                )}
                <div className="mt-[2rem]">
                  <button
                    type="submit"
                    className={`h-[40px] mb-[0.5rem] px-6 py-2 w-[6rem] font-medium tracking-wide text-white capitalize transition-colors duration-300 transform ${
                      mainData ||
                      mainTextArea ||
                      mainData2 ||
                      mainTextArea2 ||
                      file
                        ? "bg-blue-600 hover:bg-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-80"
                        : "bg-gray-400 cursor-not-allowed"
                    } rounded-lg focus:outline-none `}
                    // onClick={doc?uploadDoc:uploadJD}
                    // disabled={!mainData || !mainTextArea || !mainData2 || !mainTextArea2}
                  >
                    {isLoading ? <span className="loader"></span> : "Submit"}
                  </button>

                  <button
                    className={`h-[40px] ml-[1rem] mt-[1rem] px-6 py-2 w-[6rem] font-medium tracking-wide text-white capitalize transition-colors duration-300 transform ${
                      mainData ||
                      mainTextArea ||
                      mainData2 ||
                      mainTextArea2 ||
                      file
                        ? "bg-blue-600 hover:bg-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-80"
                        : "bg-gray-400 cursor-not-allowed"
                    } rounded-lg focus:outline-none`}
                    onClick={handleReset}
                    disabled={!mainData || mainTextArea}
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="">
          <Table
            setMainData={setMainData}
            setLoad={setLoad}
            manual={manual}
            doc={doc}
          />
        </div>
      </div>
      {showModal && (
        <Modal
          isOpen={showModal}
          onRequestClose={() => setShowModal(false)}
          style={customStyles}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {success ? (
              <FontAwesomeIcon
                icon={faCheckCircle}
                style={{
                  color: "green",
                  fontSize: "1.2rem",
                  marginRight: "10px",
                }}
              />
            ) : (
              <FontAwesomeIcon
                icon={faTimesCircle}
                style={{
                  color: "red",
                  fontSize: "1.2rem",
                  marginRight: "10px",
                }}
              />
            )}
            <span style={{ marginRight: "10px" }}>{modalMessage}</span>
          </div>
        </Modal>
      )}

      {/* {isLoading &&  */}

      <div style={{ display: isHidden ? "block" : "none" }}>
        <div className="flex  w-full flex-wrap">
          <div className="w-[100%]">
            <p className=" text-center md:text-[2rem] text-[1rem] my-[1rem]">
              TechinalSkill
            </p>
            {fetchSkill?.skills && (
              <TechSkillTable
                key={fetchSkill?.timestamp}
                fetchSkill={fetchSkill}
                role={mainData?.role}
              />
            )}
          </div>
        </div>
        {/* <div className="flex justify-center items-center my-[1rem]">
          <button
            className={`mb-[0.5rem] px-6 py-2 font-medium tracking-wide text-white capitalize transition-colors duration-300 transform ${
              mainData || mainTextArea
                ? "bg-blue-600 hover:bg-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-80"
                : "bg-gray-400 cursor-not-allowed"
            } rounded-lg focus:outline-none`}
          >
            Generate Questions
          </button>
        </div> */}
      </div>

      <div className="bg-deep-purple-accent-400 ">
        <svg
          className="absolute top-0 w-full h-6 -mt-5 sm:-mt-10 sm:h-16 text-deep-purple-accent-400"
          preserveAspectRatio="none"
          viewBox="0 0 1440 54"
        ></svg>
        <div className="">
          <div className="px-4 pt-12 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-0 ">
            <div className="grid gap-16 row-gap-10 mb-8 lg:grid-cols-6">
              <div className="md:max-w-md lg:col-span-2"></div>
            </div>
            <div className="flex flex-col justify-between pt-5 pb-10 border-t border-deep-purple-accent-200 sm:flex-row">
              <p className="text-lg text-[#000]">
                2023 © All rights reserved by Bluetick Consultants LLP
              </p>
              <div className="flex items-center mt-4 space-x-4 sm:mt-0">
                <a
                  href="https://twitter.com/BluetickConsult"
                  className="transition-colors duration-300 text-deep-purple-100 hover:text-teal-accent-400"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5">
                    <path d="M24,4.6c-0.9,0.4-1.8,0.7-2.8,0.8c1-0.6,1.8-1.6,2.2-2.7c-1,0.6-2,1-3.1,1.2c-0.9-1-2.2-1.6-3.6-1.6 c-2.7,0-4.9,2.2-4.9,4.9c0,0.4,0,0.8,0.1,1.1C7.7,8.1,4.1,6.1,1.7,3.1C1.2,3.9,1,4.7,1,5.6c0,1.7,0.9,3.2,2.2,4.1 C2.4,9.7,1.6,9.5,1,9.1c0,0,0,0,0,0.1c0,2.4,1.7,4.4,3.9,4.8c-0.4,0.1-0.8,0.2-1.3,0.2c-0.3,0-0.6,0-0.9-0.1c0.6,2,2.4,3.4,4.6,3.4 c-1.7,1.3-3.8,2.1-6.1,2.1c-0.4,0-0.8,0-1.2-0.1c2.2,1.4,4.8,2.2,7.5,2.2c9.1,0,14-7.5,14-14c0-0.2,0-0.4,0-0.6 C22.5,6.4,23.3,5.5,24,4.6z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/bluetickconsultants/"
                  className="transition-colors duration-300 text-deep-purple-100 hover:text-teal-accent-400"
                >
                  <svg viewBox="0 0 30 30" fill="currentColor" className="h-6">
                    <circle cx="15" cy="15" r="4" />
                    <path d="M19.999,3h-10C6.14,3,3,6.141,3,10.001v10C3,23.86,6.141,27,10.001,27h10C23.86,27,27,23.859,27,19.999v-10   C27,6.14,23.859,3,19.999,3z M15,21c-3.309,0-6-2.691-6-6s2.691-6,6-6s6,2.691,6,6S18.309,21,15,21z M22,9c-0.552,0-1-0.448-1-1   c0-0.552,0.448-1,1-1s1,0.448,1,1C23,8.552,22.552,9,22,9z" />
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/bluetickconsultants/"
                  className="transition-colors duration-300 text-deep-purple-100 hover:text-teal-accent-400"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5">
                    <path d="M22,0H2C0.895,0,0,0.895,0,2v20c0,1.105,0.895,2,2,2h11v-9h-3v-4h3V8.413c0-3.1,1.893-4.788,4.659-4.788 c1.325,0,2.463,0.099,2.795,0.143v3.24l-1.918,0.001c-1.504,0-1.795,0.715-1.795,1.763V11h4.44l-1,4h-3.44v9H22c1.105,0,2-0.895,2-2 V2C24,0.895,23.105,0,22,0z" />
                  </svg>
                </a>

                <a href="https://www.linkedin.com/company/bluetick-consultants/">
                  <img
                    width="25"
                    height="50"
                    src="https://img.icons8.com/ios-filled/50/linkedin.png"
                    alt="linkedin"
                  />
                </a>
                <a href="https://www.threads.net/@bluetickconsultants">
                  <img
                    width="25"
                    height="48"
                    src="https://img.icons8.com/pulsar-line/48/threads.png"
                    alt="threads"
                  />
                </a>
                <a href="https://www.quora.com/profile/Bluetick-Consultants">
                  <img
                    width="25"
                    height="32"
                    src="https://img.icons8.com/windows/32/quora.png"
                    alt="quora"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Application;
