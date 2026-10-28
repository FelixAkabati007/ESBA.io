// ======================================================================================
// E-SBA Ghana — Official Terminal Learner Report Card
// Complies with NaCCA National Pre-Tertiary Learning Assessment Framework (NPLAF)
// Features: A4 Print Layout, Cryptographic Signature Seals, QR & Verification Code
// ======================================================================================

import React from "react";
import {
  School,
  StudentProfile,
  AcademicYear,
  Term,
  ReportCard,
  AssessmentScoreRecord,
  Subject,
} from "../../types";
import { formatOrdinalPosition } from "../../services/assessmentCalculator";
import { CheckCircle2, ShieldCheck, Printer, QrCode } from "lucide-react";

interface OfficialReportCardProps {
  school: School;
  student: StudentProfile;
  academicYear: AcademicYear;
  term: Term;
  reportCard: ReportCard;
  scores: AssessmentScoreRecord[];
  subjects: Subject[];
  onPrint?: () => void;
}

export const OfficialReportCard: React.FC<OfficialReportCardProps> = ({
  school,
  student,
  academicYear,
  term,
  reportCard,
  scores,
  subjects,
  onPrint,
}) => {
  const getSubjectName = (subjectId: string) => {
    return subjects.find((s) => s.id === subjectId)?.name || subjectId;
  };

  const getSubjectCode = (subjectId: string) => {
    return subjects.find((s) => s.id === subjectId)?.code || "";
  };

  const averageScore =
    scores.length > 0
      ? (scores.reduce((acc, curr) => acc + curr.finalTotal, 0) / scores.length).toFixed(1)
      : "0.0";

  return (
    <div className="bg-white text-slate-900 mx-auto max-w-4xl p-6 md:p-8 rounded-lg shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0 print:max-w-none">
      {/* Print Trigger Toolbar (hidden when printing) */}
      <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-200 print:hidden">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Official NaCCA Certified Terminal Report
        </div>
        <button
          onClick={onPrint || (() => window.print())}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-md text-sm font-medium shadow transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print / Download PDF (A4)
        </button>
      </div>

      {/* ====================================================================== */}
      {/* 1. OFFICIAL SCHOOL HEADER */}
      {/* ====================================================================== */}
      <div className="flex items-center justify-between border-b-2 border-indigo-900 pb-4 mb-4">
        <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center">
          {school.logoUrl ? (
            <img
              src={school.logoUrl}
              alt={school.name}
              className="max-h-20 max-w-20 object-contain"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-indigo-900 text-white flex items-center justify-center font-bold text-xl">
              {school.shortCode}
            </div>
          )}
        </div>

        <div className="text-center flex-1 px-4">
          <h1 className="text-xl md:text-2xl font-extrabold uppercase tracking-tight text-indigo-950 font-serif">
            {school.name}
          </h1>
          <p className="text-xs italic text-slate-600 font-medium">
            "{school.motto || "Knowledge, Discipline and Service"}"
          </p>
          <p className="text-xs text-slate-700 mt-0.5">
            {school.address} • {school.district}, {school.region}
          </p>
          <p className="text-xs text-slate-600">
            Tel: {school.phone} | Reg: {school.gesRegistrationNumber || "GES Registered"}
          </p>
          <div className="mt-2 inline-block bg-indigo-900 text-white px-4 py-0.5 text-xs font-bold uppercase tracking-wider rounded-sm">
            Terminal Learner Progress Report Card
          </div>
        </div>

        <div className="w-20 h-20 flex-shrink-0 flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded p-1 text-center">
          <QrCode className="w-10 h-10 text-slate-800" />
          <span className="text-[9px] font-mono font-semibold text-slate-600 mt-1">
            {reportCard.verificationCode.slice(-7)}
          </span>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* 2. LEARNER & SESSION METADATA */}
      {/* ====================================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-50 p-3 rounded border border-slate-200 text-xs mb-4">
        <div>
          <span className="text-slate-500 block uppercase text-[10px] font-semibold">Learner Name:</span>
          <span className="font-bold text-slate-900 text-sm">
            {student.surname}, {student.firstName} {student.middleName || ""}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block uppercase text-[10px] font-semibold">Student / Roll No:</span>
          <span className="font-semibold text-slate-900">{student.studentNumber}</span>
        </div>
        <div>
          <span className="text-slate-500 block uppercase text-[10px] font-semibold">Admission No:</span>
          <span className="font-semibold text-slate-900">{student.admissionNumber}</span>
        </div>
        <div>
          <span className="text-slate-500 block uppercase text-[10px] font-semibold">Gender:</span>
          <span className="font-semibold text-slate-900">{student.gender}</span>
        </div>

        <div className="pt-2 border-t border-slate-200">
          <span className="text-slate-500 block uppercase text-[10px] font-semibold">Academic Year:</span>
          <span className="font-bold text-indigo-950">{academicYear.yearLabel}</span>
        </div>
        <div className="pt-2 border-t border-slate-200">
          <span className="text-slate-500 block uppercase text-[10px] font-semibold">Term:</span>
          <span className="font-bold text-indigo-950">{term.termName}</span>
        </div>
        <div className="pt-2 border-t border-slate-200">
          <span className="text-slate-500 block uppercase text-[10px] font-semibold">Class & Stream:</span>
          <span className="font-bold text-indigo-950">
            {student.currentClassId.replace("CLS_", "")} ({student.currentStreamId?.slice(-1) || "A"})
          </span>
        </div>
        <div className="pt-2 border-t border-slate-200">
          <span className="text-slate-500 block uppercase text-[10px] font-semibold">Number on Roll:</span>
          <span className="font-bold text-slate-900">{reportCard.numberOnRoll || 42}</span>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* 3. ASSESSMENT SCORES & RESULTS TABLE */}
      {/* ====================================================================== */}
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-left border-collapse border border-slate-300 text-xs">
          <thead>
            <tr className="bg-indigo-950 text-white text-center">
              <th rowSpan={2} className="border border-indigo-900 p-2 text-left font-semibold">
                Subject
              </th>
              <th colSpan={4} className="border border-indigo-900 p-1 font-semibold text-[11px]">
                SBA Components (15 Each)
              </th>
              <th rowSpan={2} className="border border-indigo-900 p-1 font-semibold text-[11px]">
                Internal Total<br />(60)
              </th>
              <th rowSpan={2} className="border border-indigo-900 p-1 font-semibold text-[11px]">
                SBA Scaled<br />(30%)
              </th>
              <th rowSpan={2} className="border border-indigo-900 p-1 font-semibold text-[11px]">
                Exam Raw<br />(100)
              </th>
              <th rowSpan={2} className="border border-indigo-900 p-1 font-semibold text-[11px]">
                Exam Scaled<br />(70%)
              </th>
              <th rowSpan={2} className="border border-indigo-900 p-1 font-semibold text-[11px] bg-indigo-900">
                Final Total<br />(100%)
              </th>
              <th rowSpan={2} className="border border-indigo-900 p-1 font-semibold text-[11px]">
                Grade
              </th>
              <th rowSpan={2} className="border border-indigo-900 p-1 font-semibold text-[11px]">
                Pos
              </th>
              <th rowSpan={2} className="border border-indigo-900 p-2 text-left font-semibold">
                Remark / Descriptor
              </th>
            </tr>
            <tr className="bg-indigo-900 text-white text-[10px] text-center">
              <th className="border border-indigo-800 p-1">Test (15)</th>
              <th className="border border-indigo-800 p-1">Group (15)</th>
              <th className="border border-indigo-800 p-1">Task (15)</th>
              <th className="border border-indigo-800 p-1">Project (15)</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((score, idx) => {
              const comp = score.componentScores || {};
              const test = comp["comp_ind_test"] ?? comp["IND_TEST"] ?? "-";
              const grp = comp["comp_grp_work"] ?? comp["GRP_WORK"] ?? "-";
              const task = comp["comp_ind_task"] ?? comp["IND_TASK"] ?? "-";
              const prj = comp["comp_prj_work"] ?? comp["PRJ_WORK"] ?? "-";

              return (
                <tr
                  key={score.id || idx}
                  className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}
                >
                  <td className="border border-slate-300 p-2 font-medium text-slate-900">
                    {getSubjectName(score.subjectId)}
                    <span className="text-[10px] text-slate-500 block">
                      {getSubjectCode(score.subjectId)}
                    </span>
                  </td>
                  <td className="border border-slate-300 p-1 text-center">{test}</td>
                  <td className="border border-slate-300 p-1 text-center">{grp}</td>
                  <td className="border border-slate-300 p-1 text-center">{task}</td>
                  <td className="border border-slate-300 p-1 text-center">{prj}</td>
                  <td className="border border-slate-300 p-1 text-center font-semibold text-slate-700">
                    {score.internalTotal}
                  </td>
                  <td className="border border-slate-300 p-1 text-center font-semibold text-indigo-700">
                    {score.internalScaled}
                  </td>
                  <td className="border border-slate-300 p-1 text-center">{score.examRaw}</td>
                  <td className="border border-slate-300 p-1 text-center font-semibold text-indigo-700">
                    {score.examScaled}
                  </td>
                  <td className="border border-slate-300 p-1 text-center font-bold text-slate-950 bg-indigo-50">
                    {score.finalTotal}
                  </td>
                  <td className="border border-slate-300 p-1 text-center font-bold text-indigo-900">
                    {score.grade}
                  </td>
                  <td className="border border-slate-300 p-1 text-center font-medium">
                    {formatOrdinalPosition(score.subjectPosition || 1)}
                  </td>
                  <td className="border border-slate-300 p-2 text-slate-700 text-[11px]">
                    {score.remark || score.descriptor}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ====================================================================== */}
      {/* 4. PERFORMANCE SUMMARY & ATTENDANCE */}
      {/* ====================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs">
          <span className="text-slate-500 font-semibold block text-[10px] uppercase">
            Overall Term Performance:
          </span>
          <div className="flex justify-between items-center mt-1">
            <span>Average Score:</span>
            <span className="font-extrabold text-indigo-900 text-sm">{averageScore}%</span>
          </div>
          <div className="flex justify-between items-center mt-0.5">
            <span>Overall Class Position:</span>
            <span className="font-extrabold text-slate-900">
              {formatOrdinalPosition(reportCard.overallPosition || 1)} of {reportCard.numberOnRoll || 42}
            </span>
          </div>
        </div>

        <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs">
          <span className="text-slate-500 font-semibold block text-[10px] uppercase">
            Learner Attendance:
          </span>
          <div className="flex justify-between items-center mt-1">
            <span>Days Present:</span>
            <span className="font-bold text-emerald-800">
              {reportCard.attendancePresent} of {reportCard.attendanceTotal} days
            </span>
          </div>
          <div className="flex justify-between items-center mt-0.5">
            <span>Attendance Rate:</span>
            <span className="font-bold text-slate-900">
              {reportCard.attendanceTotal > 0
                ? `${Math.round((reportCard.attendancePresent / reportCard.attendanceTotal) * 100)}%`
                : "100%"}
            </span>
          </div>
        </div>

        <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs">
          <span className="text-slate-500 font-semibold block text-[10px] uppercase">
            Session Dates:
          </span>
          <div className="flex justify-between items-center mt-1">
            <span>Term Vacation:</span>
            <span className="font-semibold text-slate-800">{term.vacationDate || "18th Dec 2026"}</span>
          </div>
          <div className="flex justify-between items-center mt-0.5">
            <span>Next Term Reopening:</span>
            <span className="font-semibold text-indigo-900">{term.reopeningDate || "12th Jan 2027"}</span>
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* 5. REMARKS & DIGITAL SIGNATURE SEALS */}
      {/* ====================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-300 pt-3 mb-4 text-xs">
        {/* Class Teacher Section */}
        <div className="border border-slate-200 rounded p-3 bg-slate-50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-800 uppercase text-[11px]">
                Class Teacher's Remark:
              </span>
              {reportCard.classTeacherSigned && (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Digitally Signed
                </span>
              )}
            </div>
            <p className="italic text-slate-700 mb-2">
              "{reportCard.classTeacherRemark || "Exemplary academic effort and character."}"
            </p>
            <div className="text-[11px] text-slate-600">
              <strong>Conduct:</strong> {reportCard.conductRemark || "Courteous and diligent."}
            </div>
            <div className="text-[11px] text-slate-600">
              <strong>Interest:</strong> {reportCard.interestRemark || "Active in Science & Technology club."}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-dashed border-slate-300 flex items-end justify-between">
            <div>
              <span className="text-[10px] text-slate-500 block">Class Teacher:</span>
              <span className="font-semibold text-slate-800 text-[11px]">Mr. Kofi Mensah</span>
            </div>
            <div className="h-10 flex items-center">
              <span className="font-serif italic text-indigo-900 border-b border-slate-500 px-3">
                K. Mensah
              </span>
            </div>
          </div>
        </div>

        {/* Head of Institution Section */}
        <div className="border border-slate-200 rounded p-3 bg-slate-50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-800 uppercase text-[11px]">
                Head of Institution's Remark:
              </span>
              {reportCard.headTeacherSigned && (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Cryptographic Seal
                </span>
              )}
            </div>
            <p className="italic text-slate-700 mb-2">
              "{reportCard.headTeacherRemark || "An impressive standard of performance. Keep up the high standard."}"
            </p>
            {reportCard.promotedTo && (
              <div className="text-[11px] text-indigo-950 font-bold bg-indigo-100 px-2 py-0.5 rounded inline-block">
                Promotion: {reportCard.promotedTo}
              </div>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-dashed border-slate-300 flex items-end justify-between">
            <div>
              <span className="text-[10px] text-slate-500 block">Headteacher / Principal:</span>
              <span className="font-semibold text-slate-800 text-[11px]">
                {school.headTeacherName || "Rev. Dr. Emmanuel Kwesi Boateng"}
              </span>
            </div>
            <div className="h-10 flex items-center">
              {school.headTeacherSignatureUrl ? (
                <img
                  src={school.headTeacherSignatureUrl}
                  alt="Headteacher signature"
                  className="max-h-8 object-contain"
                />
              ) : (
                <span className="font-serif italic text-indigo-950 border-b border-slate-500 px-3">
                  E. K. Boateng (Head)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* 6. SECURITY & VERIFICATION FOOTER */}
      {/* ====================================================================== */}
      <div className="border-t border-slate-200 pt-3 text-[10px] text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-700" />
          <span>
            Verification Code: <strong className="text-slate-800 font-mono">{reportCard.verificationCode}</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span className="font-mono text-[9px] text-slate-400 truncate max-w-xs" title={reportCard.resultHash}>
            SHA-256: {reportCard.resultHash.slice(0, 16)}...
          </span>
        </div>
        <div className="text-right">
          Online verification: <span className="text-indigo-700 underline font-mono">esbaghana.gov.gh/verify</span> • Ver: {reportCard.version}.0
        </div>
      </div>
    </div>
  );
};
