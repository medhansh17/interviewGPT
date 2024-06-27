import api from "@/components/customAxios/Axios";

export default async function getAssessmentSheet(token: string) {
  try {
    const response = await api.get(`/assessment_sheet?token=${token}`);
    sessionStorage.setItem("question", JSON.stringify(response.data));
    return response;
  } catch (err: any) {
    throw err;
  }
}
