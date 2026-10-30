// ======================================================================================
// E-SBA Ghana — Global Top Navigation Bar
// Features: Breadcrumbs, Global Search, Academic Session Pill, Notifications, User Menu
// ======================================================================================

import React, { useState, useRef, useEffect } from "react";
import { UserRole } from "../../types";
import {
  Menu,
  Search,
  Calendar,
  Bell,
  Wifi,
  WifiOff,
  User,
  ChevronDown,
  ShieldAlert,
  GraduationCap,
  BookOpen,
  KeyRound,
  ShieldCheck,
  LogOut,
  Home,
  Check,
} from "lucide-react";
import { NotificationsPopover } from "../common/NotificationsPopover";

interface TopNavbarProps {
  currentRole: UserRole;
  schoolName: string;
  activeViewLabel: string;
  academicYearLabel: string;
  termLabel: string;
  onToggleSidebar: () => void;
  onRoleChange: (role: UserRole) => void;
  onNavigateHome: () => void;
  onOpenVerifier: () => void;
  onOpenPasswordRecovery: () => void;
  onSearch?: (query: string) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentRole,
  schoolName,
  activeViewLabel,
  academicYearLabel,
  termLabel,
  onToggleSidebar,
  onRoleChange,
  onNavigateHome,
  onOpenVerifier,
  onOpenPasswordRecovery,
  onSearch,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOnline, setIsOnline] = useState(true);

  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Online / Offline listener
  useEffect(() => {
    const updateOnline = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    return () => {
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, []);

  const roleInfo = {
    MAIN_ADMIN: {
      label: "Platform Admin",
      name: "Chief Director K. Agyeman",
      color: "bg-amber-100 text-amber-900 border-amber-300",
      icon: ShieldAlert,
    },
    SCHOOL_ADMIN: {
      label: "School Head",
      name: "Mrs. Grace Mensah-Bonsu",
      color: "bg-indigo-100 text-indigo-900 border-indigo-300",
      icon: GraduationCap,
    },
    TEACHER: {
      label: "Subject Teacher",
      name: "Mr. Kofi Mensah",
      color: "bg-emerald-100 text-emerald-900 border-emerald-300",
      icon: BookOpen,
    },
    STUDENT: {
      label: "Learner",
      name: "Kweku Boateng",
      color: "bg-sky-100 text-sky-900 border-sky-300",
      icon: User,
    },
  }[currentRole];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 font-sans shadow-xs">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden transition-colors"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumbs */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs">
          <button
            onClick={onNavigateHome}
            className="font-bold text-slate-700 hover:text-indigo-600 transition-colors flex items-center gap-1"
          >
            <Home className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate max-w-[140px] md:max-w-none">{schoolName}</span>
          </button>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-indigo-700">{roleInfo.label}</span>
          {activeViewLabel && (
            <>
              <span className="text-slate-300">/</span>
              <span className="text-slate-500 font-medium truncate max-w-[150px]">
                {activeViewLabel}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearch?.(e.target.value);
            }}
            placeholder="Search learners, classes, or subjects..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right: Actions, Notifications & Profile */}
      <div className="flex items-center gap-2.5">
        {/* Academic Session Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
          <span>
            {academicYearLabel} • {termLabel}
          </span>
        </div>

        {/* Online / Offline Sync Status */}
        <div
          title={isOnline ? "Connected to Cloud Sync" : "Working Offline (PWA Local Cache)"}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200"
        >
          {isOnline ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-slate-600 hidden xl:inline">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] text-amber-700 font-bold hidden xl:inline">
                Offline Mode
              </span>
            </>
          )}
        </div>

        {/* Notifications Popover Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
            title="System Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
          </button>

          <NotificationsPopover
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        </div>

        {/* User Profile Pill & Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            aria-label="User Account Menu"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-xs">
              {roleInfo.name.charAt(0)}
            </div>
            <div className="hidden sm:block text-xs">
              <span className="font-bold text-slate-900 block truncate max-w-[120px]">
                {roleInfo.name}
              </span>
              <span
                className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded border ${roleInfo.color} inline-block`}
              >
                {roleInfo.label}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 top-12 z-50 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 text-xs font-sans animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="font-bold text-slate-900">{roleInfo.name}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">{schoolName}</p>
              </div>

              {/* Role Switcher Section */}
              <div className="p-2 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                  Switch Active Portal
                </span>
                {[
                  { role: "MAIN_ADMIN" as UserRole, label: "Platform Admin", icon: ShieldAlert },
                  { role: "SCHOOL_ADMIN" as UserRole, label: "School Admin", icon: GraduationCap },
                  { role: "TEACHER" as UserRole, label: "Teacher Portal", icon: BookOpen },
                  { role: "STUDENT" as UserRole, label: "Student Portal", icon: User },
                ].map((r) => {
                  const Icon = r.icon;
                  const isSelected = currentRole === r.role;
                  return (
                    <button
                      key={r.role}
                      onClick={() => {
                        onRoleChange(r.role);
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                        isSelected
                          ? "bg-indigo-50 text-indigo-700 font-bold"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-slate-500" />
                        <span>{r.label}</span>
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </button>
                  );
                })}
              </div>

              {/* Utility Links */}
              <div className="p-2 space-y-0.5">
                <button
                  onClick={() => {
                    onOpenVerifier();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verify Report Card</span>
                </button>
                <button
                  onClick={() => {
                    onOpenPasswordRecovery();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                  <span>Security & Password Reset</span>
                </button>
              </div>

              {/* Sign Out */}
              <div className="p-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    onNavigateHome();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out / Return to Home</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
