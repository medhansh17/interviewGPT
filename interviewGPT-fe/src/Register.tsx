import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./components/customAxios/Axios";
import { useToast } from "./components/toast";
import { useLoader } from "./context/loaderContext";
import Header from "./components/Header";

const Register: React.FC = () => {
  const { setLoading } = useLoader();
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error({
        title: "Error",
        description: "Passwords do not match.",
        duration: 5000,
        open: true,
        status: "error",
      });
      return;
    }
    try {
      setLoading(true);
      const res = await api.post("/register_guest", {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      });

      if (res.status === 200) {
        setLoading(false);
        navigate("/login");
        toast.success({
          title: "Verify Email",
          description: "An email has been sent for verification.",
          duration: 5000,
          open: true,
          status: "success",
        });
      } else if (res.status === 401) {
        setLoading(false);
        toast.error({
          title: "Error",
          description: res.data.message,
          duration: 5000,
          open: true,
          status: "error",
        });
      }
    } catch (err: any) {
      setLoading(false);
      console.log(err);
      toast.error({
        title: "Error",
        description: err.response?.data?.error || "An error occurred.",
        duration: 5000,
        open: true,
        status: "error",
      });
    }
  };

  return (
    <div className="bg-gray-100 h-screen">
      <p className="sm:w-[93%] w-full mx-auto max-w-[1400px]">
        <Header />
      </p>
      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 flex-col pt-4">
        <div className="w-full max-w-md space-y-6">
          <div className="bg-white shadow-md rounded-md p-4 pt-3">
            <h2 className="mb-3 text-center text-3xl font-semibold tracking-tight text-gray-900">
              Sign Up
            </h2>

            <form className="space-y-4" method="POST" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="first-name"
                  className="block text-sm font-medium text-gray-700"
                >
                  First Name
                </label>
                <div className="mt-1">
                  <input
                    onChange={(e) => setFirstName(e.target.value)}
                    name="first_name"
                    type="text"
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-zinc-700 dark:text-zinc-300 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="last-name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last Name
                </label>
                <div className="mt-1">
                  <input
                    onChange={(e) => setLastName(e.target.value)}
                    name="last_name"
                    type="text"
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-zinc-700 dark:text-zinc-300 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <div className="mt-1">
                  <input
                    onChange={(e) => setEmail(e.target.value)}
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-zinc-700 dark:text-zinc-300 leading-tight focus:outline-none focus:shadow-outline"
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
                <div className="mt-1">
                  <input
                    onChange={(e) => setPassword(e.target.value)}
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-zinc-700 dark:text-zinc-300 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    name="confirm_password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-zinc-700 dark:text-zinc-300 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none"
                >
                  Register
                </button>
              </div>
              <div className="text-center">
                <p className="text-zinc-600 dark:text-zinc-300 text-sm">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-blue-500 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    Login
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
