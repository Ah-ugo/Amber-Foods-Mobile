"use client";

import AsyncStorage from "@react-native-async-storage/async-storage";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { apiService, type User } from "../services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    full_name: string;
    phone: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  updateUserData: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("auth_token");
      if (storedToken) {
        setToken(storedToken);
        apiService.setToken(storedToken);
        const userProfile = await apiService.getProfile();
        setUser(userProfile);
      }
    } catch (error) {
      console.error("Error loading stored auth:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);
      formData.append("grant_type", "password");

      const response = await fetch(
        "https://amberfoods.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            username: email,
            password: password,
            grant_type: "password",
          }).toString(),
        }
      );

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      const { access_token } = data;

      await AsyncStorage.setItem("auth_token", access_token);
      setToken(access_token);
      apiService.setToken(access_token);

      const userProfile = await apiService.getProfile();
      setUser(userProfile);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    full_name: string;
    phone: string;
  }) => {
    try {
      await apiService.register(userData);
      await login(userData.email, userData.password);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
    apiService.setToken("");
  };

  const updateUserData = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, loading, updateUserData }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
