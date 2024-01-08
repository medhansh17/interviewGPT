import React from 'react';

const ForgetPass: React.FC = () => {
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // Add your form submission logic here
    };

    const handleGoogleSignIn = () => {
        // Add logic for signing in with Google
    };

    const handleForgotPassword = () => {
        // Add logic for handling forgot password (e.g., show a modal, navigate to a reset password page, etc.)
    };

    return (
        <div className="bg-gray-100 flex h-screen items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white shadow-md rounded-md p-8">

                    {/* <img className="mx-auto h-12 w-auto" src="https://www.svgrepo.com/show/499664/user-happy.svg" alt="" /> */}

                    {/* <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                        Forget Password
                    </h2> */}

                    <form className="space-y-6 mt-4" action="#" method="POST" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
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
                            


                        </div>

                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md border border-transparent bg-sky-400 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2"
                            >
                                Send Email
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    );
};

export default ForgetPass;
