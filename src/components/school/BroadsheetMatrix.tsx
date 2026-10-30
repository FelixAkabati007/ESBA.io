// ======================================================================================
// E-SBA Ghana — Master Class Broadsheet Matrix (Composite Assessment Register)
// Section 39 Compliant: Tabulates entire class performance across all curriculum subjects
// Computes Grand Totals, Terminal Averages, Class Competition Rank, and Instant XLSX Export
// ======================================================================================

import React, { useState, useMemo } from "react";
import {
  StudentProfile,
  Subject,
  SchoolClass,
  Stream,
  AssessmentScoreRecord,
  School,
  AcademicYear,
  Term,
} from "../../types";
import {
  Download,
  Printer,
  Search,
} from "lucide-react";
import * as XLSX from "xlsx";
import { useToast } from "../../context/ToastContext";

interface BroadsheetMatrixProps {
  school: School;
  academicYear: AcademicYear;
  term: Term;
  classes: SchoolClass[];
  streams: Stream[];
  subjects: Subject[];
  students: StudentProfile[];
  scoreRecords: AssessmentScoreRecord[];
  onOpenReportCard?: (student: StudentProfile) => void;
}

export const BroadsheetMatrix: React.FC<BroadsheetMatrixProps> = ({
  school,
  academicYear,
  term,
  classes,
  streams,
  subjects,
  students,
  scoreRecords,
  onOpenReportCard,
}) => {
  const { success } = useToast();
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || "CLS_JHS1");
  const [searchQuery, setSearchQuery] = useState("");

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  // Filter learners belonging to current class
  const classStudents = useMemo(() => {
    return students
      .filter((s) => s.currentClassId === selectedClassId)
      .filter((s) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          s.firstName.toLowerCase().includes(q) ||
          s.surname.toLowerCase().includes(q) ||
          s.studentNumber.toLowerCase().includes(q)
        );
      });
  }, [students, selectedClassId, searchQuery]);

  // Build matrix data: student -> subject -> score record
  const matrixData = useMemo(() => {
    const rawRows = classStudents.map((st) => {
      const studentScores: Record<string, AssessmentScoreRecord | undefined> = {};
      let totalScoreSum = 0;
      let subjectsCount = 0;

      subjects.forEach((sub) => {
        const record = scoreRecords.find(
          (s) => s.studentId === st.id && s.subjectId === sub.id
        );
        studentScores[sub.id] = record;
        if (record) {
          totalScoreSum += record.finalTotal;
          subjectsCount += 1;
        }
      });

      const averageScore = subjectsCount > 0 ? Number((totalScoreSum / subjectsCount).toFixed(1)) : 0;

      return {
        student: st,
        scores: studentScores,
        totalScoreSum: Number(totalScoreSum.toFixed(1)),
        averageScore,
        subjectsCount,
        rank: 1, // Computed next
      };
    });

    // Sort by total score descending for competition ranking
    rawRows.sort((a, b) => b.totalScoreSum - a.totalScoreSum);

    // Compute standard competition rank (1, 2, 2, 4...)
    let currentRank = 1;
    for (let i = 0; i < rawRows.length; i++) {
      if (i > 0 && rawRows[i].totalScoreSum < rawRows[i - 1].totalScoreSum) {
        currentRank = i + 1;
      }
      rawRows[i].rank = currentRank;
    }

    return rawRows;
  }, [classStudents, subjects, scoreRecords]);

  // Export Broadsheet to Excel
  const handleExportExcel = () => {
    const headers = [
      "Rank",
      "Student Number",
      "Full Name",
      "Gender",
      ...subjects.map((s) => `${s.name} (Total)`),
      ...subjects.map((s) => `${s.name} (Grade)`),
      "Grand Total",
      "Average (%)",
    ];

    const dataRows = matrixData.map((row) => [
      row.rank,
      row.student.studentNumber,
      `${row.student.surname}, ${row.student.firstName}`,
      row.student.gender,
      ...subjects.map((sub) => row.scores[sub.id]?.finalTotal ?? "-"),
      ...subjects.map((sub) => row.scores[sub.id]?.grade ?? "-"),
      row.totalScoreSum,
      row.averageScore,
    ]);

    const ws = XLSX.utils.aoa_to_sheet([
      [`${school.name} — Terminal Broadsheet`],
      [`Class: ${currentClass?.name || ""} | Academic Year: ${academicYear.yearLabel} | Term: ${term.termName}`],
      [],
      headers,
      ...dataRows,
    ]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Broadsheet");
    XLSX.writeFile(
      wb,
      `Broadsheet_${(currentClass?.name || "Class").replace(/\s+/g, "_")}_${term.termName.replace(/\s+/g, "_")}.xlsx`
    );
    success("Broadsheet Exported", `Saved official matrix for ${currentClass?.name}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden font-sans">
      {/* Header & Controls Bar */}
      <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded border border-amber-800">
              NaCCA Composite Register
            </span>
            <span className="text-xs text-slate-400">
              {academicYear.yearLabel} • {term.termName}
            </span>
          </div>
          <h2 className="text-xl font-black font-serif text-white mt-1">
            Class Terminal Broadsheet — {currentClass?.name}
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Composite master record compiling all 30% Continuous SBA + 70% Terminal Examination scores
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export XLSX</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Broadsheet</span>
          </button>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <label className="font-bold text-slate-700">Select Class:</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-600 outline-none"
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} ({cls.keyPhase})
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter learner in broadsheet..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:ring-2 focus:ring-indigo-600 outline-none"
          />
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold">
              <th className="p-3 sticky left-0 bg-slate-100 z-10 w-12 text-center">Pos</th>
              <th className="p-3 sticky left-12 bg-slate-100 z-10 w-28">Learner No</th>
              <th className="p-3 sticky left-40 bg-slate-100 z-10 min-w-[160px]">Student Name</th>
              <th className="p-3 text-center w-12">Sex</th>
              {subjects.map((sub) => (
                <th key={sub.id} className="p-3 text-center min-w-[90px] border-l border-slate-200">
                  <span className="block truncate max-w-[85px] mx-auto" title={sub.name}>
                    {sub.code || sub.name.substring(0, 4)}
                  </span>
                  <span className="text-[9px] text-slate-400 font-normal lowercase block">
                    (sba/exam)
                  </span>
                </th>
              ))}
              <th className="p-3 text-right bg-indigo-50/80 font-black text-indigo-950 border-l border-indigo-100 min-w-[80px]">
                Total
              </th>
              <th className="p-3 text-right bg-indigo-50/80 font-black text-indigo-950 min-w-[70px]">
                Avg (%)
              </th>
              {onOpenReportCard && <th className="p-3 text-center w-20">Report</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {matrixData.length === 0 ? (
              <tr>
                <td
                  colSpan={subjects.length + 6}
                  className="p-8 text-center text-slate-400 text-xs"
                >
                  No students found in {currentClass?.name}.
                </td>
              </tr>
            ) : (
              matrixData.map((row) => (
                <tr
                  key={row.student.id}
                  className="hover:bg-slate-50 transition-colors group"
                >
                  {/* Position */}
                  <td className="p-3 text-center font-bold text-slate-700 sticky left-0 bg-white group-hover:bg-slate-50 z-10">
                    {row.rank === 1 ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">
                        1
                      </span>
                    ) : (
                      row.rank
                    )}
                  </td>

                  {/* Student Number */}
                  <td className="p-3 font-mono font-medium text-slate-600 sticky left-12 bg-white group-hover:bg-slate-50 z-10">
                    {row.student.studentNumber}
                  </td>

                  {/* Full Name */}
                  <td className="p-3 font-bold text-slate-900 sticky left-40 bg-white group-hover:bg-slate-50 z-10">
                    {row.student.surname}, {row.student.firstName}
                  </td>

                  {/* Gender */}
                  <td className="p-3 text-center text-slate-500 font-semibold">
                    {row.student.gender === "Male" ? "M" : "F"}
                  </td>

                  {/* Subject Scores */}
                  {subjects.map((sub) => {
                    const score = row.scores[sub.id];
                    return (
                      <td
                        key={sub.id}
                        className="p-3 text-center border-l border-slate-100 font-mono text-[11px]"
                      >
                        {score ? (
                          <div>
                            <span className="font-bold text-slate-800">
                              {score.finalTotal}
                            </span>
                            <span className="text-[10px] text-indigo-600 ml-1 font-semibold">
                              ({score.grade})
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    );
                  })}

                  {/* Grand Total */}
                  <td className="p-3 text-right font-mono font-extrabold text-indigo-900 bg-indigo-50/40 border-l border-indigo-100">
                    {row.totalScoreSum}
                  </td>

                  {/* Terminal Average */}
                  <td className="p-3 text-right font-mono font-extrabold text-indigo-950 bg-indigo-50/40">
                    {row.averageScore}%
                  </td>

                  {/* Report Card Button */}
                  {onOpenReportCard && (
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onOpenReportCard(row.student)}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Summary */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500">
        <div>
          Showing <strong>{matrixData.length}</strong> enrolled learners across{" "}
          <strong>{subjects.length}</strong> active NaCCA subjects
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> SBA Scaled to 30%
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Exam Scaled to 70%
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> WAEC Competition Rank
          </span>
        </div>
      </div>
    </div>
  );
};
