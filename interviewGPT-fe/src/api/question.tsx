import api from "@/components/customAxios/Axios";

export async function getTestQuestion(candName: string, jobId: number) {
  try {
    const response = await api.post(
      "/fetch_candidate_questions_after_selected",
      {
        candidate_name: candName,
        job_id: jobId,
      }
    );
    sessionStorage.setItem("question", JSON.stringify(response.data));
    console.log(response.data);

    return response.data;
  } catch (error) {
    console.log(error);
    alert("Select a Candidate!");
    return null;
  }
}
