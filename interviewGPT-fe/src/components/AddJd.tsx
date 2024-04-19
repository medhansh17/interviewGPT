import React, { useRef } from 'react'
import Header from './Header'
const AddJd = () => {
  const fileInputRef = useRef(null);

  const handleBrowseClick = () => {
    if (fileInputRef.current !== null && fileInputRef.current !== undefined) {
      (fileInputRef.current as HTMLInputElement).click();
    }
  };
  return (
    
      <div className="bg-white p-4 rounded-lg w-[48rem] shadow-md border my-4 border-zinc-300 shadow-sm w-full mx-auto my-8">
        
      <div className="border-dashed border-2 border-blue-200 rounded-lg p-4 mb-4">
        <h3 className="text-lg mb-2 font-semibold text-zinc-700">Add file(s)</h3>
        <p className="text-zinc-500 mb-3">Choose from computer</p>
        <input type='file' ref={fileInputRef} className="hidden"  />
        <button  onClick={handleBrowseClick} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300">
          Browse
        </button>
        <p className="text-xs text-zinc-400 mt-2">Preferred format: PDF</p>
      </div>
      <div className="flex items-center p-2 bg-blue-100 rounded-lg">
        <div className="flex-grow">
          <p className="text-blue-800 font-semibold">On-Boarding-Agreement.docx</p>
          <p className="text-xs text-blue-600">1 page</p>
        </div>
        <div className="text-blue-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 12H9m2 8l-2-2 2-2m-2-2l2-2 2 2"
            />
          </svg>
        </div>
      </div>
    </div>
        
        )
      }
      
  


export default AddJd