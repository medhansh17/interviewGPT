import React, { useRef, useState } from "react";

interface TextAreaProps {
	mainData: {
		jd: string;
	} | null;
	setMainTextArea: any;
}

const TextArea: React.FC<TextAreaProps> = ({ mainData, setMainTextArea }) => {
	const [text, setText] = useState("");
	setMainTextArea(text);
	const initialJdValue = mainData?.jd || "";

	const fileInputRef = useRef(null);

	const handleBrowseClick = () => {
	  if (fileInputRef.current !== null && fileInputRef.current !== undefined) {
		(fileInputRef.current as HTMLInputElement).click();
	  }
	};
	return (
		<div>
			
			<div className="md:w-[35rem] lg:w-[40rem] xl:w-[45rem]  mt-6 2xl:w-[50rem] md:h-[15rem] mb-[4rem] ">
				<textarea style={{height:'300px'}}
					id="message"
					rows={15}
					required
					value={initialJdValue || text}
					className="text-[1rem] block p-2.5 w-full  text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					placeholder="Write Your Job Description...."
					onChange={(e) => setText(e.target.value)}
				/>
			</div>
		</div>
	);
};

export default TextArea;
