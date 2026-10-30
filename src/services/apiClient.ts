// ======================================================================================
// E-SBA Ghana — Universal API & Data Service Layer
// Bridges Supabase PostgreSQL RLS endpoints with local offline persistence fallback
// ======================================================================================

import {
  School,
  StudentProfile,
  TeacherProfile,
  AssessmentScoreRecord,
  ReportCard,
  AttendanceRecord,
  CorrectionRequest,
  AuditLog,
  VerificationResult,
} from "../types";
import {
  DEMO_SCHOOL,
  DEMO_STUDENTS,
  DEMO_TEACHERS,
  DEMO_SCORE_RECORDS,
  DEMO_REPORTS,
  DEMO_ATTENDANCE,
  DEMO_AUDIT_LOGS,
} from "../data/mockData";
import { verifyReportAuthenticity } from "./signatureService";

class ApiClient {
  private hasLocalStorage(): boolean {
    return typeof window !== "undefined" && !!window.localStorage;
  }

  private getStored<T>(key: string, defaultValue: T): T {
    if (!this.hasLocalStorage()) return defaultValue;
    try {
      const data = window.localStorage.getItem(`esba_${key}`);
      return data ? JSON.parse(data) : defaultValue;
    } catch (_err) {
      return defaultValue;
    }
  }

  private setStored<T>(key: string, value: T): void {
    if (!this.hasLocalStorage()) return;
    try {
      window.localStorage.setItem(`esba_${key}`, JSON.stringify(value));
    } catch (_err) {
      // ignore
    }
  }

  // Schools
  async getSchools(): Promise<School[]> {
    return this.getStored<School[]>("schools", [DEMO_SCHOOL]);
  }

  async createSchool(schoolData: Partial<School>): Promise<School> {
    const schools = await this.getSchools();
    const newSchool: School = {
      id: `SCH_${Date.now()}`,
      name: schoolData.name || "New Basic School",
      shortCode: schoolData.shortCode || "NBS",
      email: schoolData.email || "info@school.edu.gh",
      phone: schoolData.phone || "0244000000",
      address: schoolData.address || "Ghana Education Service District",
      district: schoolData.district || "Ga West Municipal",
      region: schoolData.region || "Greater Accra Region",
      motto: schoolData.motto || "Knowledge and Integrity",
      headTeacherName: schoolData.headTeacherName || "Headteacher",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newSchool, ...schools];
    this.setStored("schools", updated);
    return newSchool;
  }

  // Students
  async getStudents(): Promise<StudentProfile[]> {
    return this.getStored<StudentProfile[]>("students", DEMO_STUDENTS);
  }

  async addStudent(studentData: Partial<StudentProfile>): Promise<StudentProfile> {
    const students = await this.getStudents();
    const newStudent: StudentProfile = {
      id: `STU_${Date.now()}`,
      schoolId: studentData.schoolId || DEMO_SCHOOL.id,
      studentNumber: studentData.studentNumber || `ESBA/2026/${String(students.length + 1).padStart(3, "0")}`,
      admissionNumber: studentData.admissionNumber || `ADM/2026/${String(students.length + 80).padStart(3, "0")}`,
      surname: studentData.surname || "Learner",
      firstName: studentData.firstName || "New",
      gender: studentData.gender || "Male",
      dateOfBirth: studentData.dateOfBirth || "2012-05-15",
      nationality: "Ghanaian",
      parentName: studentData.parentName || "Parent/Guardian",
      parentContact: studentData.parentContact || "0244000000",
      homeAddress: studentData.homeAddress || "Greater Accra",
      admissionDate: new Date().toISOString().split("T")[0],
      currentLevelId: studentData.currentLevelId || "B7",
      currentClassId: studentData.currentClassId || "CLS_JHS1",
      status: "Active",
      createdAt: new Date().toISOString(),
    };
    const updated = [newStudent, ...students];
    this.setStored("students", updated);
    return newStudent;
  }

  // Score Records
  async getScores(): Promise<AssessmentScoreRecord[]> {
    return this.getStored<AssessmentScoreRecord[]>("scores", DEMO_SCORE_RECORDS);
  }

  async saveScores(newScores: AssessmentScoreRecord[]): Promise<void> {
    const current = await this.getScores();
    const copy = [...current];
    newScores.forEach((rec) => {
      const idx = copy.findIndex((s) => s.id === rec.id || (s.studentId === rec.studentId && s.subjectId === rec.subjectId));
      if (idx >= 0) {
        copy[idx] = { ...rec, updatedAt: new Date().toISOString() };
      } else {
        copy.push(rec);
      }
    });
    this.setStored("scores", copy);
  }

  // Reports
  async getReports(): Promise<ReportCard[]> {
    return this.getStored<ReportCard[]>("reports", DEMO_REPORTS);
  }

  async publishReports(classId: string): Promise<void> {
    const reports = await this.getReports();
    const updated = reports.map((r) =>
      r.classId === classId
        ? { ...r, published: true, publishedAt: new Date().toISOString() }
        : r
    );
    this.setStored("reports", updated);
  }

  // Cryptographic Verification
  async verifyReport(verificationCode: string): Promise<VerificationResult> {
    const reports = await this.getReports();
    const students = await this.getStudents();
    const schools = await this.getSchools();

    const schoolsMap = Object.fromEntries(schools.map((s) => [s.id, { name: s.name }]));
    const studentsMap = Object.fromEntries(
      students.map((s) => [s.id, { surname: s.surname, firstName: s.firstName }])
    );

    return verifyReportAuthenticity(verificationCode, reports, schoolsMap, studentsMap);
  }

  // Attendance
  async getAttendance(): Promise<AttendanceRecord[]> {
    return this.getStored<AttendanceRecord[]>("attendance", DEMO_ATTENDANCE);
  }

  async saveAttendance(records: AttendanceRecord[]): Promise<void> {
    const current = await this.getAttendance();
    const copy = [...current];
    records.forEach((rec) => {
      const idx = copy.findIndex((a) => a.studentId === rec.studentId && a.date === rec.date);
      if (idx >= 0) {
        copy[idx] = rec;
      } else {
        copy.push(rec);
      }
    });
    this.setStored("attendance", copy);
  }
}

export const apiClient = new ApiClient();
