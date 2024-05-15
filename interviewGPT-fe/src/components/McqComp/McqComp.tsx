import React from "react";

const McqComp = () => {
  return (
    <div className="max-w-lg mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Question 4</h2>
      <p className="mb-4">
        Which of the following acronyms represents the process by which
        undefined from multiple source systems is consolidated into a single
        undefined warehouse?
      </p>
      <form> 
        <div className="mb-2 border p-2 rounded">
          <label className="block">
            <input type="radio" name="question" value="ARPU" className="mr-2" />
            a) ARPU
          </label>
        </div>
        <div className="mb-2 border p-2 rounded">
          <label className="block">
            <input type="radio" name="question" value="ETL" className="mr-2" />
            b) ETL
          </label>
        </div>
        <div className="mb-2 border p-2 rounded">
          <label className="block">
            <input type="radio" name="question" value="OLAP" className="mr-2" />
            c) OLAP
          </label>
        </div>
        <div className="mb-4 border p-2 rounded">
          <label className="block">
            <input type="radio" name="question" value="SQL" className="mr-2" />
            d) SQL
          </label>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default McqComp;
