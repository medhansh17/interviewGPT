import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "@/components/customAxios/Axios";
import { useToast } from "./toast";
const MAX_COUNT = 5;

interface MyObjectType {
  jd: string | null;
  role: string | null;
  job_id: number | null;
}
const ExampleComponent: React.FC = () => {
  const toast = useToast();
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
          toast.error({
            type: "background",
            duration: 3000,
            status: "Error",
            title: "File limit exceeded",
            description: `You can upload a maximum of ${MAX_COUNT} files`,
            open: true,
          });
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
        toast.success({
          type: "background",
          duration: 3000,
          status: "Success",
          title: "Resume uploaded successfully",
          description: "",
          open: true,
        });
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
    } finally {
      setSubmitting(false);
      setUploadedFiles([]);
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
