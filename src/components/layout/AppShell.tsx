// ======================================================================================
// E-SBA Ghana — Master Application Shell
// Unifies Sidebar Navigation, Top App Bar, Breadcrumbs, Responsive Drawer & Content Area
// ======================================================================================

import React, { useState } from "react";
import { UserRole } from "../../types";
import { AppSidebar } from "./AppSidebar";
import { TopNavbar } from "./TopNavbar";

interface AppShellProps {
  currentRole: UserRole;
  schoolName: string;
  schoolDistrict: string;
  activeTab: string;
  activeViewLabel: string;
  academicYearLabel: string;
  termLabel: string;
  onSelectTab: (tabId: string) => void;
  onRoleChange: (role: UserRole) => void;
  onNavigateHome: () => void;
  onOpenVerifier: () => void;
  onOpenPasswordRecovery: () => void;
  onOpenImportCenter?: () => void;
  onOpenExportCenter?: () => void;
  onSearch?: (query: string) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentRole,
  schoolName,
  schoolDistrict,
  activeTab,
  activeViewLabel,
  academicYearLabel,
  termLabel,
  onSelectTab,
  onRoleChange,
  onNavigateHome,
  onOpenVerifier,
  onOpenPasswordRecovery,
  onOpenImportCenter,
  onOpenExportCenter,
  onSearch,
  children,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex shrink-0">
          <AppSidebar
            currentRole={currentRole}
            schoolName={schoolName}
            schoolDistrict={schoolDistrict}
            activeTab={activeTab}
            collapsed={sidebarCollapsed}
            onSelectTab={onSelectTab}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            onNavigateHome={onNavigateHome}
            onOpenImportCenter={onOpenImportCenter}
            onOpenExportCenter={onOpenExportCenter}
          />
        </div>

        {/* Mobile Slide-Out Drawer with Backdrop */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            {/* Backdrop */}
            <div
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            />
            {/* Drawer */}
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 shadow-2xl">
              <AppSidebar
                currentRole={currentRole}
                schoolName={schoolName}
                schoolDistrict={schoolDistrict}
                activeTab={activeTab}
                collapsed={false}
                onSelectTab={(tabId) => {
                  onSelectTab(tabId);
                  setMobileDrawerOpen(false);
                }}
                onToggleCollapse={() => setMobileDrawerOpen(false)}
                onNavigateHome={() => {
                  onNavigateHome();
                  setMobileDrawerOpen(false);
                }}
                onOpenImportCenter={() => {
                  onOpenImportCenter?.();
                  setMobileDrawerOpen(false);
                }}
                onOpenExportCenter={() => {
                  onOpenExportCenter?.();
                  setMobileDrawerOpen(false);
                }}
              />
            </div>
          </div>
        )}

        {/* Right Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Navbar */}
          <TopNavbar
            currentRole={currentRole}
            schoolName={schoolName}
            activeViewLabel={activeViewLabel}
            academicYearLabel={academicYearLabel}
            termLabel={termLabel}
            onToggleSidebar={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            onRoleChange={onRoleChange}
            onNavigateHome={onNavigateHome}
            onOpenVerifier={onOpenVerifier}
            onOpenPasswordRecovery={onOpenPasswordRecovery}
            onSearch={onSearch}
          />

          {/* Main Content Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-150">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
