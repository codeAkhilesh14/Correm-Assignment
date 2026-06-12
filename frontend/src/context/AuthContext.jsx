import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("correm_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem("correm_token");
      if (savedToken) {
        try {
          api.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
          const response = await api.get("/auth/me");
          setUser(response.data);
        } catch (error) {
          console.error("Token verification failed", error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { user: userData, token: jwtToken } = response.data;
      
      localStorage.setItem("correm_token", jwtToken);
      localStorage.setItem("correm_user", JSON.stringify(userData));
      setToken(jwtToken);
      setUser(userData);
      
      return userData;
    } catch (error) {
      throw error.response?.data?.detail || "Login failed. Please try again.";
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post("/auth/register", { name, email, password });
      const { user: userData, token: jwtToken } = response.data;
      
      localStorage.setItem("correm_token", jwtToken);
      localStorage.setItem("correm_user", JSON.stringify(userData));
      setToken(jwtToken);
      setUser(userData);
      
      return userData;
    } catch (error) {
      throw error.response?.data?.detail || "Registration failed. Please try again.";
    }
  };

  const logout = () => {
    localStorage.removeItem("correm_token");
    localStorage.removeItem("correm_user");
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
  };

  const forgotPassword = async (email) => {
    try {
      await api.post("/auth/forgot-password", { email });
    } catch (error) {
      throw error.response?.data?.detail || "Failed to process request.";
    }
  };

  const resetPassword = async (email, password) => {
    try {
      await api.post("/auth/reset-password", { email, password });
    } catch (error) {
      throw error.response?.data?.detail || "Failed to reset password.";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
