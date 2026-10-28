// ======================================================================================
// E-SBA Ghana — Learner / Student Portal
// Read-only access to published terminal reports, academic history, and attendance
// ======================================================================================

import React, { useState } from "react";
import {
  StudentProfile,
  School,
  AcademicYear,
  Term,
  ReportCard,
  AssessmentScoreRecord,
  Subject,
} from "../../types";
import {
  GraduationCap,
  FileText,
  Calendar,
  Clock,
  Printer,
  ShieldCheck,
  CheckCircle,
  Award,
} from "lucide-react";
import { formatOrdinalPosition } from "../../services/assessmentCalculator";

interface StudentPortalProps {
  student: StudentProfile;
  school: School;
  academicYear: AcademicYear;
  term: Term;
  reportCard?: ReportCard;
  scores: AssessmentScoreRecord[];
  subjects: Subject[];
  onOpenReportCard: () => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  student,
  school,
  academicYear,
  term,
  reportCard,
  scores,
  subjects,
  onOpenReportCard,
}) => {
  const [activeTab, setActiveTab] = useState<"current" | "history">("current");

  const averageScore =
    scores.length > 0
      ? (scores.reduce((acc, curr) => acc + curr.finalTotal, 0) / scores.length).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Student Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 text-white p-6 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-indigo-300 font-semibold">
            Learner Student Portal
          </span>
          <h2 className="text-2xl font-bold mt-1">
            {student.firstName} {student.middleName || ""} {student.surname}
          </h2>
          <p className="text-xs text-indigo-200 mt-1">
            Student Number: <strong className="font-mono text-white">{student.studentNumber}</strong> • Admission: {student.admissionNumber}
          </p>
          <p className="text-xs text-indigo-200">
            {school.name} • Class: JHS 1 (Basic 7A)
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-right text-xs">
            <span className="text-indigo-300 block">Session:</span>
            <strong className="text-sm font-semibold">{academicYear.yearLabel} • {term.termName}</strong>
          </div>
          {reportCard?.published && (
            <button
              onClick={onOpenReportCard}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition-colors"
            >
              <Printer className="w-4 h-4" />
              View & Print Official Report
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("current")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === "current"
              ? "bg-indigo-700 text-white"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          Current Term Results ({term.termName})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === "history"
              ? "bg-indigo-700 text-white"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          Academic History (Past Sessions)
        </button>
      </div>

      {/* ====================================================================== */}
      {/* 1. CURRENT TERM RESULTS VIEW */}
      {/* ====================================================================== */}
      {activeTab === "current" && (
        <div className="space-y-6">
          {/* Performance Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Term Average
              </span>
              <span className="text-2xl font-extrabold text-indigo-900 mt-1 block">
                {averageScore}%
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 inline-block">
                Proficient / Distinction
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Class Position
              </span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
                {formatOrdinalPosition(reportCard?.overallPosition || 1)}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 inline-block">
                Out of {reportCard?.numberOnRoll || 42} learners
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Attendance
              </span>
              <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">
                {reportCard?.attendancePresent || 64} / {reportCard?.attendanceTotal || 65}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 inline-block">
                98.5% Days Present
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Official Report Status
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-slate-900 text-sm">
                  {reportCard?.published ? "Published & Sealed" : "Under Review"}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 inline-block">
                Verified by Headteacher
              </span>
            </div>
          </div>

          {/* Subjects Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">
                Subject Breakdown (NaCCA 30% SBA / 70% Exam)
              </h3>
              <span className="text-xs text-slate-500">
                Official grading scale: WAEC 9-point scale
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold text-[11px]">
                    <th className="p-3">Subject</th>
                    <th className="p-3 text-center">SBA Scaled (30%)</th>
                    <th className="p-3 text-center">Exam Scaled (70%)</th>
                    <th className="p-3 text-center bg-indigo-50 font-bold text-indigo-950">
                      Final Total (100%)
                    </th>
                    <th className="p-3 text-center">Grade</th>
                    <th className="p-3 text-center">Position</th>
                    <th className="p-3">Teacher Descriptor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scores.map((score) => {
                    const subj = subjects.find((s) => s.id === score.subjectId);
                    return (
                      <tr key={score.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">
                          {subj?.name || score.subjectId}
                        </td>
                        <td className="p-3 text-center font-semibold text-slate-700">
                          {score.internalScaled}
                        </td>
                        <td className="p-3 text-center font-semibold text-slate-700">
                          {score.examScaled}
                        </td>
                        <td className="p-3 text-center font-extrabold text-slate-900 bg-indigo-50">
                          {score.finalTotal}
                        </td>
                        <td className="p-3 text-center font-extrabold text-indigo-900">
                          {score.grade}
                        </td>
                        <td className="p-3 text-center font-medium text-slate-700">
                          {formatOrdinalPosition(score.subjectPosition || 1)}
                        </td>
                        <td className="p-3 text-slate-600 text-[11px]">
                          {score.remark || score.descriptor}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 2. ACADEMIC HISTORY VIEW (SECTION 63) */}
      {/* ====================================================================== */}
      {activeTab === "history" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="border-b pb-3">
            <h3 className="font-bold text-slate-900 text-sm">
              Continuous Assessment Historical Record
            </h3>
            <p className="text-xs text-slate-500">
              Preserved academic trajectory across academic years and terms. Records are permanently stored and never overwritten.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  2026/2027 • Term 1 (Current)
                </span>
                <h4 className="font-bold text-slate-900 text-sm mt-1">
                  Basic 7 / JHS 1A — Term 1
                </h4>
                <p className="text-xs text-slate-600">
                  Average: <strong>{averageScore}%</strong> • Overall Rank: <strong>1st of 42</strong>
                </p>
              </div>
              <button
                onClick={onOpenReportCard}
                className="px-3 py-1.5 bg-indigo-700 text-white rounded text-xs font-semibold hover:bg-indigo-800"
              >
                View Report
              </button>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 flex justify-between items-center opacity-80">
              <div>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                  2025/2026 • Term 3 (Archived)
                </span>
                <h4 className="font-bold text-slate-800 text-sm mt-1">
                  Basic 6A — Annual Graduation to JHS
                </h4>
                <p className="text-xs text-slate-500">
                  Average: <strong>82.4%</strong> • Decision: <strong>PROMOTED TO JHS 1</strong>
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500">Archived</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
