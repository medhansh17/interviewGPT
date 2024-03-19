import React, { useState } from "react";

interface DataItem {
  id: number;
  role: string;
  jd: string;
}
interface TableProps {
  setMainData: React.Dispatch<React.SetStateAction<any>>;
}

const truncateText = (text: string, wordCount: number) => {
  const words = text.split(" ");
  if (words.length <= wordCount) {
    return text;
  }
  return words.slice(0, wordCount).join(" ") + "...";
};

const Table: React.FC<TableProps> = ({ setMainData }: any) => {
  const [selectedJd, setSelectedJd] = useState<DataItem | null>(null);

  const data: DataItem[] = [
    {
      id: 1,
      role: "Senior Frontend Developer",
      jd: "Mandatory Skills \n 1. Knowledge of Functional and OO JavaScript/ES6 \n 2. Built web Applications using HTML5, CSS3, JavaScript with Frameworks like React.js(Hooks and context API), Vue.Js and svelte.js \n 3. Basic understanding of Typescript and type language concepts \n 4. Clear fundamental understanding of server side rendered apps, experience with frameworks like Next,js or Nuxt.js is Best \n 5. Good understanding of lib and frameworks like Webpack (4.0), lodash, any charting lib like d3.js or Victory \n 6. Expertise in using JavaScript state Management libraries such as Redux or Mobx \n 7. Prior experience in building responsive design layouts using a formal framework like Material UI. \n 8. Familiarity with best practices (web security concepts, ensuring browser & device compatibility, etc.)\n 9. Experience in development and debugging tools for cross-browser issues \n 10. Working knowledge of integrating with RESTful APIs for server-side functionality \n 11. Ability to work well individually and in a group setting, under pressure and deadlines \n Requirements \n B.Tech/ B.S. or M.Tech/ M.S. in Computer Science, IT or related field. 5-8 years of experience.",
    },
    {
      id: 2,
      role: "Senior Python Developer",
      jd: "Responsibilities: \n Design and develop automation solutions for healthcare processes using Python. \n Maintain and enhance existing solutions for seamless integration and improved performance. \n Conduct API testing and integration to ensure smooth connectivity with other systems. \n Apply problem-solving and critical thinking skills to quickly analyze and solve issues \n Collaborate with the team and communicate effectively to contribute to the transformation. Qualifications: \n Professional career of 3+ years as Python developer. \n Experience with API testing and integration \n Knowledge of automation frameworks such as Selenium or PlayWright (this is required)\n Familiarity with software development life cycle (SDLC)\n Good problem-solving and critical-thinking skills. Expectations:Follow the PEP 8 Style Guide. Modularize Code with Functions and Classes. Write Unit Test. Apply Design Patterns. Document Code and APIs. Optimize Performance. Understanding of relational databases and SQL. Familiarity with AWS, SQL, Docker, JavaScript. Experience with server-side applications",
    },
    {
      id: 3,
      role: "DevOps Engineer",
      jd: "Required Qualifications. Bachelor’s degree in Computer Engineering, Computer Science, or related field; Alternatively, significant work experience as a Software Engineer. 1-5 years of experience working as a DevOps engineer. Experience in large-scale, secure, and high availability solutions in the AWS Cloud, using automation to support deployment, scaling, monitoring, and management (Terraform / CloudFormation / SDK, etc.). Experience building CI/CD pipelines (i.e., GitLab CI, GH Actions, Jenkins, Gitlab CI/CD). Familiarity with containerization technologies such as Docker and Kubernetes. Proficiency with one or more programming languages (Bash, Python, Go, etc). Proven ability to troubleshoot and identify the root cause of infrastructure and security Issues. Good communication and collaboration skills. Collaborate with the founding team in a fast-paced startup environment.",
    },
  ];

  const handleCheckboxChange = (data: DataItem) => {
    setSelectedJd((prevData) => (prevData?.id === data.id ? null : data));
  };

  const handleLoadClick = () => {
    if (selectedJd) {
      setMainData(selectedJd);
    }
  };

  return (
    <section className="mx-[1rem] md:mx-[0rem] mt-[2rem]">
      <div className="">
        <div className="">
          <p className="flex justify-left items-center mb-2 font-bold md:text-[2rem] text-[1rem] md:pl-[2rem]">
            Load example Job Description
          </p>
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden border border-gray-200 dark:border-gray-700 md:rounded shadow-md">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead
                  style={{ backgroundColor: "#0d6efd" }}
                  className="dark:bg-gray-800"
                >
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 px-4 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400"
                    >
                      <div className="flex items-center gap-x-3">
                        <span className="md:text-[1.2rem] text-[#fff]">
                          Select
                        </span>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-12 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400"
                    >
                      <button className="flex items-center gap-x-2">
                        <span className="md:text-[1.2rem] text-[#fff]">
                          Role
                        </span>
                        <svg
                          className="h-3"
                          viewBox="0 0 10 11"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        ></svg>
                      </button>
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500 dark:text-gray-400"
                    >
                      <button className="flex items-center gap-x-2">
                        <span className="md:text-[1.2rem] text-[#fff]">
                          Job Description
                        </span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          className="w-4 h-4"
                        ></svg>
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-900 lg:h-[20rem]">
                  {data?.map((item) => (
                    <tr key={item.id} className="odd:bg-white even:bg-slate-50" >
                      <td className="px-4  text-sm font-medium text-gray-700 ">
                        <div className="inline-flex items-center gap-x-3">
                          <input
                            type="checkbox"
                            className="text-blue-500 border-gray-300 rounded dark:bg-gray-900 dark:ring-offset-gray-900 dark:border-gray-700 transform scale-125"
                            onChange={() => handleCheckboxChange(item)}
                            checked={selectedJd?.id === item.id}
                          />
                        </div>
                      </td>
                      <td className="lg:text-[1rem]  px-4 md:text-[0.5rem]  dark:text-gray-300 ">
                        {item.role}
                      </td>
                      <td className="lg:text-[1rem] px-4 md:text-[0.5rem]  dark:text-gray-300 ">
                        {" "}
                        {truncateText(item.jd, 12)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <button
          className=" ml-[2rem] mt-[1rem] px-6 py-2 w-[6rem] font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80"
          onClick={handleLoadClick}
        >
          Load
        </button>
      </div>
    </section>
  );
};

export default Table;
