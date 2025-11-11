import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api/axios";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          // Verify token is valid by fetching user profile
          const { data } = await api.get("/auth/me");
          setAuth({ token, user: data, role: decoded.role });
        } catch (error) {
          console.error("Token invalid or expired", error);
          localStorage.removeItem("token");
          setAuth({});
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = (data) => {
    localStorage.setItem("token", data.token);
    // Decode token to get role immediately
    const decoded = jwtDecode(data.token);
    setAuth({ token: data.token, user: data, role: decoded.role });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuth({});
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
