import React, { useState } from "react";
import { Link,useNavigate } from "react-router-dom";

import api from './components/customAxios/Axios';

const Login: React.FC = () => {
  const navigate=useNavigate();
  const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

  const handleSubmit =async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
   
    try {
      console.log(email,password)
      const res = await api.post("/login", {'email':email,'password':password});
      
      if(res.statusText=="OK"){
        navigate('/app')
      }else alert(res.data.message)
     
    } catch (err) {
      
      
    }
  };

  const handleGoogleSignIn = () => {
    // Add logic for signing in with Google
  };

  const handleForgotPassword = () => {
    // Add logic for handling forgot password (e.g., show a modal, navigate to a reset password page, etc.)
  };

  return (
    <div className="bg-gray-100 flex h-screen items-center justify-center p-4">
      {/* <div className="w-full max-w-md">
        <div className="bg-white shadow-md rounded-md p-8">
         

          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>

          <form
            className="space-y-6 mt-4"
            action="#"
            method="POST"
            onSubmit={handleSubmit}
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <div className="mt-1">
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="px-2 py-3 mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1 flex items-center justify-between">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="password"
                  required
                  className="px-2 py-3 mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm"
                />
              </div>
              <div className="flex justify-end mt-[0.3rem]">
                <a href="#/forget-password">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-sky-500 hover:underline focus:outline-none"
                  >
                    Forgot Password?
                  </button>
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md border border-transparent bg-sky-400 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2"
              >
                Sign In
              </button>
            </div>
          </form>

          <div className="mt-4">
            <button
              onClick={handleGoogleSignIn}
              className="flex w-full justify-center rounded-md border border-transparent bg-red-500 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Sign In with Google
            </button>
          </div>
        </div>
      </div> */}
      <div className="flex items-center justify-center h-screen w-[500px] bg-zinc-100 dark:bg-zinc-800">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-700 rounded-lg shadow p-8 m-4  w-full">
            <h2 className="text-2xl font-bold mb-8 text-center text-zinc-800 dark:text-white">Login</h2>
            <div className="mb-4">
              <label htmlFor="email" className="block text-zinc-700 dark:text-zinc-200 text-sm font-bold mb-2">Email</label>
              <input type="email" id="email" onChange={(e)=>setEmail(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-zinc-700 dark:text-zinc-300 leading-tight focus:outline-none focus:shadow-outline" placeholder="Email"/>
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-zinc-700 dark:text-zinc-200 text-sm font-bold mb-2">Password</label>
              <input type="password" id="password" onChange={(e)=>setPassword(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-zinc-700 dark:text-zinc-300 leading-tight focus:outline-none focus:shadow-outline" placeholder="Password"/>
              
            </div>
            <div className="mb-6 flex items-center justify-center">
            <Link to="/forget-password" className="  font-bold text-sm text-blue-500 hover:text-blue-800 dark:hover:text-blue-300 float-right mt-2">Forgot password?</Link>
            </div>
            <div className="mb-8">
              <button className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type='submit'>Login</button>
            </div>
            <div className="text-center">
              <p className="text-zinc-600 dark:text-zinc-300 text-sm">Don't have an account? <Link to="/register" className="text-blue-500 hover:text-blue-800 dark:hover:text-blue-300">Signup</Link></p>
            </div>
            {/* <div className="flex items-center justify-between my-8">
              <hr className="w-full bg-zinc-300" style={{height:'1px', border:'none'}}/>
              <span className="p-2 text-zinc-400 dark:text-zinc-500 bg-white dark:bg-zinc-700">Or</span>
              <hr className="w-full bg-zinc-300" style={{height:'1px', border:'none'}}/>
            </div> */}
            {/* <div>
              <button className="w-full mb-4 bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                <img src="https://placehold.co/20x20" alt="Facebook" className="inline mr-2"/> Login with Facebook
              </button>
              <button className="w-full bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                <img src="https://placehold.co/20x20" alt="Google" className="inline mr-2"/> Login with Google
              </button>
      </div> */}
      </form>          
    </div>
    </div>
  );
};

export default Login;
