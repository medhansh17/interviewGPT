import api from "@/components/customAxios/Axios";

export async function getTestQuestion(resume_id: string, jobId: number) {
  try {
    const response = await api.post(
      "/fetch_candidate_questions_after_selected",
      {
        resume_id: resume_id,
        job_id: jobId,
      }
    );
    sessionStorage.setItem("question", JSON.stringify(response.data));
    console.log(response.data);

    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
}
