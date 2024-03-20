import React, { useState } from "react";
import { FetchSkillsData } from "@/types";
import api from './customAxios/Axios';

interface TechSkillTableProps {
	fetchSkill?: FetchSkillsData;
	role?: any;

}

// interface InputValues {
// 	[key: string]: {
// 		basic: number;
// 		intermediate: number;
// 		advance: number;
// 	};
// }

const TechSkillTable: React.FC<TechSkillTableProps> = ({ fetchSkill, role }) => {
	const [inputValues, setInputValues] = useState(() => Object.fromEntries(
		(fetchSkill?.skills.technical_skills || []).map((skill) => [
			skill,
			{ basic: 1, intermediate: 1, advance: 1 },
		]),
	));
console.log("vv",inputValues)
	const handleInputChange = (
		softSkill: string,
		level: "basic" | "intermediate" | "advance",
		value: number,
	) => {
		setInputValues((prevValues) => ({
			...prevValues,
			[softSkill]: {
				...prevValues[softSkill],
				[level]: value,
			},
		}));
	};

	const calculateTotal = (
		softSkill: string,
		level: "basic" | "intermediate" | "advance",
	): number => {
		const skillData = inputValues[softSkill];
		return skillData ? skillData[level] : 1;
	};
	const generateQuestion = async () => {
		console.log("bb",inputValues)
		try {
		  const transformedSkills = Object.entries(inputValues).map(([softSkill, levels]) => ({
			skill: softSkill,
			experience: "2-3 years", // Example value, you can adjust this as needed
			num_basic: levels.basic,
			num_intermediate: levels.intermediate,
			num_advanced: levels.advance
		  }));
	  console.log("transformed",transformedSkills)
		  const response = await api.post(
			"/generate_technical_questions",
			{
			  technical_skills: transformedSkills,
			  name: role
			}
		  );
		  localStorage.setItem(
						"techSkill",
						JSON.stringify(response?.data),
					);
		 window.location.href = "#/app-submit"
		  console.log(response.data); // Assuming the response contains data field with the result
		} catch (err) {
		}}
	
	return (
		<div className="flex flex-col mx-[3rem]">
			<div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
				<div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
					<div className="overflow-hidden md:rounded shadow-md ">
						<table className="border-collapse w-full md:rounded divide-y divide-gray-200 dark:divide-gray-700">
							<thead className="bg-blue-600 text-white">
								<tr>
									<th scope="col" className="border border-blue-600 text-center p-2.5" >
										TechinalSkill
									</th>
									<th scope="col" className="border border-blue-600 text-center p-2.5 w-38">
										<p>Basic Question</p>
										<p className="text-slate-300 text-sm">(1 - 5)</p>
									</th>
									<th scope="col" className="border border-blue-600 text-center p-2.5 w-38">
										<p>Intermediate</p>
										<p className="text-slate-300 text-sm">(1 - 5)</p>
									</th>
									<th scope="col" className="border border-blue-600 text-center p-2.5 w-38">
										<p>Advance</p>
										<p className="text-slate-300 text-sm">(1 - 5)</p>
									</th>
									<th scope="col" className="border border-blue-600 text-center p-2.5 w-38">
										Total
									</th>
								</tr>
							</thead>
							<tbody>
								{fetchSkill?.skills?.technical_skills.map(
									(softSkill, index) => (
										<tr
											key={index}
											className="even:bg-blue-100 odd:bg-blue-50"
										>
											<td className="border border-blue-600 text-left p-2.5">
												{softSkill}
											</td>
											<td className="border border-blue-600 text-left p-2.5 flex justify-center">
												<input
													className="w-2/5 text-center p-1 rounded"
													type="number"
													max='5'
													value={inputValues[softSkill]?.basic || 1}
													onChange={(e) =>
														handleInputChange(
															softSkill,
															"basic",
															parseInt(e.target.value, 10) || 1,
														)
													}
												/>
											</td>
											<td className="border border-blue-600 text-center p-2.5">
												<input
													className="w-2/5 text-center p-1 rounded"
													type="number"
													max='5'
													value={inputValues[softSkill]?.intermediate || 1}
													onChange={(e) =>
														handleInputChange(
															softSkill,
															"intermediate",
															parseInt(e.target.value, 10) || 1,
														)
													}
												/>
											</td>
											<td className="border border-blue-600 text-center p-2.5">
												<input
													className="w-2/5 text-center p-1 rounded"
													type="number"
													max='5'
													value={inputValues[softSkill]?.advance || 1}
													onChange={(e) =>
														handleInputChange(
															softSkill,
															"advance",
															parseInt(e.target.value, 10) || 1,
														)
													}
												/>
											</td>
											<td className="border border-blue-600 text-left p-2.5">
												<span>
													{calculateTotal(softSkill, "basic") +
														calculateTotal(softSkill, "intermediate") +
														calculateTotal(softSkill, "advance")}
												</span>
											</td>
										</tr>
									),
								)}
							</tbody>
						</table>
					</div>
					<div className="flex justify-center items-center my-[1rem]">
						<button
						className="mt-[2rem] px-6 py-2 w-[12rem] font-medium  text-white capitalize transition-colors duration-300 transform bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80"
						onClick={generateQuestion}
						>
							Generate Questions
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TechSkillTable;
