import React, { useEffect, useState } from "react";

interface TextAreaProps {
  mainData2: {
    jd: string;
  } | null;
  empty: boolean;
  setMainTextArea2: any;
  setEmpty: any;
}

const TextArea2: React.FC<TextAreaProps> = ({
  mainData2,
  setEmpty,
  setMainTextArea2,
  empty,
}) => {
  const [text, setText] = useState("");
  setMainTextArea2(text);
  const initialJdValue = mainData2?.jd || "";

  useEffect(() => {
    if (empty == true) {
      setMainTextArea2("");
      setText("");
      setEmpty(false);
    }
  }, [empty]);

  return (
    <div>
      <div className="md:w-[35rem] lg:w-[40rem] xl:w-[45rem]   2xl:w-[50rem] md:h-[15rem] mb-[4rem] ">
        <textarea
          style={{ height: "300px" }}
          id="message"
          rows={15}
          required
          value={initialJdValue || text}
          className="text-[1rem] block p-2.5 w-full  text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Write Your Job Description (max 500 and min 200 words)...."
          onChange={(e) => setText(e.target.value)}
        />
      </div>
    </div>
  );
};

export default TextArea2;
