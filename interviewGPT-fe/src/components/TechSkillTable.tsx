import React, { useState } from "react";
import axios from "axios";
import { FetchSkillsData } from "@/types";

interface TechSkillTableProps {
	fetchSkill?: FetchSkillsData;
}

interface InputValues {
	[key: string]: {
		basic: number;
		intermediate: number;
		advance: number;
	};
}

const TechSkillTable: React.FC<TechSkillTableProps> = ({ fetchSkill }) => {
	const [inputValues, setInputValues] = useState(() => Object.fromEntries(
		(fetchSkill?.skills.technical_skills || []).map((skill) => [
			skill,
			{ basic: 1, intermediate: 1, advance: 1 },
		]),
	));

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
		try {
			const response = await axios.post(
				"https://coops-backend.bluetickconsultants.com:8000/fetch_skills",
				{
					technical_skills: [
						{
							"skill": "",
							"experience": "2-3 years",
							"num_basic": 2,
							"num_intermediate": 0,
							"num_advanced": 3
						}
					],
					name: "software"
				},
			);
		}
		catch (err) {
			console.error(err)
		}

	}
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
