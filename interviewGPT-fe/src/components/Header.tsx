import { Link, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const Header = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="flex justify-between items-center py-2 max-w-[1400px] mx-auto pt-4 mb-2">
      <Link to="/">
        <div className="flex justify-center items-center">
          <img
            src="./assets/InterviewGPT-logo.png"
            alt="logo"
            className="w-[300px]"
          />
        </div>
      </Link>

      <li
        className={`group max-lg:border-b mt-[-1rem] w-[200px] relative list-none ${
          pathname === "/login" ||
          pathname === "/register" ||
          pathname == "/register-admin"
            ? "hidden"
            : "block"
        }`}
      >
        <div className="hover:text-[#007bff] hover:fill-[#007bff] text-gray-600 font-semibold text-[16px] block">
          {localStorage.getItem("name") || "User"}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16px"
            height="16px"
            className="ml-1 inline-block"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 16a1 1 0 0 1-.71-.29l-6-6a1 1 0 0 1 1.42-1.42l5.29 5.3 5.29-5.29a1 1 0 0 1 1.41 1.41l-6 6a1 1 0 0 1-.7.29z"
              data-name="16"
              data-original="#000000"
            />
          </svg>
        </div>
        <ul className="absolute top-6 max-lg:top-8 left-[-50px] z-50 block space-y-2 shadow-lg bg-white max-h-0 overflow-hidden min-w-[250px] group-hover:opacity-100 group-hover:max-h-[700px] px-6 group-hover:pb-4 transition-all duration-500">
          <li className="border-b py-3">
            <Link
              to="/"
              className="hover:text-red-600 hover:fill-red-600 text-gray-600 font-semibold text-[15px] block"
            >
              Home
            </Link>
          </li>
          <li className="py-3">
            <div
              onClick={handleLogout}
              className="hover:text-red-600 hover:fill-red-600 text-gray-600 font-semibold text-[15px] block"
            >
              Log Out
            </div>
          </li>
        </ul>
      </li>
    </div>
  );
};

export default Header;
