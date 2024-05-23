import { useContext, useEffect, useRef, useState } from "react";
import Header from "./Header";
import api from "./customAxios/Axios";
import { useNavigate, useParams } from "react-router-dom";
import { UserContext } from "../context/JobContext";
import { setCandList, deleteCandidateByName } from "../context/JobContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import InterviewDataDisplay from "./candidateResult";
import { faTimes, faRedo } from "@fortawesome/free-solid-svg-icons";
import UpdateQuestionPopup from "./updateQuestionPopup";

interface MyObjectType {
  jd: string | null;
  role: string | null;
  job_id: number | null;
}

interface DataItem {
  candidate_name: string;
  JD_MATCH: string;
  MATCH_STATUS: string;
  Matching_Skills: string;
  Missing_Skills: string;
}

interface BehavioralQuestion {
  b_question_id: number;
  b_question_text: string;
}

interface CodingQuestion {
  question: string;
  sample_input: string;
  sample_output: string;
}

interface TechnicalQuestion {
  question: string;
  options: { [key: string]: string };
  answer: string;
}
const RespJdDash = () => {
  const { state, dispatch } = useContext(UserContext)!;
  const [jobDetails, setJobDetails] = useState<MyObjectType | null>(null);
  const [file, setFile] = useState<any | null>(null);
  const [Data, setData] = useState<DataItem[]>([]);
  const [behavioralQuestions, setBehavioralQuestions] = useState<
    BehavioralQuestion[]
  >([]);
  const [show_Result, setshow_Result] = useState(false);
  const [codingQuestion, setCodingQuestion] = useState<CodingQuestion | null>(
    null
  );
  const [technicalQuestions, setTechnicalQuestions] = useState<
    TechnicalQuestion[]
  >([]);
  const [row, setRow] = useState<any | number>(0);
  const [showFullJobDesc, setShowFullJobDesc] = useState(false);
  const [action, setAction] = useState(false);
  const [rowAction, setRowAction] = useState<any | number>(0);
  const [showDetails, setShowDetails] = useState(false); // State variable for pop-up
  const [candidateDetails, setCandidateDetails] = useState<any>(null);
  const { id } = useParams();
  const [approval, setApproval] = useState(false);
  const [numMCQ, setNumMCQ] = useState<number>(1);
  const [numBehavioral, setNumBehavioral] = useState<number>(1);
  const [numCoding, setNumCoding] = useState<number>(0);
  const [showPopup, setShowPopup] = useState(false);
  const [candName, setCanName] = useState("");
  const [selectedCandidates, setSelectedCandidates] = useState<string>("");
  const [showSelectCandidatePopup, setShowSelectCandidatePopup] =
    useState(false);
  const [gen, setGen] = useState("");
  const [pop, setPop] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(false);
  const [Resultdata, setResultData] = useState<any>(null);

  const handleCandidateSelect = async (
    candidateName: string,
    checked: boolean
  ) => {
    const updatedData = Data.map((item) => {
      if (item.candidate_name === candidateName) {
        return { ...item, selected_status: checked };
      }
      return item;
    });
    try {
      let check = checked ? "true" : "false";
      setSelectedCandidates(checked ? candidateName : "");
      const resp = await api.post("/update_resume_status", {
        name: candidateName,
        status: check,
      });
      console.log(resp);
      // Handle response as needed
    } catch (error) {
      console.log(error);
      // Handle error
    }
    setData(updatedData);
  };

  // Function to handle click on right arrow
  const handleRightArrowClick = (item: any) => {
    setShowPopup(true);
    setCanName(item.candidate_name);
    const itemString = JSON.stringify(item);
    // Store the stringified item in localStorage
    localStorage.setItem("item", itemString);
  };

  useEffect(() => {
    const getJobDetails = async () => {
      try {
        const response = await api.get(`/jobs/${id}`);
        console.log("API Response:", response.data);

        setJobDetails({
          role: response.data.job_details.role,
          jd: response.data.job_details.jd,
          job_id: response.data.job_details.job_id,
        });
        localStorage.setItem("job_id", response.data.job_details.job_id);
      } catch (error: any) {
        console.log(error);
      }
    };
    getJobDetails();
    const getCandList = async () => {
      try {
        const res = await api.get(`/get_resume_scores?job_id=${id}`);

        const candidateData = res.data.resume_scores;
        dispatch(setCandList(candidateData));
      } catch (err: any) {
        console.log(err);
      }
    };
    getCandList();
  }, [dispatch, id]);

  useEffect(() => {
    setData(state.candidate_list);
  }, [state.candidate_list]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Number of items per page
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const handleBrowseClick = () => {
    if (fileInputRef.current !== null && fileInputRef.current !== undefined) {
      (fileInputRef.current as HTMLInputElement).click();
    }
  };
  const [refreshStatus, setRefreshStatus] = useState<string>("Done");
  const handleRefresh = () => {
    setRefreshStatus("refreshing");
    const getCandList = async () => {
      try {
        const res = await api.get(`/get_resume_scores?job_id=${id}`);
        const candidateData = res.data.resume_scores;
        dispatch(setCandList(candidateData));
      } catch (err: any) {
        alert("Error fetching data");
        console.log(err);
      }
    };
    getCandList();
  };
  // Calculate total number of pages
  const totalPages = Math.ceil(Data.length / itemsPerPage);
  // Pagination logic

  const handlePageChange = (page: any) => {
    setCurrentPage(page);
  };

  const otherActions = (id: number) => {
    setAction(!action);
    setRowAction(id);
  };

  const addResume = async () => {
    if (!file || !jobDetails) {
      alert("Please select a file to upload or select a job");
      return;
    }
    const newResume = new FormData();
    newResume.append("resume", file);
    newResume.append("id", jobDetails.job_id!);
    newResume.append("role", jobDetails.role!);

    try {
      const response = await api.post("/upload_resume_to_job", newResume);
      console.log("add", response);
      if (response.statusText === "OK") {
        alert("Successfully added");
        window.location.reload();
        // dispatch(addCandidate(response.data))
        //     setData(response.data.scores);
        // setJobsData(response.data.scores);
        setFile(null);
      }

      console.log("Response:", response);
    } catch (error) {
      console.error("Error uploading resume:", error);
      setFile(null);
    }
  };

  const deleteCandHandler = async (item: any) => {
    try {
      const resp = await api.get(
        `/delete_resume?candidate_name=${item.candidate_name}&job_id=${jobDetails?.job_id}`
      );
      dispatch(deleteCandidateByName(item.candidate_name));
    } catch (error) {
      console.log(error);
    }
  };

  const showCandDetails = async (item: any) => {
    try {
      const res = await api.get(
        `/extracted_info?job_id=${jobDetails?.job_id}&candidate_name=${item.candidate_name}`
      );
      setCandidateDetails(res.data.extracted_info_details);
      setShowDetails(true);
    } catch (err: unknown) {
      console.log(err);
    }
  };

  const closeDetails = () => {
    setShowDetails(false);
    setCandidateDetails(null);
  };

  const truncateJobDescription = (description: any) => {
    const maxLines = 5; // Maximum number of lines to display
    if (!description) return "";

    const lines = description.split("\n");
    if (lines.length <= maxLines) return description;

    return lines.slice(0, maxLines).join("\n");
  };

  const handleProceed = async () => {
    setShowPopup(false);
    setGen("Generating Questions");
    try {
      const resp = await api.post("/CHECK_Auto_assessment", {
        job_id: jobDetails?.job_id,
        candidate_name: candName,
        no_tech_questions: numMCQ,
        no_behav_questions: numBehavioral,
      });
      if (resp.statusText == "OK") {
        setPop(true);
        setGen("");
      }
      setTimeout(() => {
        handleRefresh();
      }, 1000);
    } catch (err: unknown) {
      console.log(err);
    }
  };

  useEffect(() => {
    const genQuestions = async () => {
      if (jobDetails?.job_id) {
        const resp = await api.post(
          "/fetch_candidate_questions_after_selected",
          { job_id: jobDetails?.job_id, candidate_name: candName }
        );
        setBehavioralQuestions(resp.data.Behaviour_q);
        setCodingQuestion(resp.data.coding_question);
        setTechnicalQuestions(resp.data.tech_questions);
      }
    };
    genQuestions();
  }, [approval]);

  const popHandle = () => {
    setApproval(true);
  };

  const showResult = async (itemName: string) => {
    try {
      const resp = await api.post("/fetch_user_responses", {
        candidate_name: itemName,
        job_id: jobDetails?.job_id,
      });
      setResultData(resp.data);
      setshow_Result(!show_Result);
    } catch (error: unknown) {
      console.log(error);
    }
  };
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentJobs = Data.slice(indexOfFirstItem, indexOfLastItem);
  return (
    <div
      className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white"
      style={{ backgroundColor: "#fff" }}
    >
      {show_Result && (
        <InterviewDataDisplay
          data={Resultdata}
          onClick={() => {
            setshow_Result(!show_Result);
          }}
        />
      )}
      <p className="w-[93%] mx-auto">
        <Header />
      </p>
      <div
        className="max-w-[1400px] w-[95%] mx-auto mt-[-2rem] p-6"
        style={{ paddingTop: 0 }}
      >
        <div className="mb-4">
          <h1 className="text-2xl font-semibold mb-1">{jobDetails?.role}</h1>

          <p
            className="text-sm text-zinc-600 dark:text-zinc-400"
            onClick={() => setShowFullJobDesc(!showFullJobDesc)}
          >
            {showFullJobDesc
              ? jobDetails?.jd
              : truncateJobDescription(jobDetails?.jd)}
            {!showFullJobDesc &&
              jobDetails?.jd?.split("\n").length > 5 &&
              "..."}
          </p>
        </div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <button
              className="bg-blue-500 text-white p-2 rounded-lg shadow"
              onClick={handleRefresh}
            >
              Refresh
            </button>
          </div>
          <div className="flex gap-[2rem]">
            <div
              className="flex w-[19rem] items-center bg-zinc-200 dark:bg-zinc-800 rounded-lg "
              style={{ padding: "0 0 0 5px" }}
            >
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent focus:outline-none dark:text-white flex-1"
              />
              <button className="bg-blue-500 text-white p-2 rounded-lg ml-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-5-5m2-2a8 8 0 10-16 0 8 8 0 0016 0z"
                  />
                </svg>
              </button>
            </div>
            <input
              required
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => setFile(e.target.files[0])}
            />
            {file ? (
              <button
                className="bg-green-500 text-white p-2 rounded-lg shadow"
                onClick={addResume}
              >
                Upload
              </button>
            ) : (
              <button
                className="bg-blue-500 text-white p-2 rounded-lg shadow"
                onClick={handleBrowseClick}
              >
                Add new Candidate
              </button>
            )}
          </div>
        </div>

        {currentJobs.length > 0 ? (
          <div className="max-w-[1400px] min-w-fit mx-auto shadow">
            <table className="w-full">
              <thead className="bg-zinc-200 dark:bg-zinc-600">
                <tr>
                  <th className="p-3 text-left">Candidates</th>
                  <th className="p-3  text-left">Skills Matching</th>
                  <th className="p-3 text-left">Skills Missing</th>

                  <th className="p-3 text-left">Score</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Select</th>
                  <th className="p-3 w-[150px] text-left">Action</th>
                  {/* <th className="p-3 text-left">Edit</th> */}
                </tr>
              </thead>
              <tbody>
                {currentJobs.map((item: any, index: number) => {
                  return (
                    //  <tr className="border-b dark:border-zinc-600" key={index}>
                    //   <td className="p-3 font-bold underline " onClick={()=>showCandDetails(item)}>{item.candidate_name}</td>
                    //   <td className="p-3 "><p className='desc'>{item.Matching_Skills}</p></td>
                    //   <td className="p-3 "><p className='desc'>{item.Missing_Skills}</p></td>

                    //   <td className="p-3">{item.JD_MATCH}</td>
                    //   <td className="p-3">
                    //   <span className={`text-green-700 py-1 px-3 rounded-full text-xs ${item.MATCH_STATUS === 'SELECTED FOR REVIEW' ? 'bg-green-200' : (item.MATCH_STATUS === 'ON HOLD' ? 'bg-yellow-200' : 'bg-red-200')}`}>
                    //   {item.MATCH_STATUS=='SELECTED FOR REVIEW'?'Selected':(item.MATCH_STATUS === 'ON HOLD' ? 'On Hold' : 'Rejected')}
                    //     </span>
                    //   </td>
                    //   <td><input type='checkbox'/></td>
                    //   <td className="p-3 text-zinc-500 dark:text-zinc-400 relative">
                    //   <div className='flex items-center justify-around text-lg'>

                    //                   <div><FontAwesomeIcon icon={faTrash} onClick={() => deleteCandHandler(item)} className="cursor-pointer " title='Delete' style={{ color: "red" }} /></div>
                    //                   <div><FontAwesomeIcon icon={faArrowRight} className="mr-2 cursor-pointer " title='' style={{ color: "blue" }} /></div>
                    //                 </div>
                    //   </td>
                    // </tr>
                    <tr className="border-b dark:border-zinc-600" key={index}>
                      <td
                        className="p-3  font-bold underline"
                        onClick={() => showCandDetails(item)}
                      >
                        {item.candidate_name}
                      </td>
                      <td className="p-3 w-[300px]">
                        <p className="">
                          {item.Matching_Skills &&
                            item.Matching_Skills.map((skill, index) => (
                              <span key={index}>
                                {skill}
                                {index !== item.Matching_Skills.length - 1 &&
                                  ", "}
                              </span>
                            ))}
                        </p>
                      </td>
                      <td className="p-3 w-[300px]">
                        <p className="">
                          {item.Missing_Skills &&
                            item.Missing_Skills.map((skill, index) => (
                              <span key={index}>
                                {skill}
                                {index !== item.Missing_Skills.length - 1 &&
                                  ", "}
                              </span>
                            ))}
                        </p>
                      </td>
                      <td className="p-3 text-center">
                        <p>{item.JD_MATCH}</p>
                        <span
                          className={`text-green-700 py-1 px-3 rounded-full text-xs ${
                            item.MATCH_STATUS === "SELECTED FOR REVIEW"
                              ? "bg-green-200"
                              : item.MATCH_STATUS === "ON HOLD"
                              ? "bg-yellow-200"
                              : "bg-red-200"
                          }`}
                        >
                          {item.MATCH_STATUS == "SELECTED FOR REVIEW"
                            ? "Selected"
                            : item.MATCH_STATUS === "ON HOLD"
                            ? "On Hold"
                            : "Rejected"}
                        </span>
                      </td>
                      <td className="p-3 text-center">{`${item.status}`}</td>
                      <td>
                        <input
                          type="checkbox"
                          // checked={item.selected_status}
                          onChange={(e) => {
                            handleCandidateSelect(
                              item.candidate_name,
                              e.target.checked
                            );
                            setCanName(item.candidate_name);
                            console.log("heeeee", item.candidate_name);
                          }}
                        />
                        {/* <input type='checkbox' checked={item.selected_status}  onChange={(e) => handleCandidateSelect(item.candidate_name, e.target.checked)} /> */}
                      </td>
                      <td className="p-3 text-zinc-500 dark:text-zinc-400 relative">
                        <div
                          className="flex flex-col items-center justify-around text-lg"
                          style={{ gap: "4px" }}
                        >
                          <div>
                            <button
                              onClick={() => deleteCandHandler(item)}
                              className="cursor-pointer resp-btn "
                              style={{ color: "red" }}
                            >
                              Delete
                            </button>
                          </div>
                          {item.selected_status &&
                            item.assessment_status == 0 &&
                            gen == "" &&
                            pop == false &&
                            item.status == null && (
                              <button
                                className="resp-btn"
                                onClick={() => handleRightArrowClick(item)}
                              >
                                Generate
                              </button>
                            )}
                          {candName == item.candidate_name &&
                            item.selected_status &&
                            item.assessment_status == 0 &&
                            gen && (
                              <button className="resp-btn">Generating </button>
                            )}
                          {item.selected_status &&
                            item.assessment_status == 0 &&
                            item.status == "assessment_generated" && (
                              <button className="resp-btn" onClick={popHandle}>
                                Generated
                              </button>
                            )}
                          {item.assessment_status == 1 && (
                            <button
                              className="resp-btn"
                              onClick={() => showResult(item.candidate_name)}
                            >
                              Result
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* Pagination */}
            {currentJobs.length > 10 ? (
              <div className="flex justify-center mt-4">
                <nav>
                  <ul className="pagination">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <li
                        key={i}
                        className={`page-item ${
                          currentPage === i + 1 ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(i + 1)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="no-data">No Candidate</div>
        )}
      </div>

      {approval && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div
            className="absolute bg-white dark:bg-zinc-700 rounded-lg shadow p-6 mt-6 w-full"
            style={{
              maxWidth: "63rem",
              overflow: "auto",
              msOverflowStyle: "none",
              scrollbarWidth: "none",
              WebkitOverflowScrolling: "touch",
              paddingBottom: "5px",
              maxHeight: "calc(100vh - 1rem)",
            }}
          >
            {updateStatus && (
              <UpdateQuestionPopup handleUpdate={() => console.log("Handle")} />
            )}
            <button
              style={{ top: "0rem", right: "0rem" }}
              className="absolute text-white rounded-full p-2 w-10 h-10 flex items-center justify-center"
              onClick={() => setApproval(false)}
            >
              <FontAwesomeIcon icon={faTimes} style={{ color: "black" }} />
            </button>
            <div className="mb-8 ">
              <h2 className="text-xl font-semibold mb-2">
                Behavioural Questions:
              </h2>
              <ul className="list-disc pl-4">
                {behavioralQuestions.map((question, index) => (
                  <li key={index} className="relative group flex items-center">
                    <span className="flex-grow w-[90%]">
                      {question.b_question_text}
                    </span>
                    <div className="flex items-center  absolute right-0">
                      <button onClick={() => setUpdateStatus(!updateStatus)}>
                        <FontAwesomeIcon icon={faRedo} />
                      </button>
                      {/* <button className="text-gray-300 mr-2">
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button className="text-gray-300">
                        <FontAwesomeIcon icon={faTrash} />
                      </button> */}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">
                Technical Questions:
              </h2>
              {technicalQuestions.map((question, index) => (
                <div key={index} className="mb-4 relative group">
                  <div className="flex justify-between items-center mb-2">
                    <p className="w-[95%]">
                      <span className="font-semibold">Question:</span>{" "}
                      {question.question}
                    </p>
                    <div className="flex items-center  absolute right-0">
                      {/* <button className="text-gray-300 hover:text-grey-700 mr-2">
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button className="text-gray-300 hover:text-grey-700">
                        <FontAwesomeIcon icon={faTrash} />
                      </button> */}
                      <button>
                        <FontAwesomeIcon icon={faRedo} />
                      </button>
                    </div>
                  </div>
                  <ul className="list-disc pl-4 w-[95%]">
                    {Object.entries(question.options).map(([key, value]) => (
                      <li key={key}>
                        {key}. {value}
                      </li>
                    ))}
                  </ul>
                  <p>
                    <span className="font-semibold">Answer:</span>{" "}
                    {question.answer}
                  </p>
                </div>
              ))}
            </div>
            {codingQuestion && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Coding Question:</h2>
                <p className="w-[95%]">
                  <span className="font-semibold">Question:</span>{" "}
                  {codingQuestion.question}
                </p>
                <div className="flex items-center absolute right-4">
                  {/* <button className="text-gray-300 hover:text-grey-700 mr-2">
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button className="text-gray-300 hover:text-grey-700">
                    <FontAwesomeIcon icon={faTrash} />
                  </button> */}
                  <button>
                    <FontAwesomeIcon icon={faRedo} />
                  </button>
                </div>
                <p>
                  <span className="font-semibold">Sample Input:</span>{" "}
                  {codingQuestion.sample_input}
                </p>
                <p>
                  <span className="font-semibold">Sample Output:</span>{" "}
                  {codingQuestion.sample_output}
                </p>
              </div>
            )}

            <div className="flex justify-between mt-4">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 focus:outline-none"
                onClick={() => navigate(`/online-assess/`)}
              >
                Approve
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 focus:outline-none"
                onClick={() => setApproval(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showSelectCandidatePopup && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="relative bg-white dark:bg-zinc-700 rounded-lg shadow p-6 max-w-md w-full ">
            <h2 className="text-lg font-semibold mb-4">Select Candidate</h2>
            <p className="mb-4">
              Please select at least one candidate before proceeding.
            </p>
            <button
              className="bg-blue-500 text-white p-2 rounded-lg shadow"
              onClick={() => setShowSelectCandidatePopup(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
      {showDetails && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="relative bg-white dark:bg-zinc-700 rounded-lg shadow p-6 max-w-2xl w-full ">
            <button
              style={{ top: "-1rem", right: "-1rem" }}
              className="absolute  bg-blue-500 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center"
              onClick={closeDetails}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <div className="border-b-2 border-gray-400 mb-4 pb-4">
              <div className="flex justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    {candidateDetails.candidate_name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {candidateDetails.title}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm">
                    <strong>Email:</strong> {candidateDetails.email_id}
                  </p>
                  <p className="text-sm">
                    <strong>Phone:</strong> {candidateDetails.phone_number}
                  </p>
                  <p className="text-sm">
                    <strong>Address:</strong> {candidateDetails.address}
                  </p>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Technical Skills</h3>
              <div className="flex flex-wrap">
                {candidateDetails.tech_skills.map(
                  (skill: string, index: number) => (
                    <button
                      key={index}
                      className="bg-blue-200 text-blue-900 rounded-lg px-2 py-1 mr-2 mb-2 text-sm"
                    >
                      {skill}
                    </button>
                  )
                )}
              </div>
            </div>
            <hr className="my-4" />
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Behavioral Skills</h3>
              <div className="flex flex-wrap">
                {candidateDetails.behaviour_skills.map(
                  (skill: string, index: number) => (
                    <button
                      key={index}
                      className="bg-blue-200 text-blue-900 rounded-lg px-2 py-1 mr-2 mb-2 text-sm"
                    >
                      {skill}
                    </button>
                  )
                )}
              </div>
            </div>
            <hr className="my-4" />
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">
                Additional Information
              </h3>
              <div className="mb-2">
                <p className="text-sm">
                  <strong>Date of Birth:</strong>{" "}
                  {candidateDetails.date_of_birth}
                </p>
                <p className="text-sm">
                  <strong>Nationality:</strong> {candidateDetails.nationality}
                </p>
                <p className="text-sm">
                  <strong>LinkedIn:</strong> {candidateDetails.linkedin_id}
                </p>
                <p className="text-sm">
                  <strong>GitHub:</strong> {candidateDetails.github_id}
                </p>
                <p className="text-sm">
                  <strong>Total Experience:</strong>{" "}
                  {candidateDetails.total_experience}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {showPopup && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div
            className="relative bg-white dark:bg-zinc-700 rounded-lg shadow p-6 w-full"
            style={{ maxWidth: "30rem" }}
          >
            <button
              style={{ top: "-1rem", right: "-1rem" }}
              className="absolute bg-blue-500 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center"
              onClick={() => setShowPopup(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h2 className="text-lg font-semibold mb-4">
              Enter Number of Questions
            </h2>

            <div className="mb-4 flex">
              <div className="inp-pop">
                <label htmlFor="numBehavioral">
                  Number of Behavioral Questions:
                </label>
                <p className="text-sm">*Max 5</p>
              </div>
              <div className="inp-pop2">
                <input
                  type="number"
                  id="numBehavioral"
                  min={1}
                  max={5}
                  value={numBehavioral}
                  onChange={(e) => setNumBehavioral(Number(e.target.value))}
                  style={{
                    border: "1px solid #ccc",
                    width: "100%",
                    borderRadius: "0.25rem",
                    padding: "0.5rem",
                  }}
                />
              </div>
            </div>
            <div className="mb-4 flex">
              <div className="inp-pop">
                <label htmlFor="numMCQ">Number of MCQ Questions:</label>
                <p className="text-sm">*Max 5</p>
              </div>
              <div className="inp-pop2">
                <input
                  type="number"
                  id="numMCQ"
                  min={1}
                  max={5}
                  value={numMCQ}
                  onChange={(e) => setNumMCQ(Number(e.target.value))}
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: "0.25rem",
                    width: "100%",
                    padding: "0.5rem",
                  }}
                />
              </div>
            </div>
            <div className="mb-4 flex">
              <div className="inp-pop">
                <label htmlFor="numMCQ">Number of Coding Questions:</label>
                <p className="text-sm">*Max 3</p>
              </div>
              <div className="inp-pop2">
                <input
                  type="number"
                  id="numMCQ"
                  defaultValue={0}
                  min={0}
                  max={3}
                  value={numCoding}
                  onChange={(e) => setNumCoding(Number(e.target.value))}
                  style={{
                    border: "1px solid #ccc",
                    width: "100%",
                    borderRadius: "0.25rem",
                    padding: "0.5rem",
                  }}
                />
              </div>
            </div>

            <button
              className="bg-blue-500 text-white p-2 rounded-lg shadow"
              onClick={handleProceed}
            >
              Proceed
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RespJdDash;
