// ======================================================================================
// E-SBA Ghana — Enterprise Left Sidebar Navigation
// Provides categorized, high-contrast navigation tailored to the active user role
// ======================================================================================

import React from "react";
import { UserRole } from "../../types";
import {
  GraduationCap,
  Users,
  Layers,
  FileCheck,
  Calendar,
  Printer,
  Wand2,
  FileSpreadsheet,
  Upload,
  Download,
  BookOpen,
  User,
  ShieldAlert,
  ShieldCheck,
  Building2,
  CreditCard,
  FileText,
  Sliders,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

interface AppSidebarProps {
  currentRole: UserRole;
  schoolName: string;
  schoolDistrict: string;
  activeTab: string;
  collapsed: boolean;
  onSelectTab: (tabId: string) => void;
  onToggleCollapse: () => void;
  onNavigateHome: () => void;
  onOpenImportCenter?: () => void;
  onOpenExportCenter?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentRole,
  schoolName,
  schoolDistrict,
  activeTab,
  collapsed,
  onSelectTab,
  onToggleCollapse,
  onNavigateHome,
  onOpenImportCenter,
  onOpenExportCenter,
}) => {
  // Navigation menus grouped by role
  const getNavSections = () => {
    if (currentRole === "SCHOOL_ADMIN") {
      return [
        {
          title: "Institutional Operations",
          items: [
            { id: "overview", label: "School Overview", icon: GraduationCap },
            { id: "students", label: "Learners / Students", icon: Users },
            { id: "teachers", label: "Teaching Staff", icon: Users },
            { id: "classes", label: "Classes & Streams", icon: Layers },
            { id: "wizard", label: "Setup Wizard (12-Step)", icon: Wand2 },
          ],
        },
        {
          title: "Academic & SBA",
          items: [
            { id: "broadsheet", label: "Class Broadsheet", icon: FileSpreadsheet, badge: "New" },
            { id: "moderation", label: "Results Moderation", icon: FileCheck },
            { id: "attendance", label: "Attendance Roll", icon: Calendar },
            { id: "reports", label: "Report Cards & Print", icon: Printer },
          ],
        },
      ];
    }

    if (currentRole === "TEACHER") {
      return [
        {
          title: "Classroom Mark Entry",
          items: [
            { id: "marks", label: "Score Entry (30/70)", icon: BookOpen },
            { id: "broadsheet", label: "Class Broadsheet", icon: FileSpreadsheet },
            { id: "attendance", label: "Attendance Roll", icon: Calendar },
          ],
        },
      ];
    }

    if (currentRole === "STUDENT") {
      return [
        {
          title: "Student Portal",
          items: [
            { id: "reports", label: "Terminal Report Card", icon: FileText },
            { id: "history", label: "Academic Trajectory", icon: Sparkles },
            { id: "attendance", label: "Attendance Record", icon: Calendar },
          ],
        },
      ];
    }

    // MAIN_ADMIN
    return [
      {
        title: "Platform SaaS Engine",
        items: [
          { id: "overview", label: "Overview & Health", icon: Building2 },
          { id: "schools", label: "Schools Directory", icon: GraduationCap },
          { id: "plans", label: "Subscription Tiers", icon: CreditCard },
          { id: "exceptions", label: "Free Exceptions", icon: ShieldCheck },
          { id: "templates", label: "NaCCA SBA Templates", icon: Sliders },
          { id: "audit", label: "System Audit Logs", icon: ShieldAlert },
        ],
      },
    ];
  };

  const navSections = getNavSections();

  return (
    <aside
      className={`bg-slate-900 text-slate-100 border-r border-slate-800 flex flex-col justify-between transition-all duration-200 select-none font-sans z-40 ${
        collapsed ? "w-18" : "w-64"
      }`}
    >
      {/* Top Header & Brand */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800">
          <div
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-sm shrink-0 group-hover:bg-indigo-500 transition-colors">
              E
            </div>
            {!collapsed && (
              <div>
                <span className="font-extrabold text-sm tracking-tight text-white font-serif group-hover:text-indigo-300 transition-colors block">
                  E-SBA Ghana
                </span>
                <span className="text-[9px] uppercase tracking-wider font-bold text-indigo-400 block -mt-0.5">
                  NaCCA NPLAF
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden lg:block"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Active School Badge */}
        {!collapsed && currentRole !== "MAIN_ADMIN" && (
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/40">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <div className="overflow-hidden">
                <span className="text-xs font-bold text-white block truncate">{schoolName}</span>
                <span className="text-[10px] text-slate-400 block truncate">{schoolDistrict}</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Sections */}
        <nav className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-14rem)]">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!collapsed && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-1">
                  {section.title}
                </span>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? "text-white" : "text-slate-400"
                        }`}
                      />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!collapsed && item.badge && (
                      <span className="text-[9px] font-bold bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-mono">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Data Tools (Import / Export) */}
          {!collapsed && currentRole === "SCHOOL_ADMIN" && (
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-1">
                Data Utilities
              </span>
              {onOpenExportCenter && (
                <button
                  onClick={onOpenExportCenter}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Export Center</span>
                </button>
              )}
              {onOpenImportCenter && (
                <button
                  onClick={onOpenImportCenter}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Upload className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Import Center</span>
                </button>
              )}
            </div>
          )}
        </nav>
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-1">
        <button
          onClick={onNavigateHome}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Return to Public Home Page"
        >
          <ArrowLeft className="w-4 h-4 text-indigo-400 shrink-0" />
          {!collapsed && <span>Public Home Page</span>}
        </button>
      </div>
    </aside>
  );
};
