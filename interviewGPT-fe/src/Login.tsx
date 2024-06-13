import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import api from "./components/customAxios/Axios";
import { useToast } from "./components/toast";

const Login: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const res = await api.post("/login", {
        email: email,
        password: password,
      });
      if (res.statusText == "OK") {
        localStorage.clear();
        localStorage.setItem("authToken", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user_id));
        if (res.data.role === "bluetick-admin") {
          localStorage.setItem("role", "bluetick-admin");
        }
        navigate("/app");
      } else
        toast.error({
          title: "Error",
          description: res.data.message,
          duration: 5000,
          open: true,
          status: "error",
        });
    } catch (err) {
      toast.error({
        title: "Error",
        description: "Invalid Credentials!",
        duration: 5000,
        open: true,
        status: "error",
      });
    }
  };

  return (
    <div
      className="bg-gray-100 flex w-screen h-screen items-center justify-center p-4 flex-col"
      id="main-content"
    >
      <p className="sm:w-[93%] w-full mx-auto">
        <Header />
      </p>

      <div className="flex items-center justify-center h-screen w-[500px] bg-zinc-100 dark:bg-zinc-800">
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-zinc-700 rounded-lg shadow p-8 m-4  w-full"
        >
          <h2 className="text-2xl font-bold mb-8 text-center text-zinc-800 dark:text-white">
            Login
          </h2>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-zinc-700 dark:text-zinc-200 text-sm font-bold mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-zinc-700 dark:text-zinc-300 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Email"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-zinc-700 dark:text-zinc-200 text-sm font-bold mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-zinc-700 dark:text-zinc-300 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Password"
            />
          </div>
          <div className="mb-6 flex items-center justify-center">
            <Link
              to="/forget-password"
              className="  font-bold text-sm text-blue-500 hover:text-blue-800 dark:hover:text-blue-300 float-right mt-2"
            >
              Forgot password?
            </Link>
          </div>
          <div className="mb-8">
            <button
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Login
            </button>
          </div>
          <div className="text-center">
            <p className="text-zinc-600 dark:text-zinc-300 text-sm">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-500 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Signup
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
