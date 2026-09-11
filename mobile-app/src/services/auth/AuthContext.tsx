import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '../api/apiClient';

export interface User {
  id: string;
  name: string;
  email?: string;
  mobile?: string;
  role: string;
  department?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: string | null;
  loading: boolean;
  requestOtp: (mobile: string) => Promise<any>;
  verifyOtp: (mobile: string, otp: string) => Promise<void>;
  signInWorker: (credential: string, password: string) => Promise<void>;
  signInAuthority: (credential: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('jansetu_token');
        const storedRole = await SecureStore.getItemAsync('jansetu_role');
        if (storedToken && storedRole) {
          setToken(storedToken);
          setRole(storedRole);
          
          // Attempt to fetch profile details using token
          const res: any = await apiClient.get('/auth/me');
          const payload = res?.data || res;
          if (payload?.user) {
            setUser(payload.user);
          } else {
            setUser({ id: 'restored-id', name: 'User', role: storedRole });
          }
        }
      } catch (err) {
        console.warn('[AUTH PROVIDER] Failed to restore session:', err);
        // Clear broken token
        await SecureStore.deleteItemAsync('jansetu_token');
        await SecureStore.deleteItemAsync('jansetu_role');
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const requestOtp = async (mobile: string) => {
    const res: any = await apiClient.post('/auth/citizen/otp/request', { mobile });
    return res?.data || res;
  };

  const verifyOtp = async (mobile: string, otp: string) => {
    const res: any = await apiClient.post('/auth/citizen/otp/verify', { mobile, otp });
    const payload = res?.data || res;
    if (payload.token) {
      await SecureStore.setItemAsync('jansetu_token', payload.token);
      await SecureStore.setItemAsync('jansetu_role', 'CITIZEN');
      setToken(payload.token);
      setRole('CITIZEN');
      setUser(payload.user);
    } else {
      throw new Error('Verification failed: No token returned.');
    }
  };

  const signInWorker = async (credential: string, password: string) => {
    const res: any = await apiClient.post('/auth/worker/login', { credential, password });
    const payload = res?.data || res;
    if (payload.token) {
      await SecureStore.setItemAsync('jansetu_token', payload.token);
      await SecureStore.setItemAsync('jansetu_role', 'WORKER');
      setToken(payload.token);
      setRole('WORKER');
      setUser(payload.user);
    } else {
      throw new Error('Worker login failed: No token returned.');
    }
  };

  const signInAuthority = async (credential: string, password: string) => {
    const res: any = await apiClient.post('/auth/authority/login', { credential, password });
    const payload = res?.data || res;
    if (payload.token) {
      await SecureStore.setItemAsync('jansetu_token', payload.token);
      await SecureStore.setItemAsync('jansetu_role', 'AUTHORITY');
      setToken(payload.token);
      setRole('AUTHORITY');
      setUser(payload.user);
    } else {
      throw new Error('Authority login failed: No token returned.');
    }
  };

  const signOut = async () => {
    try {
      await apiClient.post('/auth/logout', {});
    } catch (e) {}
    await SecureStore.deleteItemAsync('jansetu_token');
    await SecureStore.deleteItemAsync('jansetu_role');
    setToken(null);
    setRole(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        loading,
        requestOtp,
        verifyOtp,
        signInWorker,
        signInAuthority,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
