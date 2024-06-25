export const Features = () => {
  return (
    <div className="" data-aos="fade-up">
      <div className="relative px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
        <div className="absolute inset-x-0 top-0 items-center justify-center hidden overflow-hidden md:flex md:inset-y-0">
          {/* <svg
            viewBox="0 0 88 88"
            className="w-full max-w-screen-xl text-indigo-100"
          >
            
          </svg> */}
        </div>
        <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* first */}
          <div className="flex flex-col justify-between overflow-hidden text-left transition-shadow duration-200 bg-white rounded shadow-xl group hover:shadow-2xl">
            <div className="p-5">
              <div className="flex items-center justify-center w-10 h-10 mb-4 rounded-full bg-indigo-50">
                <img
                  width="40"
                  height="40"
                  src=".\assets\ai-analysis.svg"
                  alt="decision--v1"
                />
              </div>
              <p className="text-xl mb-2 font-bold">
                AI-Powered Resume Analysis
              </p>
              <p className="text-lg leading-5 text-gray-600">
                Utilize AI to match job descriptions with resumes, identifying
                both matching and missing skills, and evaluating years of
                experience to generate a comprehensive cumulative score for each
                candidate.
              </p>
            </div>
            <div className="w-full h-1 ml-auto duration-300 origin-left transform scale-x-0 bg-deep-purple-accent-400 group-hover:scale-x-100" />
          </div>
          {/* second */}
          <div className="flex flex-col justify-between overflow-hidden text-left transition-shadow duration-200 bg-white rounded shadow-xl group hover:shadow-2xl">
            <div className="p-5">
              <div className="flex items-center justify-center w-10 h-10 mb-4 rounded-full bg-indigo-50">
                <img
                  width="25"
                  height="25"
                  src="https://img.icons8.com/ios-filled/50/faq.png"
                  alt="faq"
                />
              </div>
              <p className=" text-xl mb-2 font-bold">
                AI-Driven Skill Gap Analysis
              </p>
              <p className="text-lg leading-5 text-gray-600">
                Use AI to identify and highlight skill gaps in candidates,
                providing actionable insights for targeted training and
                development programs.
              </p>
            </div>
            <div className="w-full h-1 ml-auto duration-300 origin-left transform scale-x-0 bg-deep-purple-accent-400 group-hover:scale-x-100" />
          </div>

          {/* third */}
          <div className="flex flex-col justify-between overflow-hidden text-left transition-shadow duration-200 bg-white rounded shadow-xl group hover:shadow-2xl">
            <div className="p-5">
              <div className="flex items-center justify-center w-10 h-10 mb-4 rounded-full bg-indigo-50">
                <img
                  width="24"
                  height="24"
                  src="https://img.icons8.com/material-sharp/24/level-tool.png"
                  alt="level-tool"
                />
              </div>
              <p className="text-xl mb-2 font-bold">
                AI-Generated Online Assessments
              </p>
              <p className="text-lg leading-5 text-gray-600">
                Create customized online assessment tests specifically curated
                for each candidate based on the role, ensuring relevant and
                accurate evaluations.
              </p>
            </div>
            <div className="w-full h-1 ml-auto duration-300 origin-left transform scale-x-0 bg-deep-purple-accent-400 group-hover:scale-x-100" />
          </div>
          {/* fourth */}
        </div>
        {/* five */}
        <div className="flex justify-center items-center gap-5">
          <div className="relative flex justify-center items-center mt-5">
            <div className="flex flex-col justify-between overflow-hidden text-left transition-shadow duration-200 bg-white rounded shadow-xl group hover:shadow-2xl">
              <div className="p-5">
                <div className="flex items-center justify-center w-10 h-10 mb-4 rounded-full bg-indigo-50">
                  <img
                    width="30"
                    height="30"
                    src="https://img.icons8.com/ios-filled/50/visualization-skill.png"
                    alt="visualization-skill"
                  />
                </div>
                <p className="text-xl mb-2 font-bold">
                  AI-Proctored Online Exams
                </p>
                <p className="text-lg leading-5 text-gray-600 w-full md:w-[20rem]">
                  Conduct anti-cheating, online proctored exams to maintain
                  integrity, while comprehensively assessing both behavioral and
                  technical aspects of the candidate.
                </p>
              </div>
              <div className="w-full h-1 ml-auto duration-300 origin-left transform scale-x-0 bg-deep-purple-accent-400 group-hover:scale-x-100" />
            </div>
          </div>

          <div className="relative flex justify-center items-center mt-5">
            <div className="flex flex-col justify-between overflow-hidden text-left transition-shadow duration-200 bg-white rounded shadow-xl group hover:shadow-2xl">
              <div className="p-5">
                <div className="flex items-center justify-center w-10 h-10 mb-4 rounded-full bg-indigo-50">
                  <img
                    width="30"
                    height="30"
                    src="https://img.icons8.com/ios-glyphs/30/share-rounded.png"
                    alt="share-rounded"
                  />
                </div>
                <p className="text-xl mb-2 font-bold">
                  AI-Driven Exam Analysis
                </p>
                <p className="text-lg leading-5 text-gray-600 w-full md:w-[20rem]">
                  Provide detailed AI-driven analysis of the exam, covering both
                  behavioral and technical aspects, to deliver insightful
                  reports for informed decision-making.
                </p>
              </div>
              <div className="w-full h-1 ml-auto duration-300 origin-left transform scale-x-0 bg-deep-purple-accent-400 group-hover:scale-x-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
