import { Navigate, Outlet } from "react-router-dom";

const PrivateRoutes = () => {
  let auth = localStorage.getItem("authToken");
  let name = localStorage.getItem("name");
  let user = localStorage.getItem("user");

  return auth && name && user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoutes;
