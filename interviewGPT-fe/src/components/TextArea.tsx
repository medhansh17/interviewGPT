import React from 'react';

interface TextAreaProps {
    mainData: {
        jd: string;
    } | null;
}

const TextArea: React.FC<TextAreaProps> = ({ mainData }) => {
    const initialJdValue = mainData?.jd || '';
    console.log("datamain", initialJdValue)

    return (
        <div>
            <div className="max-w-2xl  mt-6 md:w-[50rem] md:h-[16.5rem] mb-[4rem] ">
                <textarea
                    id="message"
                    rows={15}
                    value={initialJdValue}
                    readOnly
                    className="text-[3rem] block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Your message..."
                ></textarea>

            </div>
        </div>
    );
};

export default TextArea;
