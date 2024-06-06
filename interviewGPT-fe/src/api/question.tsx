import api from "@/components/customAxios/Axios";

export async function GetTestQuestion(resume_id: string, jobId: number) {
  try {
    const response = await api.post(
      "/fetch_candidate_questions_after_selected",
      {
        resume_id: resume_id,
        job_id: jobId,
      }
    );
    sessionStorage.setItem("question", JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    return null;
  }
}
