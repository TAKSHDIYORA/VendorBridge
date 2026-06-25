// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Centralize your base URL so it's easy to change later when you deploy
const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL;
// 1. Create the Context
const AuthContext = createContext();

// 2. Create the Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app load
  useEffect(() => {
    const storedUser = localStorage.getItem('vendorBridgeUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

 
 const login = async (email, password) => {
  try {
    // 1. Send credentials to Spring Boot
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password
    });

    // 2. Extract the response (Your backend returns { token, email, role })
    const userData = response.data;

    // 3. Update React State and LocalStorage
    setUser(userData);
    localStorage.setItem('vendorBridgeUser', JSON.stringify(userData));
    
    return userData;

  } catch (error) {
    // Check if the backend sent our custom message (e.g., "Wrong password")
    console.log(error.response);
      
    if (error.response && error.response.data) {
        throw new Error(error.response.data);
    } else {
        // Fallback if the server is completely unreachable
        throw new Error("Unable to connect to the server. Please try again.");
    }
  }
};


  const register = async (vendorData) => {
  try {
    // The payload here will include email, password, firstName, lastName, phone, and role: 'VENDOR'
    const response = await axios.post(`${API_BASE_URL}/auth/register/vendor`, vendorData);
    
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data || 'Failed to register vendor.';
    throw new Error(errorMessage);
  }
};


  // LOGOUT FUNCTION
  const logout = () => {
    setUser(null);
    localStorage.removeItem('vendorBridgeUser');
    window.location.href = '/'; // Forces a hard reload back to the login screen
};
  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 3. Custom hook to use the context easily in any file
export const useAuth = () => {
  return useContext(AuthContext);
};