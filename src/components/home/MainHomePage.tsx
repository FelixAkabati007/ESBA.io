// ======================================================================================
// E-SBA Ghana — Commercial Education SaaS Homepage & Portal Launchpad
// Complies with NaCCA National Pre-Tertiary Learning Assessment Framework (NPLAF)
// Features: Hero Banner, Role Entrance Launchpad, Framework Showcase, & Inline Verifier
// ======================================================================================

import React, { useState } from "react";
import { UserRole } from "../../types";
import {
  ShieldAlert,
  GraduationCap,
  BookOpen,
  User,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sliders,
  Layers,
  FileSpreadsheet,
  Download,
  WifiOff,
  Search,
  Sparkles,
  QrCode,
  Lock,
  Building2,
  Calendar,
} from "lucide-react";
import { PublicReportVerifier } from "../verification/PublicReportVerifier";

interface MainHomePageProps {
  onSelectRole: (role: UserRole) => void;
  onOpenVerifier: () => void;
  onOpenRegister: () => void;
}

export const MainHomePage: React.FC<MainHomePageProps> = ({
  onSelectRole,
  onOpenVerifier,
  onOpenRegister,
}) => {
  const [inlineVerifyCode, setInlineVerifyCode] = useState("ESBA-2026-9F72A81");
  const [showInlineVerifier, setShowInlineVerifier] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* ====================================================================== */}
      {/* 1. TOP ANNOUNCEMENT BAR */}
      {/* ====================================================================== */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 px-4 py-1.5 text-center text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-sm">
        <Sparkles className="w-3.5 h-3.5" />
        <span>
          Aligned with the NaCCA National Pre-Tertiary Learning Assessment Framework (NPLAF) for Ghanaian Basic Schools
        </span>
      </div>

      {/* ====================================================================== */}
      {/* 2. HERO SECTION */}
      {/* ====================================================================== */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28 border-b border-slate-800">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#312e81_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 text-xs font-semibold shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Basic 1 to Basic 9 (JHS 3) • Multi-Tenant SaaS Platform
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-serif max-w-4xl mx-auto leading-tight">
            Electronic School-Based Assessment &{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-amber-300">
              Learner Reporting Platform
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            A comprehensive, subscription-based school management and assessment engine designed for Ghanaian basic education. Strictly isolates school data with PostgreSQL RLS, automates continuous assessment weighting, and produces certified terminal report cards with cryptographic QR verification.
          </p>

          {/* Quick CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onSelectRole("SCHOOL_ADMIN")}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all inline-flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              Enter School Admin Portal
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSelectRole("TEACHER")}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-sm font-semibold transition-all inline-flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Teacher Score Entry
            </button>
            <button
              onClick={onOpenVerifier}
              className="px-5 py-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-sm font-medium transition-all inline-flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Verify Report Card
            </button>
          </div>

          {/* Feature Highlights Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto pt-8 text-left">
            <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-800 backdrop-blur-sm">
              <span className="text-[10px] uppercase font-bold text-indigo-400 block">Coverage</span>
              <span className="text-base font-bold text-white mt-0.5 block">Basic 1 – JHS 3</span>
              <span className="text-[11px] text-slate-400">Key Phases 2, 3, & 4</span>
            </div>
            <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-800 backdrop-blur-sm">
              <span className="text-[10px] uppercase font-bold text-amber-400 block">Assessment</span>
              <span className="text-base font-bold text-white mt-0.5 block">30% SBA / 70% Exam</span>
              <span className="text-[11px] text-slate-400">Configurable Templates</span>
            </div>
            <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-800 backdrop-blur-sm">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">Verification</span>
              <span className="text-base font-bold text-white mt-0.5 block">SHA-256 Seals</span>
              <span className="text-[11px] text-slate-400">QR Code Authenticated</span>
            </div>
            <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-800 backdrop-blur-sm">
              <span className="text-[10px] uppercase font-bold text-sky-400 block">Resilience</span>
              <span className="text-base font-bold text-white mt-0.5 block">PWA Offline Mode</span>
              <span className="text-[11px] text-slate-400">Local Cache & Auto-Sync</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================== */}
      {/* 3. INTERACTIVE PORTAL LAUNCHPAD (THE 4 PRIMARY ROLES) */}
      {/* ====================================================================== */}
      <section className="py-16 md:py-20 bg-slate-950/60 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
              Four Specialized User Experiences
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Every role has a tailored dashboard strictly isolated with server-side permissions and PostgreSQL Row Level Security (RLS).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. Main Admin */}
            <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/60 rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-lg hover:shadow-amber-500/5 group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Main Platform Admin</h3>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Multi-tenant SaaS oversight, subscription tier pricing, government free-access exceptions, and NaCCA curriculum management.
                </p>
                <ul className="space-y-1.5 text-[11px] text-slate-400 border-t border-slate-800/80 pt-3">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    School tenant provisioning
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    SaaS billing & exceptions
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    NaCCA standards configuration
                  </li>
                </ul>
              </div>
              <button
                onClick={() => onSelectRole("MAIN_ADMIN")}
                className="mt-6 w-full py-2 px-3 bg-slate-800 hover:bg-amber-600 hover:text-slate-950 text-slate-200 rounded-lg text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5"
              >
                Launch Admin Portal
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 2. School Admin */}
            <div className="bg-slate-900 border border-slate-800 hover:border-indigo-500/60 rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-lg hover:shadow-indigo-500/5 group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">School Admin / Head</h3>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Controls institutional operations, learner registration, teacher subject assignments, moderation, and report card publishing.
                </p>
                <ul className="space-y-1.5 text-[11px] text-slate-400 border-t border-slate-800/80 pt-3">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                    12-step guided setup wizard
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                    Results moderation & seal
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                    Bulk A4 report printing
                  </li>
                </ul>
              </div>
              <button
                onClick={() => onSelectRole("SCHOOL_ADMIN")}
                className="mt-6 w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5 shadow-sm"
              >
                Launch School Portal
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3. Teacher Portal */}
            <div className="bg-slate-900 border border-slate-800 hover:border-emerald-500/60 rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-lg hover:shadow-emerald-500/5 group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Teacher Portal</h3>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Continuous assessment mark entry for assigned classes, automatic 30/70 scaling, PWA offline caching, and submissions.
                </p>
                <ul className="space-y-1.5 text-[11px] text-slate-400 border-t border-slate-800/80 pt-3">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Real-time score scaling
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    PWA offline local storage
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Audit-compliant corrections
                  </li>
                </ul>
              </div>
              <button
                onClick={() => onSelectRole("TEACHER")}
                className="mt-6 w-full py-2 px-3 bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-200 rounded-lg text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5"
              >
                Launch Teacher Portal
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 4. Student Portal */}
            <div className="bg-slate-900 border border-slate-800 hover:border-sky-500/60 rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-lg hover:shadow-sky-500/5 group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Learner / Student</h3>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Protected read-only access to published terminal reports, historical trajectory across academic years, and attendance.
                </p>
                <ul className="space-y-1.5 text-[11px] text-slate-400 border-t border-slate-800/80 pt-3">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                    Published report view & print
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                    Academic history retention
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                    Class competition ranking
                  </li>
                </ul>
              </div>
              <button
                onClick={() => onSelectRole("STUDENT")}
                className="mt-6 w-full py-2 px-3 bg-slate-800 hover:bg-sky-600 hover:text-white text-slate-200 rounded-lg text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5"
              >
                Launch Student Portal
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================== */}
      {/* 4. NACCA ASSESSMENT FRAMEWORK (NPLAF) SHOWCASE */}
      {/* ====================================================================== */}
      <section className="py-16 md:py-20 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-700/50">
              National Assessment Standards
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif mt-3">
              Configurable NaCCA 30/70 Assessment Architecture
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              The platform avoids hardcoded permanent formulas. Components, scaling, and weights are dynamically configurable per key phase, level, subject, and curriculum version.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-base font-bold text-white mb-2">
                  Standard Basic / JHS Continuous Assessment Template
                </h3>
                <p className="text-xs text-slate-400 mb-6">
                  Internal SBA consists of 4 distinct task categories (15 marks each, totaling 60) scaled to 30%, combined with an end-of-term examination (100 marks) scaled to 70%.
                </p>

                <div className="space-y-3">
                  {[
                    { name: "Individual Test", max: 15, type: "Continuous SBA Task 1" },
                    { name: "Group Work", max: 15, type: "Continuous SBA Task 2" },
                    { name: "Individual Task", max: 15, type: "Continuous SBA Task 3" },
                    { name: "Project Work", max: 15, type: "Continuous SBA Task 4" },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                    >
                      <div>
                        <strong className="text-slate-200">{item.name}</strong>
                        <span className="text-slate-500 block text-[10px]">{item.type}</span>
                      </div>
                      <span className="font-mono font-bold text-indigo-400">
                        Max {item.max} Marks
                      </span>
                    </div>
                  ))}

                  <div className="flex justify-between items-center p-3 rounded-lg bg-indigo-950/70 border border-indigo-800/80 text-xs">
                    <div>
                      <strong className="text-white">End-of-Term Examination</strong>
                      <span className="text-indigo-300 block text-[10px]">
                        Scaled to 70% of Terminal Report
                      </span>
                    </div>
                    <span className="font-mono font-bold text-amber-300">
                      Max 100 Marks (70%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Grading Scale Legend */}
              <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    WAEC / NaCCA 9-Point Grading Scale
                  </h4>
                  <span className="text-[10px] text-slate-400">JHS 1 – 3</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  {[
                    { grade: "1", range: "80 – 100%", desc: "High Distinction", remark: "Exceptional / Highest" },
                    { grade: "2", range: "75 – 79.9%", desc: "Distinction", remark: "Higher / Very Good" },
                    { grade: "3", range: "70 – 74.9%", desc: "High Credit", remark: "High Credit / Good" },
                    { grade: "4", range: "65 – 69.9%", desc: "Credit", remark: "Credit / Above Average" },
                    { grade: "5", range: "60 – 64.9%", desc: "Moderate Credit", remark: "Average" },
                    { grade: "6", range: "50 – 59.9%", desc: "Pass", remark: "Low Credit / Fair" },
                    { grade: "7", range: "45 – 49.9%", desc: "Low Pass", remark: "Pass" },
                    { grade: "8", range: "40 – 44.9%", desc: "Weak Pass", remark: "Weak Pass / Support" },
                    { grade: "9", range: "0 – 39.9%", desc: "Fail / Ungraded", remark: "Fail" },
                  ].map((row) => (
                    <div
                      key={row.grade}
                      className="flex justify-between items-center py-1 px-2 rounded bg-slate-950/50 text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-indigo-900 text-indigo-200 font-bold flex items-center justify-center font-mono">
                          {row.grade}
                        </span>
                        <span className="font-mono text-slate-400">{row.range}</span>
                      </div>
                      <span className="text-slate-300 font-medium">{row.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================== */}
      {/* 5. INLINE PUBLIC REPORT VERIFIER */}
      {/* ====================================================================== */}
      <section className="py-16 md:py-20 bg-slate-950/80 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex p-3 bg-indigo-950 border border-indigo-800 rounded-2xl text-emerald-400">
            <QrCode className="w-8 h-8" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
            Verify Ghana E-SBA Terminal Reports
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Every terminal report printed by authorized schools carries a tamper-evident verification code and SHA-256 seal. Validate any certificate instantly.
          </p>

          <div className="max-w-md mx-auto">
            <button
              onClick={onOpenVerifier}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg transition-colors inline-flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Launch Official Verification Tool
            </button>
          </div>
        </div>
      </section>

      {/* ====================================================================== */}
      {/* 6. FOOTER */}
      {/* ====================================================================== */}
      <footer className="py-10 bg-slate-950 text-slate-500 text-xs border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              E
            </div>
            <span className="font-bold text-slate-300">E-SBA Ghana</span>
            <span>• Pre-Tertiary School-Based Assessment SaaS</span>
          </div>

          <div className="text-center md:text-right">
            <span>Compliant with Ghana Education Service (GES) & NaCCA standards</span>
            <div className="text-[10px] text-slate-600 mt-0.5">
              Multi-tenant architecture powered by PostgreSQL Row Level Security (RLS)
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
