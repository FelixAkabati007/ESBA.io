// ======================================================================================
// E-SBA Ghana — Top Global Navigation & Multi-Role Switcher
// Allows seamless demonstration and switching across the 4 primary platform roles
// ======================================================================================

import React from "react";
import { UserRole } from "../../types";
import {
  ShieldAlert,
  GraduationCap,
  BookOpen,
  User,
  ShieldCheck,
  KeyRound,
  ArrowLeft,
  LogIn,
  LogOut,
  Building2,
} from "lucide-react";

interface HeaderNavigationProps {
  currentRole: UserRole;
  currentView: "HOME" | "PORTAL";
  onRoleChange: (role: UserRole) => void;
  onNavigateHome: () => void;
  onOpenVerifier: () => void;
  onOpenPasswordRecovery?: () => void;
  onOpenSignIn?: (role?: UserRole) => void;
  onOpenRegisterSchool?: () => void;
  activeSchoolName?: string;
}

export const HeaderNavigation: React.FC<HeaderNavigationProps> = ({
  currentRole,
  currentView,
  onRoleChange,
  onNavigateHome,
  onOpenVerifier,
  onOpenPasswordRecovery,
  onOpenSignIn,
  onOpenRegisterSchool,
  activeSchoolName = "Achimota Basic School",
}) => {
  const roles: Array<{ role: UserRole; label: string; icon: any; color: string }> = [
    {
      role: "MAIN_ADMIN",
      label: "Main Platform Admin",
      icon: ShieldAlert,
      color: "text-amber-500",
    },
    {
      role: "SCHOOL_ADMIN",
      label: "School Admin / Head",
      icon: GraduationCap,
      color: "text-indigo-400",
    },
    {
      role: "TEACHER",
      label: "Teacher Portal",
      icon: BookOpen,
      color: "text-emerald-400",
    },
    {
      role: "STUDENT",
      label: "Student Portal",
      icon: User,
      color: "text-sky-400",
    },
  ];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 print:hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Home Link */}
        <div
          onClick={onNavigateHome}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-600 group-hover:bg-indigo-500 flex items-center justify-center font-bold text-white text-base shadow-sm transition-colors">
            E
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white font-serif group-hover:text-indigo-300 transition-colors">
                E-SBA Ghana
              </span>
              <span className="text-[10px] bg-indigo-950 text-indigo-300 font-semibold px-2 py-0.5 rounded border border-indigo-800">
                NaCCA NPLAF
              </span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-0.5 hidden sm:block">
              Electronic School-Based Assessment & Learner Reporting Platform
            </p>
          </div>
        </div>

        {/* Center: Role Switcher / Home Link */}
        <div className="flex items-center gap-2">
          {currentView === "PORTAL" ? (
            <>
              <button
                onClick={onNavigateHome}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-indigo-400" />
                <span>Home Page</span>
              </button>

              <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 px-2 hidden lg:inline">
                  Active Role:
                </span>
                {roles.map((r) => {
                  const Icon = r.icon;
                  const isSelected = currentRole === r.role;
                  return (
                    <button
                      key={r.role}
                      onClick={() => onRoleChange(r.role)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : r.color}`} />
                      <span className="hidden sm:inline">{r.label}</span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-1 text-xs font-medium text-slate-300">
              <button
                onClick={() => (onOpenSignIn ? onOpenSignIn("SCHOOL_ADMIN") : onRoleChange("SCHOOL_ADMIN"))}
                className="px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
              >
                School Admin
              </button>
              <button
                onClick={() => (onOpenSignIn ? onOpenSignIn("TEACHER") : onRoleChange("TEACHER"))}
                className="px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
              >
                Teacher Portal
              </button>
              <button
                onClick={() => (onOpenSignIn ? onOpenSignIn("STUDENT") : onRoleChange("STUDENT"))}
                className="px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
              >
                Student Portal
              </button>
              <button
                onClick={() => (onOpenSignIn ? onOpenSignIn("MAIN_ADMIN") : onRoleChange("MAIN_ADMIN"))}
                className="px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
              >
                Platform Admin
              </button>
            </div>
          )}
        </div>

        {/* Right Shortcuts */}
        <div className="flex items-center gap-2">
          {onOpenPasswordRecovery && (
            <button
              onClick={onOpenPasswordRecovery}
              title="Password Recovery & Security Reset"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              Recovery
            </button>
          )}

          <button
            onClick={onOpenVerifier}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Verify Report</span>
          </button>

          {currentView === "HOME" ? (
            <button
              onClick={() => (onOpenSignIn ? onOpenSignIn() : onRoleChange("SCHOOL_ADMIN"))}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          ) : (
            <button
              onClick={onNavigateHome}
              title="Sign Out / Return to Home"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-rose-950/70 hover:text-rose-300 border border-slate-700 rounded-lg text-xs font-semibold text-slate-300 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};