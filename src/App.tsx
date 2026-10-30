// ======================================================================================
// E-SBA Ghana — Electronic School-Based Assessment & Learner Reporting Platform
// Multi-Tenant SaaS: Main Admin | School Admin | Teacher | Student
// Fully Compliant with NaCCA Pre-Tertiary Learning Assessment Framework (NPLAF)
// ======================================================================================

import React, { useState } from "react";
import {
  UserRole,
  School,
  StudentProfile,
  TeacherProfile,
  AssessmentScoreRecord,
  ReportCard,
  SubscriptionException,
  AttendanceRecord,
  CorrectionRequest,
} from "./types";
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
  DEMO_ATTENDANCE,
} from "./data/mockData";
import {
  DEFAULT_NACCA_SBA_TEMPLATE,
  DEFAULT_NINE_POINT_GRADING_SCALE,
  calculateAssessmentScores,
} from "./services/assessmentCalculator";
import { MainHomePage } from "./components/home/MainHomePage";
import { HeaderNavigation } from "./components/common/HeaderNavigation";
import { MainAdminDashboard } from "./components/admin/MainAdminDashboard";
import { SchoolAdminDashboard } from "./components/school/SchoolAdminDashboard";
import { TeacherPortal } from "./components/teacher/TeacherPortal";
import { StudentPortal } from "./components/student/StudentPortal";
import { OfficialReportCard } from "./components/reports/OfficialReportCard";
import { BulkClassReports } from "./components/reports/BulkClassReports";
import { PublicReportVerifier } from "./components/verification/PublicReportVerifier";
import { ImportCenter } from "./components/imports/ImportCenter";
import { ExportCenter } from "./components/exports/ExportCenter";
import { ScoreCorrectionModal } from "./components/corrections/ScoreCorrectionModal";
import { PasswordRecoveryModal } from "./components/auth/PasswordRecoveryModal";
import { SignInModal } from "./components/auth/SignInModal";
import { SchoolRegistrationModal } from "./components/auth/SchoolRegistrationModal";
import { LegalModal } from "./components/legal/LegalModal";
import { AppShell } from "./components/layout/AppShell";
import { BroadsheetMatrix } from "./components/school/BroadsheetMatrix";
import { ToastProvider } from "./context/ToastContext";
import { ShieldCheck, ArrowLeft, X } from "lucide-react";

export default function App() {
  // Navigation View & Role State
  const [currentView, setCurrentView] = useState<"HOME" | "PORTAL">("HOME");
  const [currentRole, setCurrentRole] = useState<UserRole>("SCHOOL_ADMIN");
  const [activeSidebarTab, setActiveSidebarTab] = useState("overview");

  // Master State
  const [schools, setSchools] = useState<School[]>([DEMO_SCHOOL]);
  const [plans, setPlans] = useState(DEMO_SUBSCRIPTION_PLANS);
  const [subscriptions, setSubscriptions] = useState(DEMO_SUBSCRIPTIONS);
  const [exceptions, setExceptions] = useState<SubscriptionException[]>(DEMO_EXCEPTIONS);
  const [teachers, setTeachers] = useState<TeacherProfile[]>(DEMO_TEACHERS);
  const [students, setStudents] = useState<StudentProfile[]>(DEMO_STUDENTS);
  const [scores, setScores] = useState<AssessmentScoreRecord[]>(DEMO_SCORE_RECORDS);
  const [reports, setReports] = useState<ReportCard[]>(DEMO_REPORTS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(DEMO_ATTENDANCE);
  const [auditLogs, setAuditLogs] = useState(DEMO_AUDIT_LOGS);
  const [templates, setTemplates] = useState([DEFAULT_NACCA_SBA_TEMPLATE]);
  const [correctionRequests, setCorrectionRequests] = useState<CorrectionRequest[]>([]);

  // Modal / View states
  const [selectedStudentForReport, setSelectedStudentForReport] = useState<StudentProfile | null>(null);
  const [showBulkPrintClassId, setShowBulkPrintClassId] = useState<string | null>(null);
  const [showPublicVerifier, setShowPublicVerifier] = useState(false);
  const [showImportCenter, setShowImportCenter] = useState(false);
  const [showExportCenter, setShowExportCenter] = useState(false);
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSchoolRegistration, setShowSchoolRegistration] = useState(false);
  const [authTargetRole, setAuthTargetRole] = useState<UserRole>("SCHOOL_ADMIN");
  const [activeLegalModal, setActiveLegalModal] = useState<"PRIVACY" | "TERMS" | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("head@achimota-basic.edu.gh");
  const [activeCorrectionTarget, setActiveCorrectionTarget] = useState<{
    scoreRecord: AssessmentScoreRecord;
    student: StudentProfile;
  } | null>(null);

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

  const handleSaveAttendance = (records: AttendanceRecord[]) => {
    setAttendance((prev) => {
      const copy = [...prev];
      records.forEach((rec) => {
        const idx = copy.findIndex((a) => a.studentId === rec.studentId && a.date === rec.date);
        if (idx >= 0) {
          copy[idx] = rec;
        } else {
          copy.push(rec);
        }
      });
      return copy;
    });
  };

  // Handlers for Teacher Score Entry
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

  // Handlers for Score Corrections (Section 24)
  const handleRequestCorrection = (reqData: Partial<CorrectionRequest>) => {
    const newReq: CorrectionRequest = {
      id: `CORR_${Date.now()}`,
      schoolId: reqData.schoolId || currentSchool.id,
      scoreRecordId: reqData.scoreRecordId || "",
      studentId: reqData.studentId || "",
      subjectId: reqData.subjectId || "",
      componentId: reqData.componentId || "comp_end_exam",
      oldValue: reqData.oldValue || 0,
      proposedValue: reqData.proposedValue || 0,
      reason: reqData.reason || "",
      requestedBy: reqData.requestedBy || "Teacher",
      requestedAt: new Date().toISOString(),
      status: "PENDING",
    };
    setCorrectionRequests((prev) => [newReq, ...prev]);

    setAuditLogs((prev) => [
      {
        id: `LOG_${Date.now()}`,
        userId: "USR_TEACHER_1",
        userName: "Mr. Kofi Mensah",
        userRole: "TEACHER",
        action: "UPDATE",
        entityType: "score_corrections",
        entityId: newReq.id,
        newValue: `Requested correction: ${newReq.oldValue} -> ${newReq.proposedValue} (${newReq.reason})`,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const handleApproveCorrection = (requestId: string) => {
    const targetReq = correctionRequests.find((r) => r.id === requestId);
    if (!targetReq) return;

    setScores((prev) =>
      prev.map((s) => {
        if (s.id === targetReq.scoreRecordId || (s.studentId === targetReq.studentId && s.subjectId === targetReq.subjectId)) {
          const compScores = { ...s.componentScores };
          let newExamRaw = s.examRaw;
          if (targetReq.componentId === "comp_end_exam") {
            newExamRaw = targetReq.proposedValue;
          } else {
            compScores[targetReq.componentId] = targetReq.proposedValue;
          }

          const calc = calculateAssessmentScores(DEFAULT_NACCA_SBA_TEMPLATE, DEFAULT_NINE_POINT_GRADING_SCALE, {
            ...compScores,
            comp_end_exam: newExamRaw,
          });

          return {
            ...s,
            componentScores: compScores,
            internalTotal: calc.internalTotal,
            internalScaled: calc.internalScaled,
            examRaw: calc.examRaw,
            examScaled: calc.examScaled,
            finalTotal: calc.finalTotal,
            grade: calc.grade,
            descriptor: calc.descriptor,
            remark: calc.remark,
            version: s.version + 1,
            status: "AMENDED",
            updatedAt: new Date().toISOString(),
          };
        }
        return s;
      })
    );

    setCorrectionRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, status: "APPROVED", approvedBy: "Head of Institution", approvedAt: new Date().toISOString() }
          : r
      )
    );

    setReports((prev) =>
      prev.map((rep) =>
        rep.studentId === targetReq.studentId
          ? {
              ...rep,
              version: rep.version + 1,
              headTeacherSigned: false,
              classTeacherSigned: false,
              resultHash: `amended_hash_${Date.now()}`,
              updatedAt: new Date().toISOString(),
            }
          : rep
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
    <ToastProvider>
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Main View Switcher: Public Homepage OR Enterprise AppShell */}
      {currentView === "HOME" ? (
        <>
          {/* 1. Public Header Navigation */}
          <HeaderNavigation
            currentRole={currentRole}
            currentView={currentView}
            activeSchoolName={currentSchool.name}
            onRoleChange={(role) => {
              setCurrentRole(role);
              setActiveSidebarTab(role === "TEACHER" ? "marks" : "overview");
              setCurrentView("PORTAL");
              setSelectedStudentForReport(null);
              setShowBulkPrintClassId(null);
            }}
            onNavigateHome={() => setCurrentView("HOME")}
            onOpenVerifier={() => setShowPublicVerifier(true)}
            onOpenPasswordRecovery={() => setShowPasswordRecovery(true)}
            onOpenSignIn={(role) => {
              setAuthTargetRole(role || currentRole || "SCHOOL_ADMIN");
              setShowSignInModal(true);
            }}
            onOpenRegisterSchool={() => setShowSchoolRegistration(true)}
          />

          {/* 2. Commercial Landing Page */}
          <MainHomePage
            onSelectRole={(role) => {
              setCurrentRole(role);
              setActiveSidebarTab(role === "TEACHER" ? "marks" : "overview");
              setCurrentView("PORTAL");
            }}
            onOpenVerifier={() => setShowPublicVerifier(true)}
            onOpenRegister={() => setShowSchoolRegistration(true)}
            onOpenSignIn={(role) => {
              setAuthTargetRole(role || "SCHOOL_ADMIN");
              setShowSignInModal(true);
            }}
            onOpenLegal={(type) => setActiveLegalModal(type)}
          />
        </>
      ) : (
        /* 3. Enterprise AppShell Layout */
        <AppShell
          currentRole={currentRole}
          schoolName={currentSchool.name}
          schoolDistrict={currentSchool.district}
          activeTab={activeSidebarTab}
          activeViewLabel={
            activeSidebarTab === "broadsheet"
              ? "Class Broadsheet"
              : activeSidebarTab === "students"
              ? "Learners / Students"
              : activeSidebarTab === "teachers"
              ? "Teaching Staff"
              : activeSidebarTab === "moderation"
              ? "Results Moderation"
              : activeSidebarTab === "attendance"
              ? "Attendance Roll"
              : activeSidebarTab === "reports"
              ? "Report Cards"
              : activeSidebarTab === "wizard"
              ? "Setup Wizard"
              : activeSidebarTab === "marks"
              ? "Score Entry"
              : activeSidebarTab === "plans"
              ? "Subscription Plans"
              : activeSidebarTab === "schools"
              ? "Schools Directory"
              : "Overview"
          }
          academicYearLabel={currentAcademicYear.yearLabel}
          termLabel={currentTerm.termName}
          onSelectTab={(tabId) => setActiveSidebarTab(tabId)}
          onRoleChange={(role) => {
            setCurrentRole(role);
            setActiveSidebarTab(role === "TEACHER" ? "marks" : "overview");
          }}
          onNavigateHome={() => setCurrentView("HOME")}
          onOpenVerifier={() => setShowPublicVerifier(true)}
          onOpenPasswordRecovery={() => setShowPasswordRecovery(true)}
          onOpenImportCenter={() => setShowImportCenter(true)}
          onOpenExportCenter={() => setShowExportCenter(true)}
        >
          {/* Render Active View based on Active Role */}
          {currentRole === "MAIN_ADMIN" && (
            <MainAdminDashboard
              controlledTab={activeSidebarTab}
              onTabChange={setActiveSidebarTab}
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
            <>
              {activeSidebarTab === "broadsheet" ? (
                <BroadsheetMatrix
                  school={currentSchool}
                  academicYear={currentAcademicYear}
                  term={currentTerm}
                  classes={DEMO_CLASSES}
                  streams={DEMO_STREAMS}
                  subjects={DEMO_SUBJECTS}
                  students={students}
                  scoreRecords={scores}
                  onOpenReportCard={(st) => setSelectedStudentForReport(st)}
                />
              ) : (
                <SchoolAdminDashboard
                  controlledTab={activeSidebarTab}
                  onTabChange={setActiveSidebarTab}
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
                  correctionRequests={correctionRequests}
                  attendanceRecords={attendance}
                  onAddStudent={handleAddStudent}
                  onAddTeacher={(tch) => {}}
                  onApproveResults={handleApproveResults}
                  onPublishReports={handlePublishReports}
                  onOpenImportCenter={() => setShowImportCenter(true)}
                  onOpenExportCenter={() => setShowExportCenter(true)}
                  onOpenReportCard={(st) => setSelectedStudentForReport(st)}
                  onOpenBulkPrint={(classId) => setShowBulkPrintClassId(classId)}
                  onSaveAttendance={handleSaveAttendance}
                  onApproveCorrection={handleApproveCorrection}
                />
              )}
            </>
          )}

          {currentRole === "TEACHER" && (
            <>
              {activeSidebarTab === "broadsheet" ? (
                <BroadsheetMatrix
                  school={currentSchool}
                  academicYear={currentAcademicYear}
                  term={currentTerm}
                  classes={DEMO_CLASSES}
                  streams={DEMO_STREAMS}
                  subjects={DEMO_SUBJECTS}
                  students={students}
                  scoreRecords={scores}
                  onOpenReportCard={(st) => setSelectedStudentForReport(st)}
                />
              ) : (
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
                  onOpenBulkPrint={(classId) => setShowBulkPrintClassId(classId)}
                  onOpenAttendance={() => setActiveSidebarTab("attendance")}
                  onOpenCorrectionModal={(rec, st) =>
                    setActiveCorrectionTarget({ scoreRecord: rec, student: st })
                  }
                />
              )}
            </>
          )}

          {currentRole === "STUDENT" && (
            <StudentPortal
              student={studentForReport}
              school={currentSchool}
              academicYear={currentAcademicYear}
              term={currentTerm}
              reportCard={reportForSelectedStudent}
              scores={scoresForSelectedStudent}
              subjects={DEMO_SUBJECTS}
              onOpenReportCard={() => setSelectedStudentForReport(studentForReport)}
            />
          )}
        </AppShell>
      )}

      {/* 3. Official Individual Report Card Modal */}
      {selectedStudentForReport && !showBulkPrintClassId && (
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

      {/* 4. Bulk Class Reports Modal (Sections 29, 30, 60) */}
      {showBulkPrintClassId && (
        <div className="fixed inset-0 z-50 bg-slate-100 overflow-y-auto print:p-0 print:bg-white">
          <BulkClassReports
            school={currentSchool}
            students={students.filter((s) => s.currentClassId === showBulkPrintClassId)}
            academicYear={currentAcademicYear}
            term={currentTerm}
            reportCards={reports}
            scores={scores}
            subjects={DEMO_SUBJECTS}
            className={DEMO_CLASSES.find((c) => c.id === showBulkPrintClassId)?.name || "JHS 1"}
            onClose={() => setShowBulkPrintClassId(null)}
          />
        </div>
      )}

      {/* 5. Public Report Verifier Modal */}
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

      {/* 6. Excel Import Center Modal */}
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

      {/* 7. Institutional Export Center Modal (Section 39) */}
      {showExportCenter && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center overflow-y-auto">
          <div className="relative w-full max-w-3xl my-8">
            <ExportCenter
              students={students}
              teachers={teachers}
              classes={DEMO_CLASSES}
              subjects={DEMO_SUBJECTS}
              scores={scores}
              attendance={attendance}
              onClose={() => setShowExportCenter(false)}
            />
          </div>
        </div>
      )}

      {/* 8. Score Correction Request Modal (Section 24) */}
      {activeCorrectionTarget && (
        <ScoreCorrectionModal
          scoreRecord={activeCorrectionTarget.scoreRecord}
          student={activeCorrectionTarget.student}
          subjectName={
            DEMO_SUBJECTS.find((s) => s.id === activeCorrectionTarget.scoreRecord.subjectId)?.name ||
            "Mathematics"
          }
          onRequestCorrection={handleRequestCorrection}
          onClose={() => setActiveCorrectionTarget(null)}
        />
      )}

      {/* 9. Password Recovery Modal (Section 33) */}
      {showPasswordRecovery && (
        <PasswordRecoveryModal onClose={() => setShowPasswordRecovery(false)} />
      )}

      {/* 10. Commercial Sign-In & Role Authentication Modal */}
      {showSignInModal && (
        <SignInModal
          isOpen={showSignInModal}
          initialRole={authTargetRole}
          onClose={() => setShowSignInModal(false)}
          onSuccess={(role, email) => {
            setCurrentRole(role);
            setCurrentUserEmail(email);
            setShowSignInModal(false);
            setCurrentView("PORTAL");
          }}
          onOpenForgotPassword={() => {
            setShowSignInModal(false);
            setShowPasswordRecovery(true);
          }}
          onOpenRegisterSchool={() => {
            setShowSignInModal(false);
            setShowSchoolRegistration(true);
          }}
          onOpenLegal={(type) => setActiveLegalModal(type)}
        />
      )}

      {/* 11. School Onboarding & Registration Modal */}
      {showSchoolRegistration && (
        <SchoolRegistrationModal
          isOpen={showSchoolRegistration}
          onClose={() => setShowSchoolRegistration(false)}
          onRegisterSuccess={(newSchoolData, adminEmail) => {
            handleAddSchool(newSchoolData);
            setCurrentRole("SCHOOL_ADMIN");
            setCurrentUserEmail(adminEmail);
            setShowSchoolRegistration(false);
            setCurrentView("PORTAL");
          }}
          onSwitchToLogin={() => {
            setShowSchoolRegistration(false);
            setShowSignInModal(true);
          }}
        />
      )}

      {/* 12. Legal Terms & Privacy Modal */}
      {activeLegalModal && (
        <LegalModal
          type={activeLegalModal}
          onClose={() => setActiveLegalModal(null)}
        />
      )}
      </div>
    </ToastProvider>
  );
}
