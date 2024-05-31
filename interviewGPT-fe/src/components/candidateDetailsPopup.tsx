import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import api from "@/components/customAxios/Axios";

export interface CandidateDetails {
  candidate_name: string;
  title: string;
  email_id: string;
  phone_number: string;
  address: string;
  tech_skills: string[];
  behaviour_skills: string[];
  date_of_birth: string;
  nationality: string;
  linkedin_id: string;
  github_id: string;
  total_experience: string;
}

interface CandidateDetailsPopupProps {
  resume_id: string;
  job_id: number | null;
  setShowDetails: (showDetails: boolean) => void;
  closeDetails: () => void;
}

export default function CandidateDetailsPopup({
  resume_id,
  job_id,
  setShowDetails,
  closeDetails,
}: CandidateDetailsPopupProps) {
  const [candidateDetails, setCandidateDetails] =
    useState<CandidateDetails | null>(null);

  const showCandDetails = async () => {
    try {
      const res = await api.get(
        `/extracted_info?job_id=${job_id}&resume_id=${resume_id}`
      );
      setCandidateDetails(res.data.extracted_info_details);
      setShowDetails(true);
    } catch (err: unknown) {
      alert("Error fetching candidate details");
      setShowDetails(false);
      console.log(err);
    }
  };

  useEffect(() => {
    showCandDetails();
  }, [resume_id, job_id]);

  if (!candidateDetails) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
      <div className="relative bg-white dark:bg-zinc-700 rounded-lg shadow p-6 max-w-2xl w-full">
        <button
          style={{ top: "-1rem", right: "-1rem" }}
          className="absolute bg-blue-500 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center"
          onClick={closeDetails}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <div className="border-b-2 border-gray-400 mb-4 pb-4">
          <div className="flex justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">
                {candidateDetails.candidate_name}
              </h2>
              <p className="text-sm text-gray-600">{candidateDetails.title}</p>
            </div>
            <div className="text-right">
              <p className="text-sm">
                <strong>Email:</strong> {candidateDetails.email_id}
              </p>
              <p className="text-sm">
                <strong>Phone:</strong> {candidateDetails.phone_number}
              </p>
              <p className="text-sm">
                <strong>Address:</strong> {candidateDetails.address}
              </p>
            </div>
          </div>
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Technical Skills</h3>
          <div className="flex flex-wrap">
            {candidateDetails.tech_skills.map((skill, index) => (
              <button
                key={index}
                className="bg-blue-200 text-blue-900 rounded-lg px-2 py-1 mr-2 mb-2 text-sm"
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
        <hr className="my-4" />
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Behavioral Skills</h3>
          <div className="flex flex-wrap">
            {candidateDetails.behaviour_skills.map((skill, index) => (
              <button
                key={index}
                className="bg-blue-200 text-blue-900 rounded-lg px-2 py-1 mr-2 mb-2 text-sm"
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
        <hr className="my-4" />
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Additional Information</h3>
          <div className="mb-2">
            <p className="text-sm">
              <strong>Date of Birth:</strong> {candidateDetails.date_of_birth}
            </p>
            <p className="text-sm">
              <strong>Nationality:</strong> {candidateDetails.nationality}
            </p>
            <p className="text-sm">
              <strong>LinkedIn:</strong> {candidateDetails.linkedin_id}
            </p>
            <p className="text-sm">
              <strong>GitHub:</strong> {candidateDetails.github_id}
            </p>
            <p className="text-sm">
              <strong>Total Experience:</strong>{" "}
              {candidateDetails.total_experience}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
