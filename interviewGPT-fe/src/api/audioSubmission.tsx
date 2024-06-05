import api from "@/components/customAxios/Axios";

export async function submitAudio({
  audioBlob,
  question_id,
  candidate_id,
  jobId,
}: {
  audioBlob: Blob;
  question_id: string;
  candidate_id: string;
  jobId: string | null;
}) {
  const formData = new FormData();
  formData.append("audio", audioBlob);
  formData.append("question_id", question_id);
  formData.append("candidate_id", candidate_id);
  formData.append("job_id", jobId ?? "");

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
