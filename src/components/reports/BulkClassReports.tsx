// ======================================================================================
// E-SBA Ghana — Bulk Class Report Cards Printing & Multi-Page A4 Engine (Sections 29, 30, 60)
// Supports multi-learner selection, page breaks, and batch printing for entire classes
// ======================================================================================

import React, { useState } from "react";
import {
  School,
  StudentProfile,
  AcademicYear,
  Term,
  ReportCard,
  AssessmentScoreRecord,
  Subject,
} from "../../types";
import { OfficialReportCard } from "./OfficialReportCard";
import { Printer, CheckSquare, Square, X, ArrowLeft, Download } from "lucide-react";

interface BulkClassReportsProps {
  school: School;
  students: StudentProfile[];
  academicYear: AcademicYear;
  term: Term;
  reportCards: ReportCard[];
  scores: AssessmentScoreRecord[];
  subjects: Subject[];
  className: string;
  onClose: () => void;
}

export const BulkClassReports: React.FC<BulkClassReportsProps> = ({
  school,
  students,
  academicYear,
  term,
  reportCards,
  scores,
  subjects,
  className,
  onClose,
}) => {
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(
    new Set(students.map((s) => s.id))
  );

  const toggleSelectStudent = (id: string) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedStudentIds(new Set(students.map((s) => s.id)));
  };

  const deselectAll = () => {
    setSelectedStudentIds(new Set());
  };

  const handlePrint = () => {
    window.print();
  };

  const studentsToPrint = students.filter((s) => selectedStudentIds.has(s.id));

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 print:p-0 print:bg-white">
      {/* Top Controls Bar (Hidden when printing) */}
      <div className="max-w-5xl mx-auto bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Bulk Terminal Report Printing — {className}
            </h2>
            <p className="text-xs text-slate-500">
              Selected: <strong>{selectedStudentIds.size}</strong> of {students.length} learners
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={selectAll}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-xs font-semibold"
          >
            Select All
          </button>
          <button
            onClick={deselectAll}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-xs font-semibold"
          >
            Clear Selection
          </button>
          <button
            onClick={handlePrint}
            disabled={selectedStudentIds.size === 0}
            className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            Print Selected Reports ({selectedStudentIds.size} A4 Pages)
          </button>
        </div>
      </div>

      {/* Printable Multi-Page Container */}
      <div className="max-w-4xl mx-auto space-y-8 print:space-y-0">
        {studentsToPrint.map((student, idx) => {
          const studentReport =
            reportCards.find((r) => r.studentId === student.id) || reportCards[0];
          const studentScores = scores.filter((s) => s.studentId === student.id);

          return (
            <div
              key={student.id}
              className="print:break-after-page print:page-break relative"
              style={{ pageBreakAfter: "always" }}
            >
              <OfficialReportCard
                school={school}
                student={student}
                academicYear={academicYear}
                term={term}
                reportCard={studentReport}
                scores={studentScores}
                subjects={subjects}
                onPrint={handlePrint}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
