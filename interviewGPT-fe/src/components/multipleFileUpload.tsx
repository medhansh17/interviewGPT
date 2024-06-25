import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "@/components/customAxios/Axios";
import { useToast } from "./toast";

const MAX_COUNT = 5;

interface MyObjectType {
  jd: string | null;
  role: string | null;
  job_id: number | null;
}

const ExampleComponent = ({ refresh }: { refresh: () => void }) => {
  const toast = useToast();
  const { id } = useParams<{ id: string }>();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fileLimit, setFileLimit] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [jobDetails, setJobDetails] = useState<MyObjectType | null>(null);

  const handleUploadFiles = (files: File[]) => {
    const uploaded = [...uploadedFiles];
    let limitExceeded = false;

    files.forEach((file) => {
      if (uploaded.findIndex((f) => f.name === file.name) === -1) {
        if (uploaded.length < MAX_COUNT) {
          uploaded.push(file);
        } else {
          limitExceeded = true;
        }
      }
    });

    if (limitExceeded) {
      toast.error({
        type: "background",
        duration: 3000,
        status: "Error",
        title: "File limit exceeded",
        description: `You can upload a maximum of ${MAX_COUNT} files`,
        open: true,
      });
    } else {
      setUploadedFiles(uploaded);
      setFileLimit(uploaded.length >= MAX_COUNT);
    }
  };

  const handleFileEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosenFiles = Array.from(e.target.files || []);
    handleUploadFiles(chosenFiles);
  };

  useEffect(() => {
    const getJobDetails = async () => {
      try {
        const response = await api.get(`/jobs/${id}`);
        const { role, jd, job_id } = response.data.job_details;
        setJobDetails({ role, jd, job_id });
        localStorage.setItem("job_id", job_id.toString());
      } catch (error: any) {
        toast.error({
          type: "background",
          duration: 3000,
          status: "Error",
          title: "Error fetching job details",
          description: error.message,
          open: true,
        });
      }
    };

    getJobDetails();
  }, [id, toast]);

  const handleSubmit = useCallback(async () => {
    // if (!checkAdmin()) {
    //   toast.error({
    //     type: "background",
    //     duration: 3000,
    //     status: "Error",
    //     title: "You are not authorized to perform this action",
    //     description: "",
    //     open: true,
    //   });
    //   return;
    // }

    setSubmitting(true);
    try {
      const formData = new FormData();
      uploadedFiles.forEach((file) => formData.append("resume", file));
      if (jobDetails) {
        formData.append("id", jobDetails.job_id!.toString());
        formData.append("role", jobDetails.role!);
      }

      const response = await api.post("/upload_resume_to_job", formData);

      if (response.status === 200) {
        refresh();
        setTimeout(refresh, 2000);
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
  }, [uploadedFiles, jobDetails, refresh, toast]);

  // const checkAdmin = useCallback(() => {
  //   const role = localStorage.getItem("role");
  //   return role === "bluetick-admin";
  // }, []);

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
          <a className={`btn btn-primary ${fileLimit ? "disabled" : ""}`}>
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
