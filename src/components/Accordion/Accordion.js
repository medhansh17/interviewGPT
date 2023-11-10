import React, { useEffect, useRef, useState } from "react";

import "./accordion.scss";

import {AiOutlineCheckCircle, AiOutlineCloseCircle, AiOutlineQuestionCircle} from "react-icons/ai"
import { BsSkipForward } from "react-icons/bs";
import { MdGppMaybe } from "react-icons/md";

function Accordion(props) {
  const [active, setActive] = useState(false);
  const content = useRef(null);
  const [height, setHeight] = useState("0px");
  const [selectedOption, setSelectedOption] = useState("");

  useEffect(() => {
    console.log("Height for ", props.title, ": ", height);
  }, [height]);

  function toggleAccordion() {
    setActive(!active);
    setHeight(active ? "0px" : `${content.current.scrollHeight}px`);
  }

  const stopEventBubling = (e, val) => {
    e.stopPropagation()
    setSelectedOption(val);
  }
  

  return (
    <div className="accordion__section">
      <div
        className={`accordion ${active ? "active" : ""}`}
        onClick={toggleAccordion}
      >
        <p className="accordion__title">{props.title}</p>
        <div
          style={{ marginLeft: "20px" }}
          className="accordion-buttonsContainer"
        >
          <AiOutlineCheckCircle
            title="Correct"
            className={`accordion-buttonsContainer-button accordion-buttonsContainer-button-green ${
              selectedOption === "c" &&
              "accordion-buttonsContainer-button-green-active"
            }`}
            onClick={(e)=>stopEventBubling(e, "c")}
          />
          <MdGppMaybe
            title="Partially Right"
            className={`accordion-buttonsContainer-button accordion-buttonsContainer-button-orange ${
                selectedOption === "pc" &&
                "accordion-buttonsContainer-button-orange-active"
              }`}
              onClick={(e)=>stopEventBubling(e, "pc")}
          />
          <AiOutlineCloseCircle
            title="Wrong"
            className={`accordion-buttonsContainer-button accordion-buttonsContainer-button-red ${
                selectedOption === "w" &&
                "accordion-buttonsContainer-button-red-active"
              }`}
              onClick={(e)=>stopEventBubling(e, "w")}
          />
          <BsSkipForward
            title="Skip"
            className={`accordion-buttonsContainer-button accordion-buttonsContainer-button-gray ${
                selectedOption === "sk" &&
                "accordion-buttonsContainer-button-gray-active"
              }`}
            onClick={(e)=>stopEventBubling(e, "sk")}
          />
        </div>
      </div>
      <div
        ref={content}
        style={{ maxHeight: `${height}` }}
        className="accordion__content"
      >
        <div
          className="accordion__text"
          dangerouslySetInnerHTML={{ __html: props.content }}
        />
      </div>
    </div>
  );
}

export default Accordion;
