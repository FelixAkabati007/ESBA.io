// ======================================================================================
// E-SBA Ghana — Authentication & Tenancy Session Context
// Manages active user session, role credentials, multi-tenancy switches, and persistence
// ======================================================================================

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole } from "../types";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  schoolId: string;
  avatarUrl?: string;
}

interface AuthContextType {
  currentRole: UserRole;
  currentView: "HOME" | "PORTAL";
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (role: UserRole, email: string) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
  navigateToHome: () => void;
  navigateToPortal: (role?: UserRole) => void;
}

const DEFAULT_ROLE_USERS: Record<UserRole, AuthUser> = {
  MAIN_ADMIN: {
    id: "USR_MAIN_ADMIN",
    name: "Chief Director K. Agyeman",
    email: "admin@esba.gh",
    role: "MAIN_ADMIN",
    schoolId: "SCH_PLATFORM",
  },
  SCHOOL_ADMIN: {
    id: "USR_SCHOOL_ADMIN",
    name: "Mrs. Grace Mensah-Bonsu (Headteacher)",
    email: "head@achimota-basic.edu.gh",
    role: "SCHOOL_ADMIN",
    schoolId: "SCH_ACHIMOTA_001",
  },
  TEACHER: {
    id: "USR_TEACHER_1",
    name: "Mr. Kofi Mensah (Subject Lead)",
    email: "kofi.mensah@achimota-basic.edu.gh",
    role: "TEACHER",
    schoolId: "SCH_ACHIMOTA_001",
  },
  STUDENT: {
    id: "STU_2026_001",
    name: "Kweku Boateng (JHS 2 Green)",
    email: "student@achimota-basic.edu.gh",
    role: "STUDENT",
    schoolId: "SCH_ACHIMOTA_001",
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<"HOME" | "PORTAL">("HOME");
  const [currentRole, setCurrentRole] = useState<UserRole>("SCHOOL_ADMIN");
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(DEFAULT_ROLE_USERS.SCHOOL_ADMIN);

  // Restore stored session if present
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const savedRole = window.localStorage.getItem("esba_active_role") as UserRole | null;
        if (savedRole && DEFAULT_ROLE_USERS[savedRole]) {
          setCurrentRole(savedRole);
          setCurrentUser(DEFAULT_ROLE_USERS[savedRole]);
        }
      }
    } catch (_err) {
      // storage unavailable or in incognito
    }
  }, []);

  const login = (role: UserRole, email: string) => {
    setCurrentRole(role);
    const user = {
      ...(DEFAULT_ROLE_USERS[role] || DEFAULT_ROLE_USERS.SCHOOL_ADMIN),
      email: email || DEFAULT_ROLE_USERS[role].email,
    };
    setCurrentUser(user);
    setCurrentView("PORTAL");

    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem("esba_active_role", role);
      }
    } catch (_err) {
      // ignore
    }
  };

  const logout = () => {
    setCurrentView("HOME");
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem("esba_active_role");
      }
    } catch (_err) {
      // ignore
    }
  };

  const setRole = (role: UserRole) => {
    setCurrentRole(role);
    setCurrentUser(DEFAULT_ROLE_USERS[role]);
    setCurrentView("PORTAL");
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem("esba_active_role", role);
      }
    } catch (_err) {
      // ignore
    }
  };

  const navigateToHome = () => setCurrentView("HOME");
  const navigateToPortal = (role?: UserRole) => {
    if (role) {
      setRole(role);
    } else {
      setCurrentView("PORTAL");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentRole,
        currentView,
        currentUser,
        isAuthenticated: currentView === "PORTAL",
        login,
        logout,
        setRole,
        navigateToHome,
        navigateToPortal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
