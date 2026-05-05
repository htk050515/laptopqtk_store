import React, { createContext, useState, useContext, useEffect } from "react";
import { clearLS, getAccessTokenFromLS, setAccessTokenToLS, setProfileToLS } from "../utils/auth";
import userApi from "../api/UserApi/userApi";
import publicApi from "../api/PublicApi/publicApi";
import { useNavigate } from "react-router-dom";
import path from "../constants/path";
import Swal from "sweetalert2";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const access_token = getAccessTokenFromLS();
  const navigate = useNavigate();

  useEffect(() => {
    if (access_token) {
      userApi.getMe(access_token)
        .then((response) => {
          setUser(response.data.user);
        })
        .catch(() => {
          clearLS();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const response = await publicApi.login(credentials);
      setAccessTokenToLS(response.data.access_token);
      setUser(response.data.user);
      setProfileToLS(response.data.user);
      return { success: true, status: response.status, user: response.data.user };
    } catch (error) {
      return { success: false, status: error.response?.status || 500, error: error.message };
    }
  };


  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    setProfileToLS(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
