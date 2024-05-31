import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "@/components/customAxios/Axios";
const MAX_COUNT = 5;

interface MyObjectType {
  jd: string | null;
  role: string | null;
  job_id: number | null;
}
const ExampleComponent: React.FC = () => {
  const { id } = useParams();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fileLimit, setFileLimit] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [jobDetails, setJobDetails] = useState<MyObjectType | null>(null);

  const handleUploadFiles = (files: File[]) => {
    const uploaded = [...uploadedFiles];
    let limitExceeded = false;
    files.some((file: File) => {
      if (uploaded.findIndex((f) => f.name === file.name) === -1) {
        uploaded.push(file);
        if (uploaded.length === MAX_COUNT) setFileLimit(true);
        if (uploaded.length > MAX_COUNT) {
          alert(`You can only add a maximum of ${MAX_COUNT} files`);
          setFileLimit(false);
          limitExceeded = true;
          return true;
        }
      }
    });
    if (!limitExceeded) setUploadedFiles(uploaded);
  };

  const handleFileEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosenFiles = Array.prototype.slice.call(e.target.files);
    handleUploadFiles(chosenFiles);
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
    console.log("Fired");

    getJobDetails();
  }, []);
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      uploadedFiles.forEach((file) => {
        formData.append("resume", file);
      });
      formData.append(
        "id",
        jobDetails?.job_id ? jobDetails.job_id.toString() : ""
      );
      formData.append("role", jobDetails?.role!);

      const response = await api.post("/upload_resume_to_job", formData);
      if (response.statusText === "OK") {
        window.location.reload();
      }
      console.log(response.data);
    } catch (error) {
      console.error("Error occurred:", error);
    } finally {
      setSubmitting(false);
      setUploadedFiles([]);
      alert("Uploaded Successfully");
    }
  };

  return (
    <div className="m-2 inline-block">
      <input
        id="fileUpload"
        type="file"
        multiple
        accept="application/pdf, image/png"
        onChange={handleFileEvent}
        className="hidden"
        disabled={fileLimit || submitting}
      />

      {!uploadedFiles.length && (
        <label htmlFor="fileUpload">
          <a className={`btn btn-primary ${!fileLimit ? "" : "disabled"} `}>
            Bulk Upload
          </a>
        </label>
      )}

      {uploadedFiles.length > 0 && (
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-green-500 text-white p-2 rounded-lg shadow"
        >
          {submitting ? "Uploading..." : "Upload"}
        </button>
      )}
    </div>
  );
};

export default ExampleComponent;
