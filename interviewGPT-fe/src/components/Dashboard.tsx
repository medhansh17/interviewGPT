import React, { useEffect, useState } from 'react'
import Header from './Header'

import { useNavigate } from 'react-router-dom';
import api from './customAxios/Axios';
import axios from 'axios';

interface DataItem {
  id: number;
  jd: string;
  role: string;
}

const Dashboard = () => {
 const [Data,setData]=useState<DataItem | null>(null);
  const [row,setRow]=useState<any | number>(0)
  
  const [action,setAction]=useState(false);
  const [rowAction,setRowAction]=useState<any | number>(0)
  const [file,setFile]=useState<any | null>(null);
  const navigate=useNavigate();
  
useEffect(()=>{
    const getJobList=async()=>{
      try{
      const response=await api.get("/export_jobs_json");
      setData(response.data)
      }catch(error:any){
        console.log(error)
      }
    }
    getJobList()
},[])
  const addResume = async (item: { jd: string, role: string }) => {
    if (!file) {
      // Handle case where no file is selected
      return;
    }

    const newResume = new FormData();
    newResume.append("resume", file);
    newResume.append("jd", item.jd);
    newResume.append("role", item.role);

    try {
      const response = await axios.post("http://127.0.0.1:8000/upload_resume", 
        newResume
      );

      if (response.statusText === 'OK') {
        alert("Successfully added");
      }
      
      console.log("Response:", response);
    } catch (error) {
      console.error("Error uploading resume:", error);
      // Handle error and display appropriate message
    }
  };

  const otherActions=(id:number)=>{
    setAction(!action);
    setRowAction(id)
  }
 
  return (
    <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white" style={{backgroundColor:"#fff"}}>
        <p className='w-[93%] mx-auto'><Header /></p>
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
          <button className="bg-blue-500 text-white p-2 rounded-lg shadow" onClick={()=>navigate("/app")} >Add new JD</button>
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
              {
                Data?.map((item:any)=>{
                  return(
<tr className="border-b dark:border-zinc-600" key={item.id}>
                <td className="p-3 font-bold " onClick={()=>navigate("/respective-dashboard")}>{item.role}</td>
                <td className="p-3 "><p className='desc'>{item.jd}</p></td>
                {/* <td className="p-3">Regular text column</td> */}
                {/* <td className="p-3">Regular text column</td> */}
                <td className="p-3">
                  <span className="bg-green-200 text-green-700 py-1 px-3 rounded-full text-xs">
                    Active
                  </span>
                </td>
                <td className="p-3">
  <label htmlFor={`file-input-${item.id}`} className={`custom-file-label ${(row===item.id && file )?'cfl2':'cfl'}`}>
    {(row===item.id && file )?'Selected':'Select Resume'}
  </label>
  <input
    id={`file-input-${item.id}`}
    className="custom-file-input"
    type="file"
    onChange={(e) => setFile(e.target.files[0])}
    onClick={() => setRow(item.id)}
  />
  {file && row === item.id && <span onClick={()=>addResume(item)} className={`custom-file-label ${(row===item.id && file )?'cfl3':''}`}>Upload</span>}
</td>
                {/* <td className="p-3">
  <input type="file" onChange={(e) => setFile(e.target.files[0])} onClick={()=>setRow(item.id)}/>
  {file && row==item.id && <span>done</span>}
</td> */}
                <td className="p-3 text-zinc-500 dark:text-zinc-400 relative">
  <button onClick={() => otherActions(item.id)}>⋮</button>
  {rowAction === item.id && action && (
    <div className="absolute bg-white dark:bg-zinc-700 rounded-lg shadow p-2 other-container">
      <p className='other-options-div ood cursor'>Delete</p>
      <p className='other-options-div'>Edit</p>
    </div>
  )}
</td>
              </tr>
                  )
                })
              }
              
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard