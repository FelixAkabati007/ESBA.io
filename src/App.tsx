// ======================================================================================
// E-SBA Ghana — Electronic School-Based Assessment & Learner Reporting Platform
// Multi-Tenant SaaS: Main Admin | School Admin | Teacher | Student
// Fully Compliant with NaCCA Pre-Tertiary Learning Assessment Framework (NPLAF)
// ======================================================================================

import React, { useState } from "react";
import { UserRole, School, StudentProfile, TeacherProfile, AssessmentScoreRecord, ReportCard, SubscriptionException } from "./types";
import {
  DEMO_SCHOOL,
  DEMO_SUBSCRIPTION_PLANS,
  DEMO_SUBSCRIPTIONS,
  DEMO_EXCEPTIONS,
  DEMO_TEACHERS,
  DEMO_STUDENTS,
  DEMO_CLASSES,
  DEMO_STREAMS,
  DEMO_SUBJECTS,
  DEMO_TEACHER_ASSIGNMENTS,
  DEMO_ACADEMIC_YEARS,
  DEMO_TERMS,
  DEMO_SCORE_RECORDS,
  DEMO_REPORTS,
  DEMO_AUDIT_LOGS,
} from "./data/mockData";
import { DEFAULT_NACCA_SBA_TEMPLATE } from "./services/assessmentCalculator";
import { HeaderNavigation } from "./components/common/HeaderNavigation";
import { MainAdminDashboard } from "./components/admin/MainAdminDashboard";
import { SchoolAdminDashboard } from "./components/school/SchoolAdminDashboard";
import { TeacherPortal } from "./components/teacher/TeacherPortal";
import { StudentPortal } from "./components/student/StudentPortal";
import { OfficialReportCard } from "./components/reports/OfficialReportCard";
import { PublicReportVerifier } from "./components/verification/PublicReportVerifier";
import { ImportCenter } from "./components/imports/ImportCenter";
import { ShieldCheck, ArrowLeft, X } from "lucide-react";

export default function App() {
  // Current active role
  const [currentRole, setCurrentRole] = useState<UserRole>("SCHOOL_ADMIN");

  // Master State
  const [schools, setSchools] = useState<School[]>([DEMO_SCHOOL]);
  const [plans, setPlans] = useState(DEMO_SUBSCRIPTION_PLANS);
  const [subscriptions, setSubscriptions] = useState(DEMO_SUBSCRIPTIONS);
  const [exceptions, setExceptions] = useState<SubscriptionException[]>(DEMO_EXCEPTIONS);
  const [teachers, setTeachers] = useState<TeacherProfile[]>(DEMO_TEACHERS);
  const [students, setStudents] = useState<StudentProfile[]>(DEMO_STUDENTS);
  const [scores, setScores] = useState<AssessmentScoreRecord[]>(DEMO_SCORE_RECORDS);
  const [reports, setReports] = useState<ReportCard[]>(DEMO_REPORTS);
  const [auditLogs, setAuditLogs] = useState(DEMO_AUDIT_LOGS);
  const [templates, setTemplates] = useState([DEFAULT_NACCA_SBA_TEMPLATE]);

  // Modal / View states
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<StudentProfile | null>(null);
  const [showPublicVerifier, setShowPublicVerifier] = useState(false);
  const [showImportCenter, setShowImportCenter] = useState(false);

  // Active tenant school
  const currentSchool = schools[0] || DEMO_SCHOOL;
  const currentAcademicYear = DEMO_ACADEMIC_YEARS.find((y) => y.isCurrent) || DEMO_ACADEMIC_YEARS[1];
  const currentTerm = DEMO_TERMS.find((t) => t.isCurrent) || DEMO_TERMS[0];

  // Handlers for Main Admin
  const handleAddSchool = (newSchoolData: Partial<School>) => {
    const newSchool: School = {
      id: `SCH_${Date.now()}`,
      name: newSchoolData.name || "New Basic School",
      shortCode: newSchoolData.shortCode || "NBS",
      email: newSchoolData.email || "info@school.edu.gh",
      phone: newSchoolData.phone || "0244000000",
      address: "Pokuase, Greater Accra",
      district: newSchoolData.district || "Ga West Municipal",
      region: newSchoolData.region || "Greater Accra Region",
      motto: "Knowledge and Integrity",
      headTeacherName: newSchoolData.headTeacherName || "Headmaster",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSchools((prev) => [newSchool, ...prev]);

    // Log action
    setAuditLogs((prev) => [
      {
        id: `LOG_${Date.now()}`,
        userId: "USR_MAIN_ADMIN",
        userName: "Chief Director K. Agyeman",
        userRole: "MAIN_ADMIN",
        action: "CREATE",
        entityType: "schools",
        entityId: newSchool.id,
        newValue: `Created new school tenant: ${newSchool.name}`,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const handleGrantException = (schoolId: string, excData: Partial<SubscriptionException>) => {
    const newExc: SubscriptionException = {
      id: `EXC_${Date.now()}`,
      schoolId,
      exceptionType: excData.exceptionType || "FULL_FREE_ACCESS",
      reason: excData.reason || "Approved exception grant",
      grantedBy: excData.grantedBy || "Platform Super Admin",
      grantedAt: new Date().toISOString(),
      startDate: new Date().toISOString(),
      permanent: excData.permanent || false,
      status: "ACTIVE",
    };
    setExceptions((prev) => [newExc, ...prev]);
  };

  // Handlers for School Admin
  const handleAddStudent = (newStuData: Partial<StudentProfile>) => {
    const newStudent: StudentProfile = {
      id: `STU_${Date.now()}`,
      schoolId: currentSchool.id,
      studentNumber: newStuData.studentNumber || `ESBA/2026/${students.length + 1}`,
      admissionNumber: newStuData.admissionNumber || `ADM/2026/${students.length + 1}`,
      surname: newStuData.surname || "Learner",
      firstName: newStuData.firstName || "Name",
      gender: newStuData.gender || "Male",
      dateOfBirth: newStuData.dateOfBirth || "2012-01-01",
      nationality: "Ghanaian",
      parentName: newStuData.parentName || "Parent",
      parentContact: newStuData.parentContact || "0240000000",
      homeAddress: newStuData.homeAddress || "Greater Accra",
      admissionDate: new Date().toISOString().split("T")[0],
      currentLevelId: "B7",
      currentClassId: newStuData.currentClassId || "CLS_JHS1",
      currentStreamId: "STR_JHS1_A",
      status: "Active",
      createdAt: new Date().toISOString(),
    };
    setStudents((prev) => [newStudent, ...prev]);
  };

  const handleImportStudents = (imported: Partial<StudentProfile>[]) => {
    const formatted: StudentProfile[] = imported.map((item, idx) => ({
      id: `STU_IMP_${Date.now()}_${idx}`,
      schoolId: currentSchool.id,
      studentNumber: item.studentNumber || `ESBA/2026/${students.length + idx + 1}`,
      admissionNumber: item.admissionNumber || `ADM/2026/${students.length + idx + 1}`,
      surname: item.surname || "Learner",
      firstName: item.firstName || "Name",
      middleName: item.middleName || "",
      gender: item.gender || "Male",
      dateOfBirth: item.dateOfBirth || "2012-01-01",
      nationality: "Ghanaian",
      parentName: item.parentName || "Parent",
      parentContact: item.parentContact || "0240000000",
      homeAddress: "Greater Accra",
      admissionDate: new Date().toISOString().split("T")[0],
      currentLevelId: "B7",
      currentClassId: "CLS_JHS1",
      currentStreamId: "STR_JHS1_A",
      status: "Active",
      createdAt: new Date().toISOString(),
    }));
    setStudents((prev) => [...formatted, ...prev]);
  };

  const handleApproveResults = (classId: string, subjectId: string) => {
    setScores((prev) =>
      prev.map((s) =>
        s.classId === classId && s.subjectId === subjectId
          ? { ...s, status: "APPROVED", updatedAt: new Date().toISOString() }
          : s
      )
    );
  };

  const handlePublishReports = (classId: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.classId === classId
          ? { ...r, published: true, publishedAt: new Date().toISOString() }
          : r
      )
    );
  };

  // Handlers for Teacher
  const handleSaveScores = (updatedScores: AssessmentScoreRecord[]) => {
    setScores((prev) => {
      const copy = [...prev];
      updatedScores.forEach((newRec) => {
        const idx = copy.findIndex(
          (c) => c.studentId === newRec.studentId && c.subjectId === newRec.subjectId
        );
        if (idx >= 0) {
          copy[idx] = newRec;
        } else {
          copy.push(newRec);
        }
      });
      return copy;
    });
  };

  const handleSubmitScores = (subjectId: string, classId: string) => {
    setScores((prev) =>
      prev.map((s) =>
        s.classId === classId && s.subjectId === subjectId
          ? { ...s, status: "SUBMITTED", updatedAt: new Date().toISOString() }
          : s
      )
    );
  };

  // Lookups for reports
  const studentForReport = selectedStudentForReport || students[0];
  const reportForSelectedStudent =
    reports.find((r) => r.studentId === studentForReport?.id) || reports[0];
  const scoresForSelectedStudent = scores.filter(
    (s) => s.studentId === studentForReport?.id
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* 1. Global Navigation Bar */}
      <HeaderNavigation
        currentRole={currentRole}
        onRoleChange={(role) => {
          setCurrentRole(role);
          setSelectedStudentForReport(null);
        }}
        onOpenVerifier={() => setShowPublicVerifier(true)}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Render View based on Active User Role */}
        {currentRole === "MAIN_ADMIN" && (
          <MainAdminDashboard
            schools={schools}
            plans={plans}
            subscriptions={subscriptions}
            exceptions={exceptions}
            auditLogs={auditLogs}
            templates={templates}
            onAddSchool={handleAddSchool}
            onGrantException={handleGrantException}
            onUpdateTemplate={(tpl) => setTemplates([tpl])}
          />
        )}

        {currentRole === "SCHOOL_ADMIN" && (
          <SchoolAdminDashboard
            school={currentSchool}
            students={students}
            teachers={teachers}
            classes={DEMO_CLASSES}
            streams={DEMO_STREAMS}
            subjects={DEMO_SUBJECTS}
            assignments={DEMO_TEACHER_ASSIGNMENTS}
            academicYears={DEMO_ACADEMIC_YEARS}
            terms={DEMO_TERMS}
            scoreRecords={scores}
            reportCards={reports}
            onAddStudent={handleAddStudent}
            onAddTeacher={(tch) => {}}
            onApproveResults={handleApproveResults}
            onPublishReports={handlePublishReports}
            onOpenImportCenter={() => setShowImportCenter(true)}
            onOpenReportCard={(st) => setSelectedStudentForReport(st)}
          />
        )}

        {currentRole === "TEACHER" && (
          <TeacherPortal
            teacherName="Mr. Kofi Mensah"
            assignments={DEMO_TEACHER_ASSIGNMENTS}
            subjects={DEMO_SUBJECTS}
            classes={DEMO_CLASSES}
            streams={DEMO_STREAMS}
            students={students}
            initialScores={scores}
            onSaveScores={handleSaveScores}
            onSubmitScores={handleSubmitScores}
            onPreviewReport={(st) => setSelectedStudentForReport(st)}
          />
        )}

        {currentRole === "STUDENT" && (
          <StudentPortal
            student={students[0]}
            school={currentSchool}
            academicYear={currentAcademicYear}
            term={currentTerm}
            reportCard={reports[0]}
            scores={scores.filter((s) => s.studentId === students[0].id)}
            subjects={DEMO_SUBJECTS}
            onOpenReportCard={() => setSelectedStudentForReport(students[0])}
          />
        )}
      </main>

      {/* 3. Official Report Card Modal */}
      {selectedStudentForReport && (
        <div className="fixed inset-0 z-50 bg-black/60 overflow-y-auto p-4 flex justify-center items-start print:p-0 print:bg-white print:fixed">
          <div className="relative w-full max-w-4xl my-8 print:my-0">
            <button
              onClick={() => setSelectedStudentForReport(null)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 font-semibold flex items-center gap-1 text-sm print:hidden"
            >
              <X className="w-5 h-5" />
              Close Preview
            </button>
            <OfficialReportCard
              school={currentSchool}
              student={selectedStudentForReport}
              academicYear={currentAcademicYear}
              term={currentTerm}
              reportCard={reportForSelectedStudent}
              scores={scoresForSelectedStudent}
              subjects={DEMO_SUBJECTS}
            />
          </div>
        </div>
      )}

      {/* 4. Public Report Verifier Modal */}
      {showPublicVerifier && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center">
          <div className="relative w-full max-w-xl">
            <button
              onClick={() => setShowPublicVerifier(false)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 font-semibold flex items-center gap-1 text-sm"
            >
              <X className="w-5 h-5" />
              Close
            </button>
            <PublicReportVerifier initialCode="ESBA-2026-9F72A81" />
          </div>
        </div>
      )}

      {/* 5. Excel Import Center Modal */}
      {showImportCenter && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center overflow-y-auto">
          <div className="relative w-full max-w-4xl my-8">
            <ImportCenter
              onImportStudents={handleImportStudents}
              onClose={() => setShowImportCenter(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
