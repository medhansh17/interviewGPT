import React, { useState } from 'react'
import Header from './Header'

import { useNavigate } from 'react-router-dom'

const RespJdDash = () => {

const Data=[
    {
        name:"hars",
        skills_missing:"abc,dcs",
        skills_matching:"abc,dcs",
        id:1
    },
    {
        name:"hars",
        skills_missing:"abc,dcs",
        skills_matching:"abc,dcs",
        id:2
    },
    {
        name:"hars",
        skills_missing:"abc,dcs",
        skills_matching:"abc,dcs",
        id:3
    },
    {
        name:"hars",
        skills_missing:"abc,dcs",
        skills_matching:"abc,dcs",
        id:4
    },
    {
        name:"hars",
        skills_missing:"abc,dcs",
        skills_matching:"abc,dcs",
        id:5
    },
    {
        name:"hars",
        skills_missing:"abc,dcs",
        skills_matching:"abc,dcs",
        id:6
    },
    {
        name:"hars",
        skills_missing:"abc,dcs",
        skills_matching:"abc,dcs",
        id:7
    },
    {
        name:"hars",
        skills_missing:"abc,dcs",
        skills_matching:"abc,dcs",
        id:8
    },
    {
        name:"hars",
        skills_missing:"abc,dcs",
        skills_matching:"abc,dcs",
        id:9
    },
    {
        name:"hars",
        skills_missing:"abc,dcs",
        skills_matching:"abc,dcs",
        id:10
    },
]

// Sample data (replace with actual data fetching logic)
const [jobsData, setJobsData] = useState(Data); // Your data array
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 5; // Number of items per page
  const navigate=useNavigate();

   // Calculate total number of pages
   const totalPages = Math.ceil(jobsData.length / itemsPerPage);

   // Pagination logic
   const handlePageChange = (page:any) => {
     setCurrentPage(page);
   };
 
   // Get current jobs for the current page
   const indexOfLastItem = currentPage * itemsPerPage;
   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
   const currentJobs = jobsData.slice(indexOfFirstItem, indexOfLastItem);
  return (
    <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white">
        <p className='w-[93%] mx-auto'><Header /></p>
      <div className="container mx-auto mt-[-2rem] p-6" style={{paddingTop:0}}>
        <div className="mb-4">
          <h1 className="text-2xl font-semibold mb-1">Role</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            JOB DESCRIPTION
          </p>
        </div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <button className="bg-white dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 p-2 rounded-lg shadow">
              Delete
            </button>
            <button className="bg-white dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 p-2 rounded-lg shadow">
              Filters
            </button>
            {/* <button className="bg-white dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 p-2 rounded-lg shadow">
              Export
            </button> */}
          </div >
          <div className='flex gap-[2rem]'>
          <div className="flex w-[19rem] items-center bg-zinc-200 dark:bg-zinc-800 rounded-lg " style={{padding:"0 0 0 5px"}}>
            <input type="text" placeholder="Search..." className="bg-transparent focus:outline-none dark:text-white flex-1"/>
            <button className="bg-blue-500 text-white p-2 rounded-lg ml-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-5-5m2-2a8 8 0 10-16 0 8 8 0 0016 0z" />
                </svg>
            </button>
        </div>
          <button className="bg-blue-500 text-white p-2 rounded-lg shadow" onClick={()=>navigate("/app")} >Add new JD</button>
        </div>
        </div>
        <div className="bg-white dark:bg-zinc-700 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-200 dark:bg-zinc-600">
              <tr>
                <th className="p-3 text-left">Candidates</th>
                <th className="p-3 text-left">Skills Matching</th>
                <th className="p-3 text-left">Skills Missing</th>
                <th className="p-3 text-left">Score</th>
                <th className="p-3 text-left">Action</th>
                {/* <th className="p-3 text-left">Edit</th> */}
              </tr>
            </thead>
            <tbody>
                {
            currentJobs.map((item:any)=>{
                    return(
               <tr className="border-b dark:border-zinc-600" key={item.id}>
                <td className="p-3 font-bold ">{item.name}</td>
                <td className="p-3">Link</td>
                {/* <td className="p-3">Regular text column</td> */}
                {/* <td className="p-3">Regular text column</td> */}
                <td className="p-3">
                  <span className="bg-green-200 text-green-700 py-1 px-3 rounded-full text-xs">
                    Active
                  </span>
                </td>
                <td className="p-3">Add</td>
                <td className="p-3 text-zinc-500 dark:text-zinc-400">
                  <button>⋮</button>
                </td>
              </tr>
                    )
                })  
                }
              
            </tbody>
          </table>
          {/* Pagination */}
        <div className="flex justify-center mt-4">
          <nav>
            <ul className="pagination">
              {Array.from({ length: totalPages }, (_, i) => (
                <li
                  key={i}
                  className={`page-item ${
                    currentPage === i + 1 ? 'active' : ''
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        </div>
      </div>
    </div>
  )
}

export default RespJdDash