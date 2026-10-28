// ======================================================================================
// E-SBA Ghana — Main Platform Admin Portal
// Manages Multi-Tenant Schools, SaaS Subscriptions, Free Exceptions, and NaCCA Curriculum
// ======================================================================================

import React, { useState } from "react";
import {
  School,
  SubscriptionPlan,
  Subscription,
  SubscriptionException,
  AuditLog,
  AssessmentTemplate,
} from "../../types";
import {
  Building2,
  CreditCard,
  Gift,
  BookOpen,
  Sliders,
  History,
  Activity,
  Plus,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  FileCheck,
} from "lucide-react";

interface MainAdminDashboardProps {
  schools: School[];
  plans: SubscriptionPlan[];
  subscriptions: Subscription[];
  exceptions: SubscriptionException[];
  auditLogs: AuditLog[];
  templates: AssessmentTemplate[];
  onAddSchool: (school: Partial<School>) => void;
  onGrantException: (schoolId: string, exception: Partial<SubscriptionException>) => void;
  onUpdateTemplate: (template: AssessmentTemplate) => void;
}

export const MainAdminDashboard: React.FC<MainAdminDashboardProps> = ({
  schools,
  plans,
  subscriptions,
  exceptions,
  auditLogs,
  templates,
  onAddSchool,
  onGrantException,
  onUpdateTemplate,
}) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "schools" | "plans" | "exceptions" | "curriculum" | "audit"
  >("overview");

  const [schoolSearch, setSchoolSearch] = useState("");
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [showGrantExceptionModal, setShowGrantExceptionModal] = useState(false);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(schools[0]?.id || "");

  // Form states for new school
  const [newSchoolName, setNewSchoolName] = useState("");
  const [newSchoolCode, setNewSchoolCode] = useState("");
  const [newSchoolDistrict, setNewSchoolDistrict] = useState("");
  const [newSchoolRegion, setNewSchoolRegion] = useState("Greater Accra Region");
  const [newSchoolEmail, setNewSchoolEmail] = useState("");
  const [newSchoolPhone, setNewSchoolPhone] = useState("");
  const [newSchoolHead, setNewSchoolHead] = useState("");

  // Form states for granting exception
  const [excType, setExcType] = useState<SubscriptionException["exceptionType"]>("FULL_FREE_ACCESS");
  const [excReason, setExcReason] = useState("");
  const [excPermanent, setExcPermanent] = useState(false);

  // Derived metrics
  const totalSchools = schools.length;
  const activeSchools = schools.filter((s) => s.status === "ACTIVE").length;
  const freeSchools = exceptions.filter((e) => e.status === "ACTIVE").length;
  const monthlyRevenue = subscriptions.reduce((acc, curr) => {
    const plan = plans.find((p) => p.id === curr.planId);
    return acc + (plan?.priceGHS || 0);
  }, 0);

  const handleCreateSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName || !newSchoolCode) return;
    onAddSchool({
      name: newSchoolName,
      shortCode: newSchoolCode.toUpperCase(),
      district: newSchoolDistrict || "Ga West Municipal",
      region: newSchoolRegion,
      email: newSchoolEmail || "info@school.edu.gh",
      phone: newSchoolPhone || "0240000000",
      headTeacherName: newSchoolHead || "Headmaster",
      status: "ACTIVE",
    });
    setShowAddSchoolModal(false);
    setNewSchoolName("");
    setNewSchoolCode("");
  };

  const handleCreateException = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchoolId || !excReason) return;
    onGrantException(selectedSchoolId, {
      exceptionType: excType,
      reason: excReason,
      permanent: excPermanent,
      grantedBy: "Platform Super Admin (GES Directorate)",
      startDate: new Date().toISOString(),
      status: "ACTIVE",
    });
    setShowGrantExceptionModal(false);
    setExcReason("");
  };

  return (
    <div className="space-y-6">
      {/* ====================================================================== */}
      {/* 1. MAIN ADMIN NAVIGATION TABS */}
      {/* ====================================================================== */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "overview", label: "Overview & Health", icon: Activity },
            { id: "schools", label: "Schools Directory", icon: Building2 },
            { id: "plans", label: "Subscription Plans", icon: CreditCard },
            { id: "exceptions", label: "Free Exceptions", icon: Gift },
            { id: "curriculum", label: "Assessment Templates", icon: Sliders },
            { id: "audit", label: "Audit Logs", icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-indigo-700 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddSchoolModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New School
          </button>
          <button
            onClick={() => setShowGrantExceptionModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Gift className="w-3.5 h-3.5 text-indigo-600" />
            Grant Free Access
          </button>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* 2. TAB: OVERVIEW & PLATFORM HEALTH */}
      {/* ====================================================================== */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                Total Basic Schools
              </span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
                {totalSchools}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 inline-block">
                {activeSchools} Active Multi-Tenant
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                Free School Exceptions
              </span>
              <span className="text-2xl font-extrabold text-indigo-700 mt-1 block">
                {freeSchools}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 inline-block">
                Sponsored / Pilot Programs
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                Est. Termly Revenue
              </span>
              <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">
                GHS {monthlyRevenue.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 inline-block">
                Commercial SaaS Tier
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                Platform Security & RLS
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-base font-bold text-slate-800">Enforced</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 inline-block">
                Row-Level Security Active
              </span>
            </div>
          </div>

          {/* System Health & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                SaaS System Engine Status
              </h3>
              <div className="space-y-2 text-xs">
                {[
                  { name: "Tenant & Database RLS Isolation", status: "Operational", healthy: true },
                  { name: "NaCCA SBA Calculation Engine", status: "Operational (30/70 & Custom)", healthy: true },
                  { name: "Cryptographic Result Hashing", status: "Operational (SHA-256)", healthy: true },
                  { name: "Public QR Verification (/verify)", status: "Operational", healthy: true },
                  { name: "PWA Offline LocalStorage Caching", status: "Operational", healthy: true },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100"
                  >
                    <span className="font-medium text-slate-700">{item.name}</span>
                    <span className="font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded text-[11px]">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                Recent Sensitive Platform Activity
              </h3>
              <div className="space-y-2 text-xs">
                {auditLogs.slice(0, 4).map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded bg-slate-50 border border-slate-100 flex flex-col gap-1"
                  >
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-indigo-900">{log.action}</span>
                      <span className="text-slate-400 font-mono">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-700 font-medium">{log.newValue || log.entityId}</p>
                    <span className="text-[10px] text-slate-500">
                      By: {log.userName} ({log.userRole})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 3. TAB: SCHOOLS DIRECTORY */}
      {/* ====================================================================== */}
      {activeTab === "schools" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by school name or code..."
                value={schoolSearch}
                onChange={(e) => setSchoolSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Total: {schools.length} registered schools
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-[11px]">
                  <th className="p-3">School Name</th>
                  <th className="p-3">Code</th>
                  <th className="p-3">District & Region</th>
                  <th className="p-3">Head of Institution</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Exceptions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schools
                  .filter((s) =>
                    `${s.name} ${s.shortCode} ${s.district}`
                      .toLowerCase()
                      .includes(schoolSearch.toLowerCase())
                  )
                  .map((school) => {
                    const hasException = exceptions.some(
                      (e) => e.schoolId === school.id && e.status === "ACTIVE"
                    );
                    return (
                      <tr key={school.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">{school.name}</td>
                        <td className="p-3 font-mono font-bold text-indigo-900">
                          {school.shortCode}
                        </td>
                        <td className="p-3 text-slate-600">
                          {school.district}, {school.region}
                        </td>
                        <td className="p-3 text-slate-800 font-medium">
                          {school.headTeacherName}
                        </td>
                        <td className="p-3 text-slate-600">{school.phone}</td>
                        <td className="p-3">
                          <span className="font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded text-[10px]">
                            {school.status}
                          </span>
                        </td>
                        <td className="p-3">
                          {hasException ? (
                            <span className="font-semibold text-indigo-800 bg-indigo-100/70 px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-1">
                              <Gift className="w-3 h-3" />
                              Free Access Active
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">None</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 4. TAB: SUBSCRIPTION PLANS */}
      {/* ====================================================================== */}
      {activeTab === "plans" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-base text-slate-900">{plan.name}</h3>
                  <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                    {plan.billingCycle}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-4">{plan.description}</p>
                <div className="text-2xl font-extrabold text-slate-900 mb-4">
                  GHS {plan.priceGHS}{" "}
                  <span className="text-xs font-normal text-slate-500">/ term</span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700 border-t border-slate-100 pt-3">
                  <div className="flex justify-between">
                    <span>Student Limit:</span>
                    <strong className="text-slate-900">{plan.maxStudents} learners</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Teacher Limit:</span>
                    <strong className="text-slate-900">{plan.maxTeachers} staff</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Class Limit:</span>
                    <strong className="text-slate-900">{plan.maxClasses} classes</strong>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-1.5">
                    Included Features:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {plan.enabledFeatures.map((f, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                      >
                        {f.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ====================================================================== */}
      {/* 5. TAB: FREE EXCEPTIONS MANAGER */}
      {/* ====================================================================== */}
      {activeTab === "exceptions" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                School Free Access & Exception System
              </h3>
              <p className="text-xs text-slate-500">
                Grant selected disadvantaged or government partner schools free access without overwriting plan prices.
              </p>
            </div>
            <button
              onClick={() => setShowGrantExceptionModal(true)}
              className="px-3.5 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-semibold shadow-sm inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              New Exception
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-[11px]">
                  <th className="p-3">School</th>
                  <th className="p-3">Exception Type</th>
                  <th className="p-3">Reason / Justification</th>
                  <th className="p-3">Granted By</th>
                  <th className="p-3">Validity</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exceptions.map((exc) => {
                  const sch = schools.find((s) => s.id === exc.schoolId);
                  return (
                    <tr key={exc.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">
                        {sch?.name || exc.schoolId}
                      </td>
                      <td className="p-3 font-semibold text-indigo-900">
                        {exc.exceptionType.replace(/_/g, " ")}
                      </td>
                      <td className="p-3 text-slate-700">{exc.reason}</td>
                      <td className="p-3 text-slate-600">{exc.grantedBy}</td>
                      <td className="p-3 text-slate-600">
                        {exc.permanent ? "Permanent" : "Valid until Aug 2027"}
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded text-[10px]">
                          {exc.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 6. TAB: ASSESSMENT TEMPLATES & CURRICULUM */}
      {/* ====================================================================== */}
      {activeTab === "curriculum" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Configurable Assessment Templates (NaCCA NPLAF)
            </h3>
            <p className="text-xs text-slate-500">
              Not a hardcoded formula. Weights, components, and maximums can be customized per key phase, level, or academic year.
            </p>
          </div>

          <div className="space-y-4">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-indigo-950">{tpl.name}</h4>
                  <span className="text-xs bg-indigo-100 text-indigo-800 font-semibold px-2.5 py-0.5 rounded">
                    SBA {tpl.internalWeightPercent}% / Exam {tpl.examWeightPercent}%
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Internal Max Raw:</span>
                    <strong className="text-slate-800">{tpl.internalMax} Marks</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Internal SBA Weight:</span>
                    <strong className="text-indigo-700">{tpl.internalWeightPercent}%</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Exam Max Raw:</span>
                    <strong className="text-slate-800">{tpl.examMax} Marks</strong>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Exam Weight:</span>
                    <strong className="text-indigo-700">{tpl.examWeightPercent}%</strong>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Configured Components:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {tpl.components.map((c) => (
                      <span
                        key={c.id}
                        className="text-xs bg-white border border-slate-200 px-2 py-1 rounded shadow-2xs font-medium text-slate-700"
                      >
                        {c.name} (Max {c.maxScore}) • {c.isInternalSBA ? "SBA" : "Exam"}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 7. TAB: AUDIT LOGS */}
      {/* ====================================================================== */}
      {activeTab === "audit" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">
              System-Wide Security & Audit Trail
            </h3>
            <p className="text-xs text-slate-500">
              Immutable log of logins, score submissions, headteacher approvals, and exception grants.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-[11px]">
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Details</th>
                  <th className="p-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3 font-semibold text-slate-900">{log.userName}</td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-indigo-900">{log.action}</td>
                    <td className="p-3 text-slate-700">{log.newValue || log.entityId}</td>
                    <td className="p-3 font-mono text-slate-500">{log.ipAddress || "127.0.0.1"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* MODAL: ADD NEW SCHOOL */}
      {/* ====================================================================== */}
      {showAddSchoolModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Register New School Tenant</h3>
              <button
                onClick={() => setShowAddSchoolModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateSchool} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block">School Name:</label>
                <input
                  type="text"
                  required
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                  placeholder="e.g. Achimota Basic School"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded mt-1 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block">Short Code:</label>
                  <input
                    type="text"
                    required
                    value={newSchoolCode}
                    onChange={(e) => setNewSchoolCode(e.target.value)}
                    placeholder="e.g. ACHI"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded mt-1 text-xs uppercase"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block">District:</label>
                  <input
                    type="text"
                    value={newSchoolDistrict}
                    onChange={(e) => setNewSchoolDistrict(e.target.value)}
                    placeholder="e.g. Ga West"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded mt-1 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block">Headteacher Name:</label>
                  <input
                    type="text"
                    value={newSchoolHead}
                    onChange={(e) => setNewSchoolHead(e.target.value)}
                    placeholder="e.g. Mr. K. Osei"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded mt-1 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block">Phone Contact:</label>
                  <input
                    type="text"
                    value={newSchoolPhone}
                    onChange={(e) => setNewSchoolPhone(e.target.value)}
                    placeholder="e.g. 0244123456"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded mt-1 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddSchoolModal(false)}
                  className="px-4 py-2 border rounded text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 text-white rounded font-semibold hover:bg-emerald-800"
                >
                  Create School Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* MODAL: GRANT FREE EXCEPTION */}
      {/* ====================================================================== */}
      {showGrantExceptionModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Grant School Free Access Exception</h3>
              <button
                onClick={() => setShowGrantExceptionModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateException} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block">Select School:</label>
                <select
                  value={selectedSchoolId}
                  onChange={(e) => setSelectedSchoolId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded mt-1 text-xs"
                >
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.shortCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block">Exception Type:</label>
                <select
                  value={excType}
                  onChange={(e) => setExcType(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded mt-1 text-xs"
                >
                  <option value="FULL_FREE_ACCESS">Full Free Access (Government / Pilot)</option>
                  <option value="TEMPORARY_FREE_ACCESS">Temporary Free Access (Grace)</option>
                  <option value="EXTENDED_TRIAL">Extended Trial Period</option>
                  <option value="PROMOTIONAL_ACCESS">Promotional Access</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block">Justification / Reason:</label>
                <textarea
                  required
                  rows={3}
                  value={excReason}
                  onChange={(e) => setExcReason(e.target.value)}
                  placeholder="e.g. Selected under National Digital Education Initiative for rural public basic schools..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded mt-1 text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="permCheck"
                  checked={excPermanent}
                  onChange={(e) => setExcPermanent(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <label htmlFor="permCheck" className="text-slate-700 font-medium">
                  Permanent Free Access (No automated expiry)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowGrantExceptionModal(false)}
                  className="px-4 py-2 border rounded text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-700 text-white rounded font-semibold hover:bg-indigo-800"
                >
                  Affix Exception Grant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
