import React, {useState} from 'react';

interface TextAreaProps {
    mainData: {
        jd: string;
    } | null;
}

const TextArea: React.FC<TextAreaProps> = ({ mainData }) => {
    const [text, useText] = useState("")
    const initialJdValue = mainData?.jd || '';
    console.log("datamain", initialJdValue)

    return (
        <div>
            <div className="md:w-[20rem] lg:w-[25rem] xl:w-[30rem]  mt-6 2xl:w-[30rem] md:h-[16.5rem] mb-[4rem] ">
                <textarea
                    id="message"
                    rows={15}
                    value={initialJdValue || text}
                    className="text-[3rem] block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Your message..."
                    onChange={(e) => useText(e.target.value)}
                ></textarea>

            </div>
        </div>
    );
};

export default TextArea;
