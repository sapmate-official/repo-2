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
    // 1-Click Instant Login for Phone Web App (via scanned QR code or shared link)
    let quickToken: string | null = null;
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        quickToken = params.get('auth') || params.get('token') || params.get('mobile_token');
        if (quickToken) {
          setAuthToken(quickToken);
          const cleanUrl = window.location.pathname + window.location.hash;
          window.history.replaceState({}, document.title, cleanUrl);
        }
      }
    } catch (e) {
      console.warn('Could not parse mobile auth params:', e);
    }

    const token = quickToken || getAuthToken();
    if (token) {
      api.getProfile()
        .then((prof: any) => {
          setProfile(prof);
          setUser({
            username: prof.username,
            id: prof.id,
            role: prof.role || 'admin',
            staff_id: prof.staff_id || null,
            employee: prof.employee || null,
          });
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
    const p = res.profile;
    setUser({
      username: p.username,
      id: p.id,
      role: p.role || 'admin',
      staff_id: p.staff_id || null,
      employee: p.employee || null,
    });
    setProfile(p);
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
    if (user) {
      setUser((prev: any) => ({
        ...prev,
        ...updated,
      }));
    }
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
