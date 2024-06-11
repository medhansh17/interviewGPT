import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./components/customAxios/Axios";
import { useToast } from "./components/toast";

const Register: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Add your form submission logic here
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
      const res = await api.post("/register", {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      });

      if (res.status === 200) {
        navigate("/login");
        toast.success({
          title: "Verify Email",
          description: "An email has been sent for verification.",
          duration: 5000,
          open: true,
          status: "success",
        });
      } else if (res.status === 401) {
        toast.error({
          title: "Error",
          description: res.data.message,
          duration: 5000,
          open: true,
          status: "error",
        });
      }
    } catch (err: any) {
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
    <div className="bg-gray-100 flex h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="bg-white shadow-md rounded-md p-6">
          <h2 className="my-3 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign up for an account
          </h2>

          <form className="space-y-6" method="POST" onSubmit={handleSubmit}>
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
                  className="px-2 py-3 mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm"
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
                  className="px-2 py-3 mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm"
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
              <div className="mt-1">
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="px-2 py-3 mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm"
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
                  className="px-2 py-3 mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md border border-transparent bg-sky-400 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2"
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
  );
};

export default Register;
