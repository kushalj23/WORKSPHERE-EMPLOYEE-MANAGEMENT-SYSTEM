import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = 'http://localhost:8080/api/v1';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refreshToken'));
  const [loading, setLoading] = useState(true);

  // Set default auth header
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  useEffect(() => {
    // Interceptor to handle expired tokens and retry requests
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry && refreshToken) {
          originalRequest._retry = true;
          try {
            const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
            const newToken = res.data.token;
            
            localStorage.setItem('token', newToken);
            setToken(newToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            
            return axios(originalRequest);
          } catch (refreshError) {
            // Refresh token expired or invalid, log out
            logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    setLoading(false);

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [refreshToken]);

  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    const { token: newToken, refreshToken: newRefreshToken, role, employeeId, employeeName, id } = res.data;
    
    const loggedUser = { id, email, role, employeeId, name: employeeName };
    
    localStorage.setItem('token', newToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    localStorage.setItem('user', JSON.stringify(loggedUser));
    
    setToken(newToken);
    setRefreshToken(newRefreshToken);
    setUser(loggedUser);
    
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const register = async (email, password, firstName, lastName, employeeCode, role) => {
    await axios.post(`${API_URL}/auth/register`, {
      email,
      password,
      firstName,
      lastName,
      employeeCode,
      role
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    
    delete axios.defaults.headers.common['Authorization'];
  };

  const changePassword = async (currentPassword, newPassword) => {
    await axios.post(`${API_URL}/auth/change-password`, {
      currentPassword,
      newPassword
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
