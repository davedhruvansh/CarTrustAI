import React, { createContext, useContext, useState, useEffect } from "react";
import { User, VerificationReport, VehicleInput } from "../types";

interface CarTrustContextType {
  user: User | null;
  token: string | null;
  reports: VerificationReport[];
  selectedReport: VerificationReport | null;
  loading: boolean;
  loadingMessage: string;
  error: string | null;
  currentPage: "landing" | "auth" | "dashboard" | "analyze" | "results";
  authMode: "login" | "signup";
  setAuthMode: (mode: "login" | "signup") => void;
  setCurrentPage: (page: "landing" | "auth" | "dashboard" | "analyze" | "results") => void;
  setSelectedReport: (report: VerificationReport | null) => void;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (username: string, email: string, pass: string, confirmPass: string) => Promise<boolean>;
  logout: () => void;
  loadReports: () => Promise<void>;
  analyzeCar: (vehicle: VehicleInput, images: { front?: string; back?: string; side?: string; interior?: string }) => Promise<boolean>;
  deleteReport: (id: string) => Promise<boolean>;
  clearError: () => void;
}

const CarTrustContext = createContext<CarTrustContextType | undefined>(undefined);

export const CarTrustProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("cartrust_token"));
  const [reports, setReports] = useState<VerificationReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<VerificationReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<"landing" | "auth" | "dashboard" | "analyze" | "results">("landing");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const clearError = () => setError(null);

  // Load user profile on mount if token exists
  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setCurrentPage("dashboard");
        loadReports();
      } else {
        // Token expired/invalid
        logout();
      }
    } catch (err) {
      console.error("Failed to load user profile:", err);
      logout();
    }
  };

  const loadReports = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/reports", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error("Failed to load user reports:", err);
    }
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    setLoading(true);
    setLoadingMessage("Securing credential tunnel...");
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login credentials rejected.");
      }
      localStorage.setItem("cartrust_token", data.token);
      setToken(data.token);
      setUser(data.user);
      setLoading(false);
      setCurrentPage("dashboard");
      return true;
    } catch (err: any) {
      setError(err.message || "Credential matching failed.");
      setLoading(false);
      return false;
    }
  };

  const signup = async (username: string, email: string, pass: string, confirmPass: string): Promise<boolean> => {
    setLoading(true);
    setLoadingMessage("Creating encrypted profile account...");
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password: pass, confirmPassword: confirmPass })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration rejected.");
      }
      localStorage.setItem("cartrust_token", data.token);
      setToken(data.token);
      setUser(data.user);
      setLoading(false);
      setCurrentPage("dashboard");
      return true;
    } catch (err: any) {
      setError(err.message || "Registration failed.");
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error("Server-side logout token invalidation failed:", err);
    }
    localStorage.removeItem("cartrust_token");
    setToken(null);
    setUser(null);
    setReports([]);
    setSelectedReport(null);
    setCurrentPage("landing");
  };

  const analyzeCar = async (
    vehicle: VehicleInput,
    images: { front?: string; back?: string; side?: string; interior?: string }
  ): Promise<boolean> => {
    setLoading(true);
    setLoadingMessage("Scanning automotive metrics & running trust validation... (usually takes 10-15s)");
    setError(null);
    try {
      const res = await fetch("/api/reports/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ vehicle, images })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification analysis failed.");
      }
      setReports(prev => [data.report, ...prev]);
      setSelectedReport(data.report);
      setLoading(false);
      setCurrentPage("results");
      return true;
    } catch (err: any) {
      setError(err.message || "AI Analysis Pipeline errored.");
      setLoading(false);
      return false;
    }
  };

  const deleteReport = async (id: string): Promise<boolean> => {
    setError(null);
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        setReports(prev => prev.filter(r => r.id !== id));
        if (selectedReport?.id === id) {
          setSelectedReport(null);
          setCurrentPage("dashboard");
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to delete report:", err);
      return false;
    }
  };

  return (
    <CarTrustContext.Provider
      value={{
        user,
        token,
        reports,
        selectedReport,
        loading,
        loadingMessage,
        error,
        currentPage,
        authMode,
        setAuthMode,
        setCurrentPage,
        setSelectedReport,
        login,
        signup,
        logout,
        loadReports,
        analyzeCar,
        deleteReport,
        clearError
      }}
    >
      {children}
    </CarTrustContext.Provider>
  );
};

export const useCarTrust = () => {
  const context = useContext(CarTrustContext);
  if (context === undefined) {
    throw new Error("useCarTrust must be used within a CarTrustProvider");
  }
  return context;
};
