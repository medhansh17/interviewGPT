import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const InstructionPage: React.FC = () => {
  const [isChecked, setIsChecked] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="max-w-xl mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-4 text-center">Online Assessment</h1>
      <div className="bg-gray-100 p-4 rounded-md mb-4">
        <h2 className="text-xl font-bold mb-2">Instructions:</h2>
        <p>
          1. Before starting your online interview and coding round, please
          ensure that you complete each section within the specified time limit
          to ensure a fair assessment and accuracy in your responses. Managing
          your time effectively is crucial for addressing all questions
          thoroughly within the given timeframe.
        </p>
        <p>
          2. Maintain the integrity of the assessment by answering all questions
          truthfully and independently. Refrain from seeking external help or
          using unauthorized resources, ensuring a genuine evaluation of your
          skills and knowledge.
        </p>
        <p>
          3. Ensure a stable internet connection and use a compatible device to
          prevent any disruptions during the assessment process. Technical
          issues can hinder your performance, so having a reliable setup is
          essential for a smooth experience.
        </p>
        <p>
          4. Prepare your environment to be conducive to concentration. Use a
          quiet, well-lit space with minimal distractions. Close unnecessary
          applications and browser tabs to prevent interruptions and potential
          slowdowns, ensuring that your focus remains on the task at hand.
          Following these guidelines will help you perform effectively during
          the online interview and coding round.
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
      <button
        onClick={() => navigate("/test")}
        className={`bg-blue-500 text-white px-4 py-2 rounded-md relative left-[50%] translate-x-[-50%] ${
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
