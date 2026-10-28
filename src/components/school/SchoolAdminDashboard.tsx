// ======================================================================================
// E-SBA Ghana — School Admin / Head of Institution Portal
// Controls Learner Information, Teacher Assignments, Moderation, Approvals & Publishing
// ======================================================================================

import React, { useState } from "react";
import {
  School,
  StudentProfile,
  TeacherProfile,
  SchoolClass,
  Stream,
  Subject,
  TeacherSubjectAssignment,
  AcademicYear,
  Term,
  AssessmentScoreRecord,
  ReportCard,
} from "../../types";
import {
  Users,
  GraduationCap,
  Calendar,
  Layers,
  CheckCircle,
  FileText,
  Printer,
  Upload,
  Download,
  Settings,
  Plus,
  Search,
  Check,
  X,
  FileCheck,
  ShieldCheck,
  Wand2,
  AlertCircle,
} from "lucide-react";
import { formatOrdinalPosition } from "../../services/assessmentCalculator";
import { AttendanceModule } from "../attendance/AttendanceModule";
import { CorrectionRequest, AttendanceRecord } from "../../types";

interface SchoolAdminDashboardProps {
  school: School;
  students: StudentProfile[];
  teachers: TeacherProfile[];
  classes: SchoolClass[];
  streams: Stream[];
  subjects: Subject[];
  assignments: TeacherSubjectAssignment[];
  academicYears: AcademicYear[];
  terms: Term[];
  scoreRecords: AssessmentScoreRecord[];
  reportCards: ReportCard[];
  correctionRequests?: CorrectionRequest[];
  attendanceRecords?: AttendanceRecord[];
  onAddStudent: (student: Partial<StudentProfile>) => void;
  onAddTeacher: (teacher: Partial<TeacherProfile>) => void;
  onApproveResults: (classId: string, subjectId: string) => void;
  onPublishReports: (classId: string) => void;
  onOpenImportCenter: () => void;
  onOpenExportCenter?: () => void;
  onOpenReportCard: (student: StudentProfile) => void;
  onOpenBulkPrint?: (classId: string) => void;
  onSaveAttendance?: (records: AttendanceRecord[]) => void;
  onApproveCorrection?: (requestId: string) => void;
}

export const SchoolAdminDashboard: React.FC<SchoolAdminDashboardProps> = ({
  school,
  students,
  teachers,
  classes,
  streams,
  subjects,
  assignments,
  academicYears,
  terms,
  scoreRecords,
  reportCards,
  correctionRequests = [],
  attendanceRecords = [],
  onAddStudent,
  onAddTeacher,
  onApproveResults,
  onPublishReports,
  onOpenImportCenter,
  onOpenExportCenter,
  onOpenReportCard,
  onOpenBulkPrint,
  onSaveAttendance,
  onApproveCorrection,
}) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "students" | "teachers" | "classes" | "moderation" | "attendance" | "reports" | "wizard"
  >("overview");

  const [studentSearch, setStudentSearch] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("ALL");

  // New Student Modal
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStuSurname, setNewStuSurname] = useState("");
  const [newStuFirstName, setNewStuFirstName] = useState("");
  const [newStuGender, setNewStuGender] = useState<"Male" | "Female">("Male");
  const [newStuDOB, setNewStuDOB] = useState("2012-05-15");
  const [newStuClass, setNewStuClass] = useState<string>(classes[0]?.id || "CLS_JHS1");
  const [newStuParentContact, setNewStuParentContact] = useState("0244123456");

  // Setup Wizard State
  const [wizardStep, setWizardStep] = useState(1);

  const filteredStudents = students.filter((s) => {
    const matchesSearch = `${s.surname} ${s.firstName} ${s.studentNumber}`
      .toLowerCase()
      .includes(studentSearch.toLowerCase());
    const matchesClass = selectedClassFilter === "ALL" || s.currentClassId === selectedClassFilter;
    return matchesSearch && matchesClass;
  });

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStuSurname || !newStuFirstName) return;

    const nextNum = students.length + 1;
    const studentNo = `ESBA/2026/${String(nextNum).padStart(3, "0")}`;
    const admNo = `ADM/2026/${String(nextNum + 80).padStart(3, "0")}`;

    onAddStudent({
      schoolId: school.id,
      studentNumber: studentNo,
      admissionNumber: admNo,
      surname: newStuSurname,
      firstName: newStuFirstName,
      gender: newStuGender,
      dateOfBirth: newStuDOB,
      nationality: "Ghanaian",
      parentName: "Parent / Guardian",
      parentContact: newStuParentContact,
      homeAddress: "Pokuase, Greater Accra",
      admissionDate: new Date().toISOString().split("T")[0],
      currentLevelId: "B7",
      currentClassId: newStuClass,
      currentStreamId: "STR_JHS1_A",
      status: "Active",
    });

    setShowAddStudentModal(false);
    setNewStuSurname("");
    setNewStuFirstName("");
  };

  return (
    <div className="space-y-6">
      {/* ====================================================================== */}
      {/* 1. SCHOOL ADMIN NAVIGATION TABS */}
      {/* ====================================================================== */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "overview", label: "School Overview", icon: GraduationCap },
            { id: "students", label: "Learners / Students", icon: Users },
            { id: "teachers", label: "Teachers & Assignments", icon: Users },
            { id: "classes", label: "Classes & Streams", icon: Layers },
            { id: "moderation", label: "Results Moderation", icon: FileCheck },
            { id: "attendance", label: "Attendance Register", icon: Calendar },
            { id: "reports", label: "Reports & Bulk Print", icon: Printer },
            { id: "wizard", label: "Setup Wizard", icon: Wand2 },
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

        <div className="flex flex-wrap items-center gap-2">
          {onOpenExportCenter && (
            <button
              onClick={onOpenExportCenter}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-indigo-700" />
              Export Center
            </button>
          )}
          <button
            onClick={onOpenImportCenter}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            Import Center
          </button>
          <button
            onClick={() => setShowAddStudentModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Register Learner
          </button>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* 2. TAB: OVERVIEW */}
      {/* ====================================================================== */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 text-white p-5 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{school.name}</h2>
                <span className="text-[11px] bg-indigo-800/80 px-2.5 py-0.5 rounded-full border border-indigo-700">
                  {school.shortCode}
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-1">
                Head of Institution: <strong>{school.headTeacherName}</strong> • {school.district}, {school.region}
              </p>
            </div>
            <div className="text-right text-xs">
              <span className="text-indigo-300 block">Current Academic Term:</span>
              <strong className="text-sm font-semibold">2026/2027 • Term 1</strong>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                Total Enrolled Learners
              </span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
                {students.length}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 inline-block">
                Basic 1 to JHS 3
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                Teaching Staff
              </span>
              <span className="text-2xl font-extrabold text-indigo-700 mt-1 block">
                {teachers.length}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 inline-block">
                Assigned to Classes & Subjects
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                Active Classes & Streams
              </span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
                {classes.length} Classes / {streams.length} Streams
              </span>
              <span className="text-[10px] text-slate-400 mt-1 inline-block">
                Key Phases 2, 3, 4
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                Pending Moderation
              </span>
              <span className="text-2xl font-extrabold text-amber-600 mt-1 block">
                {scoreRecords.filter((s) => s.status === "SUBMITTED").length}
              </span>
              <span className="text-[10px] text-amber-700 font-semibold mt-1 inline-block">
                Awaiting Headteacher Approval
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 3. TAB: STUDENTS DIRECTORY */}
      {/* ====================================================================== */}
      {activeTab === "students" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student or roll no..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50"
              >
                <option value="ALL">All Classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-500">
              Showing <strong>{filteredStudents.length}</strong> of {students.length} learners
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-[11px]">
                  <th className="p-3">Student No</th>
                  <th className="p-3">Admission No</th>
                  <th className="p-3">Learner Name</th>
                  <th className="p-3">Gender</th>
                  <th className="p-3">Class</th>
                  <th className="p-3">Parent Contact</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((st) => {
                  const cls = classes.find((c) => c.id === st.currentClassId);
                  return (
                    <tr key={st.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-indigo-950">
                        {st.studentNumber}
                      </td>
                      <td className="p-3 font-mono text-slate-600">{st.admissionNumber}</td>
                      <td className="p-3 font-semibold text-slate-900">
                        {st.surname}, {st.firstName} {st.middleName || ""}
                      </td>
                      <td className="p-3 text-slate-700">{st.gender}</td>
                      <td className="p-3 font-medium text-slate-800">{cls?.name || "JHS 1"}</td>
                      <td className="p-3 text-slate-600">{st.parentContact}</td>
                      <td className="p-3">
                        <span className="font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded text-[10px]">
                          {st.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => onOpenReportCard(st)}
                          className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded inline-flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Report Card
                        </button>
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
      {/* 4. TAB: TEACHERS & ASSIGNMENTS */}
      {/* ====================================================================== */}
      {activeTab === "teachers" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Teachers & Subject Assignments
              </h3>
              <p className="text-xs text-slate-500">
                Strict teacher-class assignment mapping ensures teachers can only view and enter marks for their assigned classes.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-[11px]">
                  <th className="p-3">Staff ID</th>
                  <th className="p-3">Teacher Name</th>
                  <th className="p-3">Specialization</th>
                  <th className="p-3">Assigned Class & Stream</th>
                  <th className="p-3">Assigned Subject</th>
                  <th className="p-3">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.map((asg) => {
                  const tch = teachers.find((t) => t.id === asg.teacherId);
                  const cls = classes.find((c) => c.id === asg.classId);
                  const str = streams.find((s) => s.id === asg.streamId);
                  const sbj = subjects.find((s) => s.id === asg.subjectId);

                  return (
                    <tr key={asg.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-indigo-900">
                        {tch?.staffId || "STAFF-01"}
                      </td>
                      <td className="p-3 font-semibold text-slate-900">{tch?.fullName}</td>
                      <td className="p-3 text-slate-600">{tch?.specialization}</td>
                      <td className="p-3 font-medium text-slate-800">
                        {cls?.name} {str ? `(${str.streamName})` : ""}
                      </td>
                      <td className="p-3 font-semibold text-indigo-950">{sbj?.name}</td>
                      <td className="p-3">
                        <span className="font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded text-[10px]">
                          {asg.role.replace(/_/g, " ")}
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
      {/* 5. TAB: CLASSES & STREAMS */}
      {/* ====================================================================== */}
      {activeTab === "classes" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Academic Levels: Basic 1 through JHS 3
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {classes.map((c) => {
              const classLearners = students.filter((s) => s.currentClassId === c.id);
              const classStreams = streams.filter((st) => st.classId === c.id);

              return (
                <div key={c.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-indigo-950 text-sm">{c.name}</h4>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded">
                      {c.keyPhase}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <div>
                      Enrolled: <strong>{classLearners.length} learners</strong>
                    </div>
                    <div>
                      Streams:{" "}
                      <strong>
                        {classStreams.length > 0
                          ? classStreams.map((s) => s.streamName).join(", ")
                          : "Single Stream"}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 6. TAB: MODERATION & APPROVALS */}
      {/* ====================================================================== */}
      {activeTab === "moderation" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Assessment Results Moderation & Headteacher Approval
            </h3>
            <p className="text-xs text-slate-500">
              Submitted continuous assessment marks cannot be published to students or parents until approved by the Head of Institution.
            </p>
          </div>

          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                JHS 1 (Basic 7) • Mathematics
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Submitted by: <strong>Mr. Kofi Mensah</strong> • 42 Learner records submitted
              </p>
              <span className="mt-2 inline-block text-[10px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
                Status: UNDER_REVIEW
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onApproveResults("CLS_JHS1", "SUB_MATH")}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm"
              >
                <Check className="w-4 h-4" />
                Approve & Affix Signature Seal
              </button>
            </div>
          </div>

          {/* Section 24: Formal Score Correction Requests */}
          {correctionRequests && correctionRequests.length > 0 && (
            <div className="border border-amber-200 rounded-lg p-4 bg-amber-50/50 space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                <h4 className="font-bold text-amber-950 text-xs uppercase tracking-wider">
                  Pending Score Correction Requests (Section 24)
                </h4>
              </div>
              <div className="space-y-2">
                {correctionRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 bg-white border border-amber-200 rounded-lg text-xs flex justify-between items-center"
                  >
                    <div>
                      <div className="font-bold text-slate-900">
                        Correction for Component: {req.componentId}
                      </div>
                      <div className="text-slate-600 mt-0.5">
                        Old Score: <span className="font-mono font-bold line-through text-slate-400">{req.oldValue}</span> → Proposed: <span className="font-mono font-bold text-emerald-700">{req.proposedValue}</span>
                      </div>
                      <div className="text-slate-500 italic mt-0.5">
                        Reason: "{req.reason}" — Requested by: {req.requestedBy}
                      </div>
                    </div>
                    {onApproveCorrection && req.status === "PENDING" && (
                      <button
                        onClick={() => onApproveCorrection(req.id)}
                        className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded text-xs font-semibold inline-flex items-center gap-1 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Authorize & Re-Version
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================== */}
      {/* 6.5 TAB: ATTENDANCE REGISTER (SECTION 35) */}
      {/* ====================================================================== */}
      {activeTab === "attendance" && (
        <AttendanceModule
          students={students}
          classes={classes}
          streams={streams}
          academicYearLabel={academicYears.find((y) => y.isCurrent)?.yearLabel || "2026/2027"}
          termName={terms.find((t) => t.isCurrent)?.termName || "Term 1"}
          onSaveAttendance={(records) => {
            if (onSaveAttendance) onSaveAttendance(records);
          }}
        />
      )}

      {/* ====================================================================== */}
      {/* 7. TAB: REPORTS & BULK PRINT */}
      {/* ====================================================================== */}
      {activeTab === "reports" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Terminal Learner Reports & Bulk A4 Printing
              </h3>
              <p className="text-xs text-slate-500">
                Publish results to the student portal and generate print-ready A4 reports.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {onOpenBulkPrint && (
                <button
                  onClick={() => onOpenBulkPrint("CLS_JHS1")}
                  className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <Printer className="w-4 h-4 text-indigo-700" />
                  Bulk Print Class Reports
                </button>
              )}
              <button
                onClick={() => onPublishReports("CLS_JHS1")}
                className="px-3.5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                Publish All JHS 1 Reports
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-[11px]">
                  <th className="p-3">Verification Code</th>
                  <th className="p-3">Learner</th>
                  <th className="p-3">Class</th>
                  <th className="p-3">Overall Pos</th>
                  <th className="p-3">Signatures</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Print Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportCards.map((rep) => {
                  const st = students.find((s) => s.id === rep.studentId);
                  return (
                    <tr key={rep.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-indigo-900">
                        {rep.verificationCode}
                      </td>
                      <td className="p-3 font-semibold text-slate-900">
                        {st?.surname}, {st?.firstName}
                      </td>
                      <td className="p-3 text-slate-700">JHS 1A</td>
                      <td className="p-3 font-bold text-slate-800">
                        {formatOrdinalPosition(rep.overallPosition)} of {rep.numberOnRoll}
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Teacher & Head Signed
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-indigo-900 bg-indigo-100/70 px-2 py-0.5 rounded text-[10px]">
                          {rep.published ? "PUBLISHED" : "DRAFT"}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => st && onOpenReportCard(st)}
                          className="px-3 py-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded text-xs font-semibold inline-flex items-center gap-1 shadow-2xs"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Print A4
                        </button>
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
      {/* 8. TAB: SETUP WIZARD (SECTION 45) */}
      {/* ====================================================================== */}
      {activeTab === "wizard" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-3xl mx-auto space-y-6">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
              Section 45 • School Setup Wizard
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-2">
              Guided Ghanaian Institutional Onboarding Wizard
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Follow the 12-step configuration process to establish academic years, classes, NaCCA assessment weights, and staff assignments.
            </p>
          </div>

          <div className="grid grid-cols-6 gap-2 text-center text-xs">
            {[
              "1. Profile",
              "2. Academic Year",
              "3. Terms",
              "4. Levels",
              "5. Streams",
              "6. Subjects",
              "7. Teachers",
              "8. Students",
              "9. Assignments",
              "10. SBA Template",
              "11. Reports",
              "12. Finish",
            ].map((stepLabel, idx) => {
              const stepNum = idx + 1;
              const isCurrent = wizardStep === stepNum;
              const isDone = wizardStep > stepNum;
              return (
                <div
                  key={idx}
                  onClick={() => setWizardStep(stepNum)}
                  className={`p-2 rounded border cursor-pointer transition-colors ${
                    isCurrent
                      ? "border-indigo-600 bg-indigo-50 font-bold text-indigo-900"
                      : isDone
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 bg-slate-50 text-slate-400"
                  }`}
                >
                  <div className="text-[10px]">{stepLabel}</div>
                </div>
              );
            })}
          </div>

          <div className="p-5 rounded-lg border border-slate-200 bg-slate-50">
            <h4 className="font-bold text-slate-900 text-sm mb-2">
              Step {wizardStep}: Assessment & Academic Configuration
            </h4>
            <p className="text-xs text-slate-600 mb-4">
              Your institution is configured with the standard NaCCA 30% Continuous Assessment (SBA) / 70% End-of-Term Examination template.
            </p>
            <div className="flex justify-between items-center pt-4 border-t border-slate-200">
              <button
                disabled={wizardStep === 1}
                onClick={() => setWizardStep((prev) => Math.max(1, prev - 1))}
                className="px-4 py-1.5 border rounded text-xs font-semibold text-slate-700 disabled:opacity-40"
              >
                Previous Step
              </button>
              <button
                onClick={() => setWizardStep((prev) => Math.min(12, prev + 1))}
                className="px-4 py-1.5 bg-indigo-700 text-white rounded text-xs font-semibold hover:bg-indigo-800"
              >
                {wizardStep === 12 ? "Complete Setup" : "Next Step"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* MODAL: ADD STUDENT */}
      {/* ====================================================================== */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Register New Learner</h3>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateStudent} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block">Surname:</label>
                  <input
                    type="text"
                    required
                    value={newStuSurname}
                    onChange={(e) => setNewStuSurname(e.target.value)}
                    placeholder="e.g. Mensah"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded mt-1 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block">First Name:</label>
                  <input
                    type="text"
                    required
                    value={newStuFirstName}
                    onChange={(e) => setNewStuFirstName(e.target.value)}
                    placeholder="e.g. Kwame"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded mt-1 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block">Gender:</label>
                  <select
                    value={newStuGender}
                    onChange={(e) => setNewStuGender(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded mt-1 text-xs"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block">Date of Birth:</label>
                  <input
                    type="date"
                    required
                    value={newStuDOB}
                    onChange={(e) => setNewStuDOB(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded mt-1 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block">Assigned Class:</label>
                  <select
                    value={newStuClass}
                    onChange={(e) => setNewStuClass(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded mt-1 text-xs"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block">Parent Contact:</label>
                  <input
                    type="text"
                    required
                    value={newStuParentContact}
                    onChange={(e) => setNewStuParentContact(e.target.value)}
                    placeholder="e.g. 0244123456"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded mt-1 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 border rounded text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-700 text-white rounded font-semibold hover:bg-indigo-800"
                >
                  Save & Enroll Learner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
