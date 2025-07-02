import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

axios.defaults.withCredentials = true;

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/auth/me`);
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const response = await axios.post(`${API_BASE}/auth/login`, { username, password });
    setUser(response.data.user);
  };

  const signup = async (data: any) => {
    const response = await axios.post(`${API_BASE}/auth/signup`, data);
    setUser(response.data.user);
  };

  const logout = async () => {
    await axios.post(`${API_BASE}/auth/logout`);
    setUser(null);
  };

  const forgotPassword = async (data: any) => {
    await axios.post(`${API_BASE}/auth/forgot-password`, data);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, forgotPassword }}>
      {children}
    </AuthContext.Provider>
  );
};