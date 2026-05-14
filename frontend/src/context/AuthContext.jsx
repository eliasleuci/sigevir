import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (e) {
        console.error('Error parsing user from localStorage', e);
      }
    }
    setLoading(false);
  }, [token]);

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
  };

  const loginGoogle = async (credential) => {
    try {
      const response = await apiClient.post('/auth/google/signin', { idToken: credential });
      const { accessToken: jwtToken, user: userData } = response.data.data || response.data;
      login(userData, jwtToken);
      return { success: true };
    } catch (error) {
      console.error('Error in Google login:', error);
      return { success: false, error: error.response?.data?.error?.message || error.response?.data?.message || 'Error en autenticación' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete apiClient.defaults.headers.common['Authorization'];
    window.location.href = '/login';
  };

  // Refresh token
  const refreshToken = async () => {
    try {
      const response = await apiClient.post('/auth/refresh');
      const { accessToken: newToken, user: newUser } = response.data.data || response.data;
      login(newUser, newToken);
      return { token: newToken, user: newUser };
    } catch (err) {
      console.error('Refresh token failed', err);
      logout();
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        loginGoogle,
        logout,
        refreshToken,
        role: user?.rol || user?.role,
        institucion_id: user?.institucion_id || user?.institucionId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
