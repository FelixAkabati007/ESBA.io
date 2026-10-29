// ======================================================================================
// E-SBA Ghana — Commercial Sign-In & Role Authentication Component
// Features: 4 Demo Role Cards with Autofill, High-Contrast WCAG 2.1 AA Typography,
// Google SSO, Password Recovery, School Registration Trigger, and Legal Agreements
// ======================================================================================

import React, { useState } from "react";
import { UserRole } from "../../types";
import {
  ShieldAlert,
  GraduationCap,
  BookOpen,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  X,
  Sparkles,
} from "lucide-react";

interface SignInModalProps {
  isOpen: boolean;
  initialRole?: UserRole;
  onClose: () => void;
  onSuccess: (role: UserRole, email: string) => void;
  onOpenForgotPassword: () => void;
  onOpenRegisterSchool: () => void;
  onOpenLegal: (type: "PRIVACY" | "TERMS") => void;
}

interface DemoRoleConfig {
  role: UserRole;
  kicker: string;
  title: string;
  desc: string;
  email: string;
  badgeStyle: string;
  borderActive: string;
  icon: any;
}

const DEMO_ROLES: DemoRoleConfig[] = [
  {
    role: "MAIN_ADMIN",
    kicker: "PLATFORM",
    title: "Main Admin",
    desc: "Manage schools & subscriptions",
    email: "demo@esba.gh",
    badgeStyle: "bg-amber-100 text-amber-900 border-amber-300",
    borderActive: "border-amber-600 ring-2 ring-amber-500/30 bg-amber-50/50",
    icon: ShieldAlert,
  },
  {
    role: "SCHOOL_ADMIN",
    kicker: "SCHOOL",
    title: "School Admin",
    desc: "Run academic operations",
    email: "head@achimota-basic.edu.gh",
    badgeStyle: "bg-indigo-100 text-indigo-900 border-indigo-300",
    borderActive: "border-indigo-600 ring-2 ring-indigo-500/30 bg-indigo-50/50",
    icon: GraduationCap,
  },
  {
    role: "TEACHER",
    kicker: "CLASSROOM",
    title: "Teacher",
    desc: "Enter scores & reports",
    email: "kofi.mensah@achimota-basic.edu.gh",
    badgeStyle: "bg-emerald-100 text-emerald-900 border-emerald-300",
    borderActive: "border-emerald-600 ring-2 ring-emerald-500/30 bg-emerald-50/50",
    icon: BookOpen,
  },
  {
    role: "STUDENT",
    kicker: "LEARNER",
    title: "Student",
    desc: "View published results",
    email: "student@achimota-basic.edu.gh",
    badgeStyle: "bg-sky-100 text-sky-900 border-sky-300",
    borderActive: "border-sky-600 ring-2 ring-sky-500/30 bg-sky-50/50",
    icon: User,
  },
];

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  initialRole = "MAIN_ADMIN",
  onClose,
  onSuccess,
  onOpenForgotPassword,
  onOpenRegisterSchool,
  onOpenLegal,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [email, setEmail] = useState("demo@esba.gh");
  const [password, setPassword] = useState("Password123!");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Select demo role and autofill its credentials
  const handleSelectDemoRole = (roleConfig: DemoRoleConfig) => {
    setSelectedRole(roleConfig.role);
    setEmail(roleConfig.email);
    setPassword("Password123!");
    setErrorMessage(null);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    // Simulate authentic authentication verification
    setTimeout(() => {
      setLoading(false);
      onSuccess(selectedRole, email);
    }, 450);
  };

  const handleGoogleSignIn = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess(selectedRole, email || "user@gmail.com");
    }, 500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in duration-200">
        {/* Top Header with Brand */}
        <div className="px-6 pt-6 pb-4 sm:px-8 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-sm">
              E
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-slate-900 font-serif">
                E-SBA Ghana
              </span>
              <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-900 font-semibold px-2 py-0.5 rounded border border-indigo-200">
                NaCCA NPLAF
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container */}
        <div className="px-6 py-6 sm:px-8 space-y-6">
          {/* Title and Subtitle */}
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Sign in to your account
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
              Choose a demo role to explore the platform.
            </p>
          </div>

          {/* 4 Demo Role Cards (2x2 Grid) */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3" id="role-picker">
            {DEMO_ROLES.map((r) => {
              const isSelected = selectedRole === r.role;
              const Icon = r.icon;

              return (
                <button
                  type="button"
                  key={r.role}
                  data-role={r.role}
                  onClick={() => handleSelectDemoRole(r)}
                  className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group select-none ${
                    isSelected
                      ? `${r.borderActive} shadow-sm`
                      : "border-slate-200 bg-slate-50/60 hover:bg-slate-100/70 hover:border-slate-300"
                  }`}
                >
                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 text-indigo-600">
                      <CheckCircle2 className="w-4 h-4 fill-indigo-600 text-white" />
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span
                      className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${r.badgeStyle}`}
                    >
                      {r.kicker}
                    </span>
                  </div>

                  <div className="font-extrabold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span>{r.title}</span>
                  </div>

                  <p className="text-[11px] text-slate-600 mt-1 leading-tight line-clamp-1">
                    {r.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {errorMessage}
              </div>
            )}

            {/* Email / Username */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Email / Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school.edu.gh"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={onOpenForgotPassword}
                className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-xs text-slate-400 font-medium uppercase tracking-wider absolute">
              or
            </span>
          </div>

          {/* Google SSO Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 shadow-sm"
          >
            {/* Google Multicolor SVG */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Footer Guidance */}
          <div className="space-y-2 pt-2 border-t border-slate-100 text-center text-xs text-slate-500">
            <p>
              Teachers and learners: use the login credentials provided by your School Admin.
            </p>
            <p>
              Registering a school?{" "}
              <button
                type="button"
                onClick={onOpenRegisterSchool}
                className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                Create a School Admin account
              </button>
            </p>
            <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
              Demo platform — data is stored locally in your browser.{" "}
              <button
                type="button"
                onClick={() => onOpenLegal("PRIVACY")}
                className="text-slate-600 hover:text-indigo-600 underline"
              >
                Privacy Policy
              </button>{" "}
              ·{" "}
              <button
                type="button"
                onClick={() => onOpenLegal("TERMS")}
                className="text-slate-600 hover:text-indigo-600 underline"
              >
                Terms of Service
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};