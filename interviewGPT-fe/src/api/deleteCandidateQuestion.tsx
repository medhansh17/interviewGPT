import api from "@/components/customAxios/Axios";
import axios from "axios";
interface DeleteQuestionParams {
  resume_id: string;
  jobId: string;
  question_id: string;
  question_type: "behavioral" | "technical" | "coding";
  toast: any;
}

interface ApiResponse {
  status: string;
  error?: string;
}

export async function deleteQuestion({
  resume_id,
  jobId,
  question_id,
  question_type,
  toast,
}: DeleteQuestionParams): Promise<ApiResponse | null> {
  try {
    const response = await api.delete<ApiResponse>(
      "/delete_candidate_question",
      {
        data: {
          resume_id,
          job_id: jobId,
          question_id,
          question_type,
        },
      }
    );

    // Check for success response
    if (response.status === 200) {
      toast.success({
        title: "Question deleted successfully",
        duration: 5000,
        description: "",
        status: "success",
        open: true,
      });
      return response.data;
    } else {
      console.error(`Error: ${response.data.error}`);
      return null;
    }
  } catch (error: any) {
    // Handle different types of errors
    if (axios.isAxiosError(error)) {
      console.error(
        `Axios error: ${error.response?.data.error || error.message}`
      );
    } else {
      console.error(`Unexpected error: ${error.message}`);
    }
    return null;
  }
}
