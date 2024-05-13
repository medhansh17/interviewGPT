import React, { useEffect, useState } from 'react'

const Success=()=>{


    return(
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-50 z-50">
    <div className="bg-white dark:bg-zinc-800 rounded-lg p-8 max-w-md">
        
        <h2 className="text-2xl font-bold text-center text-green-600 dark:text-green-400 mb-4">Successfully Completed!</h2>
        <p className="text-zinc-700 dark:text-zinc-300 text-center">Your task has been completed successfully.</p>
        {/* <button className="bg-green-500 text-white px-4 py-2 rounded-lg mt-4">Close</button> */}
    </div>
</div>
    )
}

export default Success;