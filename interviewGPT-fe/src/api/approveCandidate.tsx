import api from "@/components/customAxios/Axios";

export const approveCandidate = async (candidateId: string) => {
  try {
    const response = await api.post(`/approve_candidate`, {
      candidate_id: candidateId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
