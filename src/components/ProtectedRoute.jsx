import { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import api from "../api/axios";

function ProtectedRoute({ role }) {
  const [isAuth, setAuth] = useState(null); // null = loading

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = Cookies.get("token");

        
        if (!token) {
          setAuth(false);
          return;
        }
        

        
        const res = await api.get("/auth/users/me");
        if (role && res.data.role !== role) {
          setAuth(false);
        } else {
          setAuth(true);
        }

      } catch (err) {
        setAuth(false);
      }
    };

    checkAuth();
  }, [role]);

  if (isAuth === null) {
    return <div>Loading...</div>;
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;