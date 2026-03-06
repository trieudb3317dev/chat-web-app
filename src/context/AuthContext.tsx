"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../apis/client";

type User = {
  id: number;
  username: string;
  email: string;
  full_name: string;
  address: string;
  phone_number: string;
  date_of_birth: string;
  gender: string;
  role: string | null;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadMe = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.me();
      // assume res contains user object
      setUser(res || null);
    } catch (e: any) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // on mount, try to fetch current user (will attempt refresh if access expired)
    loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.loginUser({ username, password });
      // login sets cookies; now fetch profile
      const meData = await api.me();
      setUser(meData);
      router.push("/chat");
    } catch (e: any) {
      setError(e?.message ?? "Sign in failed");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.registerUser({ name, email, password });
      // attempt login after register
      await api.loginUser({ username: name, password });
      const meData = await api.me();
      setUser(meData);
      router.push("/chat");
    } catch (e: any) {
      setError(e?.message ?? "Sign up failed");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await api.logoutUser();
    } catch (e) {
      // ignore errors
    }
    router.push("/sign-in");
    setUser(null);
  };

  const refresh = async () => {
    try {
      await api.refreshToken();
      const meData = await api.me();
      setUser(meData);
    } catch (e) {
      setUser(null);
      throw e;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, signIn, signUp, signOut, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
