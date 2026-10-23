"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getAuthToken, setAuthToken } from '../lib/api';

interface AuthContextType {
  user: any;
  profile: any;
  loading: boolean;
  login: (username: string, password: string) => Promise<any>;
  logout: () => void;
  updateProfileData: (newProfile: any) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      api.getProfile()
        .then((prof: any) => {
          setProfile(prof);
          setUser({ username: prof.username, id: prof.id });
        })
        .catch(() => {
          setAuthToken(null);
          setUser(null);
          setProfile(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    const res = await api.login(username, password);
    setAuthToken(res.token);
    setUser({ username: res.profile.username, id: res.profile.id });
    setProfile(res.profile);
    return res;
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setProfile(null);
  };

  const updateProfileData = async (newProfile: any) => {
    const updated = await api.updateProfile(newProfile);
    setProfile(updated);
    return updated;
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, updateProfileData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

