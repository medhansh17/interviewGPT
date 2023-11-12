import * as React from "react";
import "./App.scss";
import Accordion from "./components/Accordion/Accordion";
import data from "./data.json";

function App() {
  return (
    <div className="Container">
      <div className="Container-header">
        <img
          src="blueticklogo.png"
          className="Container-header-logo"
          alt="logo"
        />
      </div>
      <div className="Container-cards">
        {/* card 1 */}
        <div className="Container-cards-card1">
          <textarea
            placeholder="Input job Description"
            className="Container-cards-card1-textInput"
          />
          <button className="Container-cards-card1-inputButton">Submit</button>
        </div>

        {/* card 2 */}
        <div className="Container-cards-card2">
          {data.categories.map((categorie) => {
            return (
              <div>
                <span>{categorie.name}</span>
                {categorie.questions.map((data, idx) => {
                  return (
                    <Accordion
                      title={data.question}
                      content={data.answer}
                      key={idx}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
