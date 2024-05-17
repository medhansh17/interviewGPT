import api from "@/components/customAxios/Axios";

export async function submitAudio({
  audioBlob,
  question,
  canName,
  jobId,
}: {
  audioBlob: Blob;
  question: string;
  canName: string;
  jobId: string | null;
}) {
  const formData = new FormData();
  formData.append("audio", audioBlob);
  formData.append("question", question);
  formData.append("candidate_name", canName);
  formData.append("job_id", jobId);
  try {
    const response = await api.post("/blob_process_audio", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error submitting audio:", error);
    return null;
  }
}
