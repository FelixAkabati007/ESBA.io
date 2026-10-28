// ======================================================================================
// E-SBA Ghana — Institutional Academic Data Export Center (Section 39)
// Provides instant export of Students, Staff, SBA Scores, Broad Sheets, and Attendance
// ======================================================================================

import React, { useState } from "react";
import {
  StudentProfile,
  TeacherProfile,
  SchoolClass,
  Subject,
  AssessmentScoreRecord,
  AttendanceRecord,
} from "../../types";
import { importExportService } from "../../services/importExportService";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Users,
  GraduationCap,
  Calendar,
  Layers,
  CheckCircle,
} from "lucide-react";

interface ExportCenterProps {
  students: StudentProfile[];
  teachers: TeacherProfile[];
  classes: SchoolClass[];
  subjects: Subject[];
  scores: AssessmentScoreRecord[];
  attendance: AttendanceRecord[];
  onClose: () => void;
}

export const ExportCenter: React.FC<ExportCenterProps> = ({
  students,
  teachers,
  classes,
  subjects,
  scores,
  attendance,
  onClose,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const triggerNotify = (msg: string) => {
    setDownloadSuccess(msg);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  // 1. Export Students
  const handleExportStudents = (format: "XLSX" | "CSV") => {
    const data = students.map((s) => ({
      "Student Number": s.studentNumber,
      "Admission Number": s.admissionNumber,
      Surname: s.surname,
      "First Name": s.firstName,
      "Middle Name": s.middleName || "",
      Gender: s.gender,
      "Date of Birth": s.dateOfBirth,
      Class: s.currentClassId,
      "Parent Name": s.parentName,
      "Parent Contact": s.parentContact,
      Status: s.status,
    }));

    if (format === "XLSX") {
      importExportService.exportDataToExcel("ESBA_Master_Students_Register", "Students", data);
    } else {
      importExportService.exportDataToCSV("ESBA_Master_Students_Register", data);
    }
    triggerNotify(`Exported ${students.length} student records (${format}).`);
  };

  // 2. Export Teachers
  const handleExportTeachers = (format: "XLSX" | "CSV") => {
    const data = teachers.map((t) => ({
      "Staff ID": t.staffId,
      "Full Name": t.fullName,
      Gender: t.gender,
      Phone: t.phone,
      Email: t.email,
      Specialization: t.specialization || "General",
      Qualification: t.qualification || "B.Ed",
      Status: t.isActive ? "Active" : "Inactive",
    }));

    if (format === "XLSX") {
      importExportService.exportDataToExcel("ESBA_Staff_Directory", "Teachers", data);
    } else {
      importExportService.exportDataToCSV("ESBA_Staff_Directory", data);
    }
    triggerNotify(`Exported ${teachers.length} teacher profiles (${format}).`);
  };

  // 3. Export Assessment Scores Broad Sheet
  const handleExportBroadSheet = (format: "XLSX" | "CSV") => {
    const data = scores.map((sc) => {
      const st = students.find((s) => s.id === sc.studentId);
      const sb = subjects.find((s) => s.id === sc.subjectId);
      return {
        "Student Number": st?.studentNumber || sc.studentId,
        "Student Name": `${st?.surname || ""}, ${st?.firstName || ""}`,
        Subject: sb?.name || sc.subjectId,
        "SBA Raw (60)": sc.internalTotal,
        "SBA Scaled (30%)": sc.internalScaled,
        "Exam Raw (100)": sc.examRaw,
        "Exam Scaled (70%)": sc.examScaled,
        "Final Total (100)": sc.finalTotal,
        Grade: sc.grade,
        Descriptor: sc.descriptor,
        Position: sc.subjectPosition,
        Status: sc.status,
      };
    });

    if (format === "XLSX") {
      importExportService.exportDataToExcel("ESBA_Continuous_Assessment_Broadsheet", "Broadsheet", data);
    } else {
      importExportService.exportDataToCSV("ESBA_Continuous_Assessment_Broadsheet", data);
    }
    triggerNotify(`Exported terminal marks broad sheet (${format}).`);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-700" />
            Institutional Academic Data Export Center
          </h2>
          <p className="text-xs text-slate-500">
            Export validated student rosters, teacher directories, SBA broad sheets, and attendance (Section 39).
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 font-bold text-lg"
        >
          ×
        </button>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          {downloadSuccess}
        </div>
      )}

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Student Register */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs">Learner Master Database</h4>
              <p className="text-[11px] text-slate-500">
                Full directory of {students.length} learners across Basic 1 to JHS 3 with guardian details.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              onClick={() => handleExportStudents("XLSX")}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded text-xs font-semibold inline-flex items-center gap-1 shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              Excel (.xlsx)
            </button>
            <button
              onClick={() => handleExportStudents("CSV")}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded text-xs font-semibold inline-flex items-center gap-1 shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              CSV (.csv)
            </button>
          </div>
        </div>

        {/* 2. Staff Directory */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs">Teaching Staff & Assignments</h4>
              <p className="text-[11px] text-slate-500">
                Registered teachers, GES staff IDs, qualifications, and class-subject mappings.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              onClick={() => handleExportTeachers("XLSX")}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded text-xs font-semibold inline-flex items-center gap-1 shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              Excel (.xlsx)
            </button>
            <button
              onClick={() => handleExportTeachers("CSV")}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded text-xs font-semibold inline-flex items-center gap-1 shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              CSV (.csv)
            </button>
          </div>
        </div>

        {/* 3. Terminal Marks Broadsheet */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs">Assessment Broadsheet</h4>
              <p className="text-[11px] text-slate-500">
                Consolidated continuous assessment (30% SBA + 70% Exam) marks and grade descriptors.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              onClick={() => handleExportBroadSheet("XLSX")}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded text-xs font-semibold inline-flex items-center gap-1 shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              Excel (.xlsx)
            </button>
            <button
              onClick={() => handleExportBroadSheet("CSV")}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded text-xs font-semibold inline-flex items-center gap-1 shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              CSV (.csv)
            </button>
          </div>
        </div>

        {/* 4. Attendance Records */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs">Terminal Attendance Register</h4>
              <p className="text-[11px] text-slate-500">
                Summary of total school days, days present, unexcused absences, and percentages.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              onClick={() => handleExportStudents("XLSX")}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded text-xs font-semibold inline-flex items-center gap-1 shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              Excel (.xlsx)
            </button>
            <button
              onClick={() => handleExportStudents("CSV")}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded text-xs font-semibold inline-flex items-center gap-1 shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              CSV (.csv)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
