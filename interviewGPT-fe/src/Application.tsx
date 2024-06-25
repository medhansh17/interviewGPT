import TextArea from "./components/TextArea";
import Table from "./components/Table";
import { useState } from "react";
import Header from "./components/Header";
import { useToast } from "./components/toast";
import { useLoader } from "./context/loaderContext";
import api from "./components/customAxios/Axios";
import { useNavigate } from "react-router-dom";
import AddJd from "./components/AddJd";
import TextArea2 from "./components/TextArea2";

function Application() {
  const { setLoading } = useLoader();
  const [file, setFile] = useState<any | null>(null);
  const [mainData, setMainData] = useState<any | null>(null);
  const [mainTextArea, setMainTextArea] = useState<any | null>("");
  const [load, setLoad] = useState(false);
  const [mainData2, setMainData2] = useState<any | null>(null);
  const [mainTextArea2, setMainTextArea2] = useState<any | null>("");
  // const [isHidden, setIsHidden] = useState(false);
  const [empty, setEmpty] = useState<boolean>(false);
  // const [fetchSkill] = useState<FetchSkillsData & { timestamp: number }>();
  // const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<string>("");
  const [role2, setRole2] = useState<string>("");
  const [doc, setDoc] = useState(false);
  const [manual, setManual] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  const uploadJD = async () => {
    const wordCountRegex = /\S+/g;
    const wordCount =
      (mainTextArea2.match(wordCountRegex) || []).length ||
      (mainTextArea.match(wordCountRegex) || []).length;
    if ((load == false && wordCount < 50) || wordCount > 10000) {
      toast.error({
        type: "background",
        duration: 3000,
        status: "Error",
        title: "Error",
        description:
          "JD should be between 50 and 10000 words. Please try again.",
        open: true,
      });
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/manual_upload_job", {
        role: mainData?.role || mainData2?.role || role || "",
        jd: mainData?.jd || mainData2?.jd || mainTextArea || mainTextArea2,
      });
      if (response.data.message === "Job uploaded successfully.") {
        setLoading(false);
        setMainTextArea(null);
        setMainTextArea2(null);
        setMainData("");
        setMainData2("");
        setEmpty(true);
        setRole("");
        setRole2("");
        navigate("/dashboard");
        toast.success({
          type: "background",
          duration: 3000,
          status: "Error",
          title: "Success",
          description: "Job JD added.",
          open: true,
        });
      } else if (response.data.message == "Job JD already exists.") {
        toast.error({
          type: "background",
          duration: 3000,
          status: "Error",
          title: "Error",
          description: "Job JD already exists.",
          open: true,
        });
        setLoading(false);
        setEmpty(true);
        setMainTextArea(null);
        setMainTextArea2(null);
        setMainData(null);
        setRole("");
        setRole2("");
      } else if (
        response.data.message ==
        "Guest users can only upload one job description."
      ) {
        toast.error({
          type: "background",
          duration: 3000,
          status: "Error",
          title: "Error",
          description: "Guest users can only upload one job description.",
          open: true,
        });
        setLoading(false);
        setEmpty(true);
        setMainTextArea(null);
        setMainTextArea2(null);
        setMainData(null);
        setRole("");
        setRole2("");
      }
    } catch (error: any) {
      setLoading(false);
      toast.error({
        type: "background",
        duration: 3000,
        status: "Error",
        title: "Error",
        description:
          error.response?.data?.message || "An unknown error occurred.",
        open: true,
      });
    }
  };

  const uploadDoc = async () => {
    if (!file || !role2) {
      return;
    }
    const newResume = new FormData();
    newResume.append("role", role2);
    newResume.append("jd_file", file);

    try {
      setLoading(true);
      const response = await api.post("/file_upload_jd", newResume);
      if (response.status === 200) {
        setLoading(false);
        setMainTextArea(null);
        setMainTextArea2(null);
        setMainData(null);
        setRole("");
        setRole2("");
        navigate("/dashboard");
      } else {
        setLoading(false);
        toast.error({
          type: "background",
          duration: 3000,
          status: "Error",
          title: "Error",
          description: "Could not upload JD. Please try again.",
          open: true,
        });
      }
    } catch (error) {
      setLoading(false);
      toast.error({
        type: "background",
        duration: 3000,
        status: "Error",
        title: "Error",
        description: "Could not upload JD. Please try again.",
        open: true,
      });
    }
  };

  const handleReset = () => {
    setMainData(null);
    setMainTextArea(null);
    setMainData2(null);
    setMainTextArea2(null);
    setEmpty(true);
    setRole("");
    setRole2("");
    setFile(null);
    setLoad(false);
  };

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
      <div className="sm:w-[93%] w-full mx-auto">
        <Header />
      </div>
      <div
        onClick={() => navigate("/dashboard")}
        className="absolute right-[5rem] w-[10rem] text-center bg-gray-200 px-4 py-2 rounded-md shadow-md hover:bg-gray-300 cursor-pointer  mb-[2rem]  font-bold "
      >
        JD Dashboard
      </div>
      <div className="md:flex md:justify-center md:items-center 2xl:gap-8 xl:gap-0 gap-2">
        <div className="">
          <div className="mx-[3rem]">
            <div>
              <p className="flex justify-left items-center mb-2 font-bold md:text-[2rem] text-[1rem] mt-[2rem]">
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
                  className="  mt-[1rem]  py-2 w-[8rem] font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-blue-500 rounded-lg hover:bg-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80 ml-2"
                >
                  Type Manually
                </button>
                ``
              </div>

              <form onSubmit={doc ? uploadDoc : uploadJD}>
                {doc && load == false && (
                  <>
                    <input
                      required
                      type="text"
                      onChange={(e) => setRole2(e.target.value)}
                      // value={role2}
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
                      // value={role}
                      className="border my-4 border-zinc-300 shadow-sm w-full px-3 py-2 placeholder-zinc-400 text-zinc-700 bg-white rounded-lg focus:outline-none focus:shadow-outline"
                      placeholder="Enter Role"
                    />
                    {/* {error && (
                      <span style={{ fontSize: "0.9rem" }}>
                        <span style={{ color: "red", fontSize: "1rem" }}>
                          *
                        </span>
                        {error}
                      </span>
                    )} */}
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
                    Submit
                  </button>

                  <button
                    type="reset"
                    className={`h-[40px] ml-[1rem] mt-[1rem] px-6 py-2 w-[6rem] font-medium tracking-wide text-white capitalize transition-colors duration-300 transform ${
                      mainData ||
                      mainTextArea ||
                      mainData2 ||
                      mainTextArea2 ||
                      file
                        ? "bg-blue-600 hover:bg-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-80"
                        : "bg-gray-400 cursor-not-allowed"
                    } rounded-lg focus:outline-none`}
                    onClick={() => handleReset()}
                    // disabled={!mainData}
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div>
          <Table
            setMainData={setMainData}
            setLoad={setLoad}
            manual={manual}
            doc={doc}
          />
        </div>
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
