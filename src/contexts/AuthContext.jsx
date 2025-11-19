import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../utils/api";

const AuthContext = createContext(null);

const SESSION_STORAGE_KEY = "law_office_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // First check session storage
      const storedUser = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Verify with backend that session is still valid
        const currentUser = await authAPI.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentUser));
        } else {
          // Session expired, clear storage
          sessionStorage.removeItem(SESSION_STORAGE_KEY);
          setUser(null);
        }
      } else {
        // No stored user, check backend
        const currentUser = await authAPI.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentUser));
        } else {
          setUser(null);
        }
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const result = await authAPI.login(username, password);
      if (result.success) {
        setUser(result.data);
        // Store in session storage
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(result.data));
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "حدث خطأ أثناء تسجيل الدخول" };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      // Clear session storage
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (error) {
      console.error("Logout error:", error);
      // Clear session storage even if logout fails
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      setUser(null);
    }
  };

  const isAdmin = () => {
    return user?.role === "admin";
  };

  const isSecretary = () => {
    return user?.role === "secretary";
  };

  const hasPermission = (permission) => {
    // Admin has all permissions
    if (user?.role === "admin") return true;

    // Secretary has limited permissions
    if (user?.role === "secretary") {
      const secretaryPermissions = [
        "view_clients",
        "add_clients",
        "edit_clients",
        "view_cases",
        "view_appointments",
        "add_appointments",
        "edit_appointments",
        "view_documents",
        "add_documents",
        "view_court_sessions",
        "add_court_sessions",
      ];
      return secretaryPermissions.includes(permission);
    }

    return false;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin,
    isSecretary,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
