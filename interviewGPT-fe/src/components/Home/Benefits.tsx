export const Benefits = () => {
  return (
    <div className="mx-auto" data-aos="fade-up">
      <div className="relative px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
        <div className="absolute inset-x-0 top-0 items-center justify-center hidden overflow-hidden md:flex md:inset-y-0">
          <svg
            viewBox="0 0 88 88"
            className="w-full max-w-screen-xl text-indigo-100"
          >
            {/* <circle fill="currentColor" cx="44" cy="44" r="15.5" />
                        <circle
                            fillOpacity="0.2"
                            fill="currentColor"
                            cx="44"
                            cy="44"
                            r="44"
                        />
                        <circle
                            fillOpacity="0.2"
                            fill="currentColor"
                            cx="44"
                            cy="44"
                            r="37.5"
                        />
                        <circle
                            fillOpacity="0.3"
                            fill="currentColor"
                            cx="44"
                            cy="44"
                            r="29.5"
                        />
                        <circle
                            fillOpacity="0.3"
                            fill="currentColor"
                            cx="44"
                            cy="44"
                            r="22.5"
                        /> */}
          </svg>
        </div>
        <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col justify-between overflow-hidden text-left transition-shadow duration-200 bg-white rounded shadow-xl group hover:shadow-2xl">
            <div className="p-5">
              <div className="flex items-center justify-center w-10 h-10 mb-4 rounded-full bg-indigo-50">
                <img
                  width="30"
                  height="30"
                  src="https://img.icons8.com/ios-filled/50/time-management-skills.png"
                  alt="time-management-skills"
                />
              </div>
              <p className="text-xl  mb-2 font-bold">Time Efficiency</p>
              <p className="text-lg leading-5 text-gray-600">
                Save Significant Time in Preparing for Interviews – Focus More
                on the Candidate, Less on the Prep Work
              </p>
            </div>
            <div className="w-full h-1 ml-auto duration-300 origin-left transform scale-x-0 bg-deep-purple-accent-400 group-hover:scale-x-100" />
          </div>
          <div className="flex flex-col justify-between overflow-hidden text-left transition-shadow duration-200 bg-white rounded shadow-xl group hover:shadow-2xl">
            <div className="p-5">
              <div className="flex items-center justify-center w-10 h-10 mb-4 rounded-full bg-indigo-50">
                <img
                  width="30"
                  height="30"
                  src="https://img.icons8.com/ios-glyphs/30/accuracy--v1.png"
                  alt="accuracy--v1"
                />
              </div>
              <p className="text-xl mb-2 font-bold">Enhanced Accuracy</p>
              <p className="text-lg leading-5 text-gray-600">
                Leverage AI for Generating Targeted Questions, Ensuring a More
                Accurate Assessment of Candidates' Skills
              </p>
            </div>
            <div className="w-full h-1 ml-auto duration-300 origin-left transform scale-x-0 bg-deep-purple-accent-400 group-hover:scale-x-100" />
          </div>
          <div className="flex flex-col justify-between overflow-hidden text-left transition-shadow duration-200 bg-white rounded shadow-xl group hover:shadow-2xl">
            <div className="p-5">
              <div className="flex items-center justify-center w-10 h-10 mb-4 rounded-full bg-indigo-50">
                <img
                  width="30"
                  height="30"
                  src="https://img.icons8.com/ios-glyphs/30/enter-2.png"
                  alt="enter-2"
                />
              </div>
              <p className="text-xl mb-2 font-bold">
                Consistency in Interviews
              </p>
              <p className="text-lg leading-5 text-gray-600">
                Effortlessly Mark Responses as Correct, Partially Correct, or
                Wrong - Streamline the Scoring Process for Each Skill
              </p>
            </div>
            <div className="w-full h-1 ml-auto duration-300 origin-left transform scale-x-0 bg-deep-purple-accent-400 group-hover:scale-x-100" />
          </div>
        </div>
        <div className="flex items-center justify-center gap-5">
          <div className="relative flex justify-center items-center mt-5">
            <div className="flex flex-col justify-between overflow-hidden text-left transition-shadow duration-200 bg-white rounded shadow-xl group hover:shadow-2xl">
              <div className="p-5">
                <div className="flex items-center justify-center w-10 h-10 mb-4 rounded-full bg-indigo-50">
                  <img
                    width="30"
                    height="30"
                    src="https://img.icons8.com/ios-glyphs/30/voice-and-touch.png"
                    alt="voice-and-touch"
                  />
                </div>
                <p className="text-xl mb-2 font-bold">
                  User-Friendly Interface
                </p>
                <p className="text-lg leading-5 text-gray-600 w-full md:w-[20rem]">
                  Enjoy a Seamless, Intuitive Experience with Our User-Friendly
                  Platform, Designed for Recruiters of All Skill Levels.
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
                    src="https://img.icons8.com/ios-filled/50/tiny-decisions.png"
                    alt="tiny-decisions"
                  />
                </div>
                <p className="text-xl mb-2 font-bold">Data-Driven Decisions</p>
                <p className="text-lg leading-5 text-gray-600 w-full md:w-[20rem]">
                  Make Informed Hiring Decisions with Data-Driven Insights and
                  Comprehensive Candidate Profiles.
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
