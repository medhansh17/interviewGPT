import api from "@/components/customAxios/Axios";

export async function updateQuestion({
  question,
  jobId,
}: {
  question: string;
  jobId: string;
}) {
  try {
    const response = await api.post("/update_question", {
      question,
      job_id: jobId,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating question:", error);
    return null;
  }
}
