import React from 'react'
import Header from './Header'

const Dashboard = () => {
  return (
    <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white">
        <Header />
      <div className="container mx-auto mt-[-2rem] p-6" style={{paddingTop:0}}>
        <div className="mb-4">
          <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            A descriptive body text comes here
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
          <button className="bg-blue-500 text-white p-2 rounded-lg shadow">Add new JD</button>
        </div>
        </div>
        <div className="bg-white dark:bg-zinc-700 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-200 dark:bg-zinc-600">
              <tr>
                <th className="p-3 text-left">Job Title</th>
                <th className="p-3 text-left">Job Description</th>
                <th className="p-3 text-left">Active</th>
                <th className="p-3 text-left">Upload Resume</th>
                <th className="p-3 text-left">Action</th>
                {/* <th className="p-3 text-left">Edit</th> */}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b dark:border-zinc-600">
                <td className="p-3 font-bold ">Python Developer</td>
                <td className="p-3">Link</td>
                {/* <td className="p-3">Regular text column</td> */}
                {/* <td className="p-3">Regular text column</td> */}
                <td className="p-3">
                  <span className="bg-green-200 text-green-700 py-1 px-3 rounded-full text-xs">
                    Active
                  </span>
                </td>
                <td className="p-3">Resume</td>
                <td className="p-3 text-zinc-500 dark:text-zinc-400">
                  <button>⋮</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard