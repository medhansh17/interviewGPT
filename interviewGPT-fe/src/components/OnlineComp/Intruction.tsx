import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const InstructionPage: React.FC = () => {
  const [isChecked, setIsChecked] = useState(false);
const navigate=useNavigate()
  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-4">Online Assessment</h1>
      
     
        <div className="bg-gray-100 p-4 rounded-md mb-4">
          <h2 className="text-xl font-bold mb-2">Instructions:</h2>
          <p>1.Complete each section within the specified time limit to ensure fair assessment and accuracy in your responses.</p>
          <p>
            2. Answer all questions truthfully and independently, refraining from seeking external help or using unauthorized resources.
          </p>
          <p>
            3.Ensure a stable internet connection and compatible device to prevent disruptions during the assessment process.
          </p>
        </div>
        <label className="flex items-center mb-4">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => setIsChecked(e.target.checked)}
          className="mr-2"
        />
        <span>I have read all the instructions.</span>
      </label>
      <button onClick={()=>navigate("/test")}
        className={`bg-blue-500 text-white px-4 py-2 rounded-md ${
          isChecked ? "" : "opacity-50 cursor-not-allowed"
        }`}
        disabled={!isChecked}
      >
        Next
      </button>
    </div>
  );
};

export default InstructionPage;