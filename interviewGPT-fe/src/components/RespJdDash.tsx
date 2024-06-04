import { useContext, useEffect, useRef, useState } from "react";
import Header from "./Header";
import api from "./customAxios/Axios";
import { useToast } from "./toast";
import { useParams } from "react-router-dom";
import { UserContext } from "../context/JobContext";
import { setCandList, deleteCandidateByName } from "../context/JobContext";
import InterviewDataDisplay from "./candidateResult";
import ExampleComponent from "./multipleFileUpload";
import { getTestQuestion } from "@/api/question";
import GeneratedQuesPopup from "./generatedQuesPopup";
import GenerateQuestionsPopup from "./generateQuestionsPopup";
import CandidateDetailsPopup from "./candidateDetailsPopup";
import ConfirmButton from "./confirmationPopup";
import { ConfirmDialog } from "primereact/confirmdialog";

interface MyObjectType {
  jd: string | null;
  role: string | null;
  job_id: number | null;
}

interface DataItem {
  resume_id: string;
  candidate_name: string;
  JD_MATCH: string;
  MATCH_STATUS: string;
  Matching_Skills: string;
  Missing_Skills: string;
}

interface BehavioralQuestion {
  b_question_id: string;
  b_question_text: string;
}

interface CodingQuestion {
  coding_ques_id: string;
  question: string;
  sample_input: string;
  sample_output: string;
}

interface TechnicalQuestion {
  tech_ques_id: string;
  question: string;
  options: { [key: string]: string };
  answer: string;
}
const RespJdDash = () => {
  const toast = useToast();
  const { state, dispatch } = useContext(UserContext)!;
  const [jobDetails, setJobDetails] = useState<MyObjectType | null>(null);
  const [file, setFile] = useState<any | null>(null);
  const [Data, setData] = useState<DataItem[]>([]);
  const [behavioralQuestions, setBehavioralQuestions] = useState<
    BehavioralQuestion[]
  >([]);
  const [show_Result, setshow_Result] = useState(false);
  const [codingQuestion, setCodingQuestion] = useState<
    CodingQuestion[] | undefined
  >(undefined);
  const [technicalQuestions, setTechnicalQuestions] = useState<
    TechnicalQuestion[]
  >([]);
  const [showFullJobDesc, setShowFullJobDesc] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { id } = useParams();
  const [approval, setApproval] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [resume_id, setResume_id] = useState("");
  const [showSelectCandidatePopup, setShowSelectCandidatePopup] =
    useState(false);
  const gen = "";
  const pop = false;
  const [Resultdata, setResultData] = useState<any>(null);

  const handleRightArrowClick = (item: any) => {
    setShowPopup(true);
    setResume_id(item.resume_id);
    const itemString = JSON.stringify(item);
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
        console.log("Candidate Data:", candidateData);
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
  const itemsPerPage = 10000; // Number of items per page
  const fileInputRef = useRef(null);
  const handleBrowseClick = () => {
    if (fileInputRef.current !== null && fileInputRef.current !== undefined) {
      (fileInputRef.current as HTMLInputElement).click();
    }
  };
  const handleRefresh = () => {
    const getCandList = async () => {
      try {
        const res = await api.get(`/get_resume_scores?job_id=${id}`);
        const candidateData = res.data.resume_scores;
        console.log("Candidate Data:", candidateData);
        dispatch(setCandList(candidateData));
      } catch (err: any) {
        toast.error({
          type: "background",
          duration: 3000,
          status: "Error",
          title: "Error fetching candidate details",
          description: { err },
          open: true,
        });
      }
    };
    getCandList();
    console.log("Refreshed");
  };
  // Calculate total number of pages
  const totalPages = Math.ceil(Data.length / itemsPerPage);
  // Pagination logic

  const handlePageChange = (page: any) => {
    setCurrentPage(page);
  };

  const addResume = async () => {
    if (!file || !jobDetails) {
      toast.error({
        type: "background",
        duration: 3000,
        status: "Error",
        title: "No file selected",
        description: "Please select a file to upload",
        open: true,
      });
      return;
    }
    const newResume = new FormData();
    newResume.append("resume", file);
    newResume.append(
      "id",
      jobDetails.job_id ? jobDetails.job_id.toString() : ""
    );
    newResume.append("role", jobDetails.role!);

    try {
      const response = await api.post("/upload_resume_to_job", newResume);
      console.log("add", response);
      if (response.statusText === "OK") {
        handleRefresh();
        toast.success({
          type: "background",
          duration: 3000,
          status: "Success",
          title: "Resume uploaded successfully",
          description: "",
          open: true,
        });
        setFile(null);
      }
    } catch (error) {
      toast.error({
        type: "background",
        duration: 3000,
        status: "Error",
        title: "Error uploading resume",
        description: "",
        open: true,
      });
      setFile(null);
    }
  };

  const deleteCandHandler = async (item: any) => {
    try {
      const resp = await api.get(
        `/delete_resume?resume_id=${item.resume_id}&job_id=${jobDetails?.job_id}`
      );
      console.log(resp);
      dispatch(deleteCandidateByName(item.candidate_name));
    } catch (error) {
      toast.error({
        type: "background",
        duration: 3000,
        status: "Error Deleting Candidate",
        title: { error },
        description: "",
        open: true,
      });
    }
  };

  const showCandDetails = (resume_id: string) => {
    setResume_id(resume_id);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
  };

  const truncateJobDescription = (description: any) => {
    const maxLines = 5;
    if (!description) return "";

    const lines = description.split("\n");
    if (lines.length <= maxLines) return description;

    return lines.slice(0, maxLines).join("\n");
  };

  useEffect(() => {
    const genQuestions = async () => {
      if (jobDetails?.job_id) {
        const resp = await getTestQuestion(resume_id, jobDetails?.job_id);
        setBehavioralQuestions(resp.Behaviour_q);
        setCodingQuestion(resp.coding_question);
        setTechnicalQuestions(resp.tech_questions);
      }
    };
    genQuestions();
  }, [approval]);

  const popHandle = (resume_id: string) => {
    setResume_id(resume_id);
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
              jobDetails?.jd &&
              jobDetails.jd.split("\n").length > 5 &&
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
            <ExampleComponent />
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
              onChange={(e) =>
                setFile(e.target.files ? e.target.files[0] : null)
              }
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
            <ConfirmDialog />
            <table className="w-full">
              <thead className="bg-zinc-200 dark:bg-zinc-600">
                <tr>
                  <th className="p-3 text-left">Candidates</th>
                  <th className="p-3  text-left">Skills Matching</th>
                  <th className="p-3 text-left">Skills Missing</th>
                  <th className="p-3 text-left">Experience Match</th>
                  <th className="p-3 text-left">Score</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 w-[150px] text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentJobs.map((item: any, index: number) => {
                  return (
                    <tr className="border-b dark:border-zinc-600" key={index}>
                      <td
                        className="p-3  font-bold underline"
                        onClick={() => showCandDetails(item.resume_id)}
                      >
                        {item.candidate_name}
                      </td>
                      <td className="p-3 w-[300px]">
                        <p className="">
                          {item.Matching_Skills &&
                            item.Matching_Skills.map(
                              (skill: any, index: any) => (
                                <span key={index}>
                                  {skill}
                                  {index !== item.Matching_Skills.length - 1 &&
                                    ", "}
                                </span>
                              )
                            )}
                        </p>
                      </td>
                      <td className="p-3 w-[300px]">
                        <p className="">
                          {item.Missing_Skills &&
                            item.Missing_Skills.map(
                              (skill: any, index: any) => (
                                <span key={index}>
                                  {skill}
                                  {index !== item.Missing_Skills.length - 1 &&
                                    ", "}
                                </span>
                              )
                            )}
                        </p>
                      </td>
                      <td className="p-3 text-center">
                        {item.experience_match}
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
                      <td className="p-3 text-zinc-500 dark:text-zinc-400 relative">
                        <div
                          className="flex flex-col items-center justify-around text-lg"
                          style={{ gap: "4px" }}
                        >
                          <ConfirmButton
                            label="Delete"
                            message="Do you want to delete this record?"
                            header="Delete Confirmation"
                            icon="pi pi-times"
                            acceptClassName="p-button-danger"
                            onConfirm={() => deleteCandHandler(item)}
                          />

                          {gen == "" && pop == false && item.status == null && (
                            <button
                              className="resp-btn"
                              onClick={() => handleRightArrowClick(item)}
                            >
                              Generate
                            </button>
                          )}
                          {item.selected_status &&
                            item.assessment_status == 0 &&
                            gen && (
                              <button className="resp-btn">Generating </button>
                            )}
                          {/* {item.selected_status && */}
                          {
                            // item.assessment_status == 1 &&
                            item.status == "assessment_generated" && (
                              <button
                                className="resp-btn"
                                onClick={() => popHandle(item.resume_id)}
                              >
                                Generated
                              </button>
                            )
                          }
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
        <GeneratedQuesPopup
          behavioralQuestions={behavioralQuestions}
          codingQuestion={codingQuestion}
          technicalQuestions={technicalQuestions}
          onClose={() => setApproval(false)}
        />
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
        <CandidateDetailsPopup
          resume_id={resume_id}
          job_id={jobDetails?.job_id ? jobDetails.job_id : null}
          setShowDetails={setShowDetails}
          closeDetails={closeDetails}
        />
      )}

      {showPopup && (
        <GenerateQuestionsPopup
          resume_id={resume_id}
          job_id={jobDetails?.job_id ? jobDetails.job_id : null}
          setPop={() => setShowPopup(false)}
        />
      )}
    </div>
  );
};

export default RespJdDash;
