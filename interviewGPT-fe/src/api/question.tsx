import api from "@/components/customAxios/Axios";
import { useToast } from "../components/toast";

export async function getTestQuestion(resume_id: string, jobId: number) {
  const toast = useToast();
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
    toast.error({
      type: "background",
      duration: 3000,
      status: "Error",
      title: "Error fetching questions",
      description: "",
      open: true,
    });
    return null;
  }
}
