import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

export const ROLES = {
  CITIZEN: 'CITIZEN',
  AUTHORITY: 'AUTHORITY',
  DEPARTMENT_ADMIN: 'DEPARTMENT_ADMIN',
  WORKER: 'WORKER'
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      setLoading(true);
      try {
        const u = await authApi.getCurrentUser();
        if (u) {
          setUser(u);
        }
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = (userData, token) => {
    if (token) localStorage.setItem('janawaaz_token', token);
    if (userData.role) localStorage.setItem('janawaaz_role', userData.role);
    setUser(userData);
  };

  const logout = async () => {
    const currentRole = user?.role || localStorage.getItem('janawaaz_role') || localStorage.getItem('janawaaz_role');
    await authApi.logout();
    setUser(null);
    if (currentRole === 'WORKER') {
      window.location.hash = '/worker/login';
    } else {
      window.location.hash = '/authority/login';
    }
  };

  const role = user?.role || localStorage.getItem('janawaaz_role') || localStorage.getItem('janawaaz_role') || 'CITIZEN';

  const loginWithToken = (token, userData) => {
    if (token) localStorage.setItem('janawaaz_token', token);
    if (userData?.role) localStorage.setItem('janawaaz_role', userData.role);
    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        loading,
        login,
        loginWithToken,
        logout
      }}
    >
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
