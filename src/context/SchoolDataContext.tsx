// ======================================================================================
// E-SBA Ghana — Central School Data & Assessment State Context
// Centralizes all institutional entities, score records, broadsheet calculation, and audit trails
// ======================================================================================

import React, { createContext, useContext, useState, useEffect } from "react";
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
  AttendanceRecord,
  CorrectionRequest,
  AuditLog,
  AssessmentTemplate,
  SubscriptionPlan,
  Subscription,
  SubscriptionException,
} from "../types";
import {
  DEMO_SCHOOL,
  DEMO_STUDENTS,
  DEMO_TEACHERS,
  DEMO_CLASSES,
  DEMO_STREAMS,
  DEMO_SUBJECTS,
  DEMO_TEACHER_ASSIGNMENTS,
  DEMO_ACADEMIC_YEARS,
  DEMO_TERMS,
  DEMO_SCORE_RECORDS,
  DEMO_REPORTS,
  DEMO_ATTENDANCE,
  DEMO_AUDIT_LOGS,
  DEMO_SUBSCRIPTION_PLANS,
  DEMO_SUBSCRIPTIONS,
  DEMO_EXCEPTIONS,
} from "../data/mockData";
import {
  DEFAULT_NACCA_SBA_TEMPLATE,
  DEFAULT_NINE_POINT_GRADING_SCALE,
  calculateAssessmentScores,
} from "../services/assessmentCalculator";
import { apiClient } from "../services/apiClient";
import { useToast } from "./ToastContext";

interface SchoolDataContextType {
  schools: School[];
  currentSchool: School;
  plans: SubscriptionPlan[];
  subscriptions: Subscription[];
  exceptions: SubscriptionException[];
  teachers: TeacherProfile[];
  students: StudentProfile[];
  classes: SchoolClass[];
  streams: Stream[];
  subjects: Subject[];
  assignments: TeacherSubjectAssignment[];
  academicYears: AcademicYear[];
  currentAcademicYear: AcademicYear;
  terms: Term[];
  currentTerm: Term;
  scores: AssessmentScoreRecord[];
  reports: ReportCard[];
  attendance: AttendanceRecord[];
  auditLogs: AuditLog[];
  templates: AssessmentTemplate[];
  correctionRequests: CorrectionRequest[];
  // Actions
  addSchool: (schoolData: Partial<School>) => void;
  addStudent: (studentData: Partial<StudentProfile>) => void;
  addTeacher: (teacherData: Partial<TeacherProfile>) => void;
  saveScores: (updatedScores: AssessmentScoreRecord[]) => void;
  submitScores: (subjectId: string, classId: string) => void;
  approveScores: (subjectId: string, classId: string) => void;
  publishReports: (classId: string) => void;
  saveAttendance: (records: AttendanceRecord[]) => void;
  requestCorrection: (reqData: Partial<CorrectionRequest>) => void;
  approveCorrection: (requestId: string) => void;
  grantException: (schoolId: string, excData: Partial<SubscriptionException>) => void;
  updateTemplate: (tpl: AssessmentTemplate) => void;
}

const SchoolDataContext = createContext<SchoolDataContextType | undefined>(undefined);

export const SchoolDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { success, info } = useToast();

  const [schools, setSchools] = useState<School[]>([DEMO_SCHOOL]);
  const [plans, setPlans] = useState(DEMO_SUBSCRIPTION_PLANS);
  const [subscriptions, setSubscriptions] = useState(DEMO_SUBSCRIPTIONS);
  const [exceptions, setExceptions] = useState<SubscriptionException[]>(DEMO_EXCEPTIONS);
  const [teachers, setTeachers] = useState<TeacherProfile[]>(DEMO_TEACHERS);
  const [students, setStudents] = useState<StudentProfile[]>(DEMO_STUDENTS);
  const [classes] = useState<SchoolClass[]>(DEMO_CLASSES);
  const [streams] = useState<Stream[]>(DEMO_STREAMS);
  const [subjects] = useState<Subject[]>(DEMO_SUBJECTS);
  const [assignments, setAssignments] = useState<TeacherSubjectAssignment[]>(DEMO_TEACHER_ASSIGNMENTS);
  const [academicYears] = useState<AcademicYear[]>(DEMO_ACADEMIC_YEARS);
  const [terms] = useState<Term[]>(DEMO_TERMS);
  const [scores, setScores] = useState<AssessmentScoreRecord[]>(DEMO_SCORE_RECORDS);
  const [reports, setReports] = useState<ReportCard[]>(DEMO_REPORTS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(DEMO_ATTENDANCE);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(DEMO_AUDIT_LOGS);
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([DEFAULT_NACCA_SBA_TEMPLATE]);
  const [correctionRequests, setCorrectionRequests] = useState<CorrectionRequest[]>([]);

  const currentSchool = schools[0] || DEMO_SCHOOL;
  const currentAcademicYear = academicYears.find((y) => y.isCurrent) || academicYears[1];
  const currentTerm = terms.find((t) => t.isCurrent) || terms[0];

  // Load from apiClient cache on mount
  useEffect(() => {
    apiClient.getSchools().then((data) => {
      if (data && data.length) setSchools(data);
    });
    apiClient.getStudents().then((data) => {
      if (data && data.length) setStudents(data);
    });
    apiClient.getScores().then((data) => {
      if (data && data.length) setScores(data);
    });
    apiClient.getReports().then((data) => {
      if (data && data.length) setReports(data);
    });
    apiClient.getAttendance().then((data) => {
      if (data && data.length) setAttendance(data);
    });
  }, []);

  // Handlers
  const addSchool = (newSchoolData: Partial<School>) => {
    const newSchool: School = {
      id: `SCH_${Date.now()}`,
      name: newSchoolData.name || "New Basic School",
      shortCode: newSchoolData.shortCode || "NBS",
      email: newSchoolData.email || "info@school.edu.gh",
      phone: newSchoolData.phone || "0244000000",
      address: newSchoolData.address || "Pokuase, Greater Accra",
      district: newSchoolData.district || "Ga West Municipal",
      region: newSchoolData.region || "Greater Accra Region",
      motto: newSchoolData.motto || "Knowledge and Integrity",
      headTeacherName: newSchoolData.headTeacherName || "Headteacher",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSchools((prev) => [newSchool, ...prev]);
    apiClient.createSchool(newSchool);
    success("School Provisioned", `Created tenant instance for ${newSchool.name}`);
  };

  const addStudent = (newStudentData: Partial<StudentProfile>) => {
    const newStudent: StudentProfile = {
      id: `STU_${Date.now()}`,
      schoolId: currentSchool.id,
      studentNumber: newStudentData.studentNumber || `ESBA/2026/${String(students.length + 1).padStart(3, "0")}`,
      admissionNumber: newStudentData.admissionNumber || `ADM/2026/${String(students.length + 80).padStart(3, "0")}`,
      surname: newStudentData.surname || "Learner",
      firstName: newStudentData.firstName || "New",
      gender: newStudentData.gender || "Male",
      dateOfBirth: newStudentData.dateOfBirth || "2013-05-15",
      nationality: "Ghanaian",
      parentName: newStudentData.parentName || "Guardian",
      parentContact: newStudentData.parentContact || "0244000000",
      homeAddress: newStudentData.homeAddress || "Greater Accra",
      admissionDate: new Date().toISOString().split("T")[0],
      currentLevelId: newStudentData.currentLevelId || "B7",
      currentClassId: newStudentData.currentClassId || "CLS_JHS1",
      status: "Active",
      createdAt: new Date().toISOString(),
    };
    setStudents((prev) => [newStudent, ...prev]);
    apiClient.addStudent(newStudent);
    success("Learner Enrolled", `Added ${newStudent.firstName} ${newStudent.surname} (${newStudent.studentNumber})`);
  };

  const addTeacher = (teacherData: Partial<TeacherProfile>) => {
    const newTeacher: TeacherProfile = {
      id: `TCH_${Date.now()}`,
      userId: `USR_TCH_${Date.now()}`,
      schoolId: currentSchool.id,
      staffId: teacherData.staffId || `GES-${Date.now().toString().slice(-4)}`,
      fullName: teacherData.fullName || "New Teacher",
      gender: teacherData.gender || "Male",
      email: teacherData.email || "teacher@school.edu.gh",
      phone: teacherData.phone || "0244000000",
      isActive: true,
    };
    setTeachers((prev) => [newTeacher, ...prev]);
    success("Staff Enrolled", `Registered ${newTeacher.fullName} as subject educator`);
  };

  const saveScores = (updatedScores: AssessmentScoreRecord[]) => {
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
    apiClient.saveScores(updatedScores);
    success("Marks Saved", "Continuous assessment scores updated and cached offline");
  };

  const submitScores = (subjectId: string, classId: string) => {
    setScores((prev) =>
      prev.map((s) =>
        s.classId === classId && s.subjectId === subjectId
          ? { ...s, status: "SUBMITTED", updatedAt: new Date().toISOString() }
          : s
      )
    );
    info("Submitted for Moderation", "Marks submitted to Headteacher for review and approval");
  };

  const approveScores = (subjectId: string, classId: string) => {
    setScores((prev) =>
      prev.map((s) =>
        s.classId === classId && s.subjectId === subjectId
          ? { ...s, status: "APPROVED", updatedAt: new Date().toISOString() }
          : s
      )
    );
    success("Scores Approved", "Subject marks sealed and approved for terminal broadsheet");
  };

  const publishReports = (classId: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.classId === classId
          ? { ...r, published: true, publishedAt: new Date().toISOString() }
          : r
      )
    );
    apiClient.publishReports(classId);
    success("Report Cards Published", "Terminal reports unlocked for student & parent portal viewing");
  };

  const saveAttendance = (records: AttendanceRecord[]) => {
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
    apiClient.saveAttendance(records);
    success("Attendance Logged", "Daily class roll saved to terminal attendance aggregator");
  };

  const requestCorrection = (reqData: Partial<CorrectionRequest>) => {
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
    info("Correction Request Filed", "Audit log registered. Awaiting Headteacher approval.");
  };

  const approveCorrection = (requestId: string) => {
    const targetReq = correctionRequests.find((r) => r.id === requestId);
    if (!targetReq) return;

    setScores((prev) =>
      prev.map((s) => {
        if (
          s.id === targetReq.scoreRecordId ||
          (s.studentId === targetReq.studentId && s.subjectId === targetReq.subjectId)
        ) {
          const compScores = { ...s.componentScores };
          let newExamRaw = s.examRaw;
          if (targetReq.componentId === "comp_end_exam") {
            newExamRaw = targetReq.proposedValue;
          } else {
            compScores[targetReq.componentId] = targetReq.proposedValue;
          }

          const calc = calculateAssessmentScores(
            DEFAULT_NACCA_SBA_TEMPLATE,
            DEFAULT_NINE_POINT_GRADING_SCALE,
            {
              ...compScores,
              comp_end_exam: newExamRaw,
            }
          );

          return {
            ...s,
            componentScores: compScores,
            internalTotal: calc.internalTotal,
            internalScaled: calc.internalScaled,
            examRaw: newExamRaw,
            examScaled: calc.examScaled,
            finalTotal: calc.finalTotal,
            grade: calc.grade,
            descriptor: calc.descriptor,
            remark: calc.remark,
            updatedAt: new Date().toISOString(),
          };
        }
        return s;
      })
    );

    setCorrectionRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, status: "APPROVED", approvedBy: "Headteacher", approvedAt: new Date().toISOString() }
          : r
      )
    );
    success("Score Correction Approved", "Mark recalculated and updated in official grade broadsheet");
  };

  const grantException = (schoolId: string, excData: Partial<SubscriptionException>) => {
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
    success("Exception Granted", `Applied ${newExc.exceptionType} to school tenant`);
  };

  const updateTemplate = (tpl: AssessmentTemplate) => {
    setTemplates([tpl]);
    success("Template Saved", "NaCCA curriculum assessment weights updated");
  };

  return (
    <SchoolDataContext.Provider
      value={{
        schools,
        currentSchool,
        plans,
        subscriptions,
        exceptions,
        teachers,
        students,
        classes,
        streams,
        subjects,
        assignments,
        academicYears,
        currentAcademicYear,
        terms,
        currentTerm,
        scores,
        reports,
        attendance,
        auditLogs,
        templates,
        correctionRequests,
        addSchool,
        addStudent,
        addTeacher,
        saveScores,
        submitScores,
        approveScores,
        publishReports,
        saveAttendance,
        requestCorrection,
        approveCorrection,
        grantException,
        updateTemplate,
      }}
    >
      {children}
    </SchoolDataContext.Provider>
  );
};

export const useSchoolData = () => {
  const context = useContext(SchoolDataContext);
  if (!context) {
    throw new Error("useSchoolData must be used within a SchoolDataProvider");
  }
  return context;
};
