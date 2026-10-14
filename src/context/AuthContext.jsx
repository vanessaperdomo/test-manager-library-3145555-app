import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [role, setRole] = useState(localStorage.getItem('user_role'));
  const [username, setUsername] = useState(localStorage.getItem('username') || '');

  const login = async (user, pass) => {
    const res = await api.login(user, pass);
    localStorage.setItem('access_token', res.access_token);
    localStorage.setItem('user_role', res.role);
    localStorage.setItem('username', user);
    setToken(res.access_token);
    setRole(res.role);
    setUsername(user);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
    setToken(null);
    setRole(null);
    setUsername('');
  };

  const isAuthenticated = !!token;
  const isAdmin = role === 'admin';
  const isLibrarian = role === 'librarian';

  return (
    <AuthContext.Provider value={{ token, role, username, isAuthenticated, isAdmin, isLibrarian, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
