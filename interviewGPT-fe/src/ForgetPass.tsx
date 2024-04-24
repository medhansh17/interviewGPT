import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from './components/customAxios/Axios';
const ForgetPass: React.FC = () => {

  const navigate=useNavigate();
  const [email, setEmail] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Add your form submission logic here
    try {
      console.log(email)
      const res = await api.post("/forgot_password", {'email':email});
      
      console.log(res)
     
      // navigate("/app")
    } catch (err) {
      
      
    }
  };

  return (
    // <div className="bg-gray-100 flex h-screen items-center justify-center p-4">
    //   <div className="w-full max-w-md">
    //     <div className="bg-white shadow-md rounded-md p-8">
    //       {/* <img className="mx-auto h-12 w-auto" src="https://www.svgrepo.com/show/499664/user-happy.svg" alt="" /> */}

    //       {/* <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
    //                     Forget Password
    //                 </h2> */}

    //       <form
    //         className="space-y-6 mt-4"
    //         action="#"
    //         method="POST"
    //         onSubmit={handleSubmit}
    //       >
    //         <div>
    //           <label
    //             htmlFor="email"
    //             className="block text-sm font-medium text-gray-700"
    //           >
    //             Email
    //           </label>
    //           <div className="mt-1">
    //             <input
    //               name="email"
    //               type="email"
    //               autoComplete="email"
    //               required
    //               className="px-2 py-3 mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm"
    //             />
    //           </div>
    //         </div>

    //         <div></div>

    //         <div>
    //           <button
    //             type="submit"
    //             className="flex w-full justify-center rounded-md border border-transparent bg-sky-400 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2"
    //           >
    //             Send Email
    //           </button>
    //         </div>
    //       </form>
    //     </div>
    //   </div>
    // </div>
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
    <div className="max-w-md w-full p-6 bg-white dark:bg-zinc-700 rounded-lg shadow-md">
        <h2 className="text-2xl text-center font-semibold mb-6">Forgot Password</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Enter your email address to reset your password</p>
        <form className="mb-4" onSubmit={handleSubmit}>
            <input type="email" placeholder="Email" onChange={(e)=>setEmail(e.target.value)} className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring focus:ring-blue-400 dark:focus:ring-blue-600 dark:bg-zinc-600"/>
            <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded-md mt-4 hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-400 dark:focus:ring-blue-600">Reset Password</button>
        </form>
        <p className="text-sm text-center text-zinc-600 dark:text-zinc-400">Remember your password? <Link to="/login" className="text-blue-500 dark:text-blue-400 hover:underline">Login</Link></p>
    </div>
</div>

  );
};

export default ForgetPass;
