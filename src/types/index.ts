// ======================================================================================
// E-SBA Ghana — Domain Type Definitions
// Compliant with NaCCA Pre-Tertiary Learning Assessment Framework (NPLAF)
// Multi-Tenant SaaS: Platform Admin | School Admin | Teacher | Student
// ======================================================================================

export type UserRole = "MAIN_ADMIN" | "SCHOOL_ADMIN" | "TEACHER" | "STUDENT";

export type KeyPhase = "KP2" | "KP3" | "KP4"; // KP2: B1-B3, KP3: B4-B6, KP4: B7-B9 (JHS 1-3)

export type LevelCode =
  | "B1"
  | "B2"
  | "B3"
  | "B4"
  | "B5"
  | "B6"
  | "B7"
  | "B8"
  | "B9";

export type Gender = "Male" | "Female";

export type EnrollmentStatus =
  | "Active"
  | "Transferred"
  | "Withdrawn"
  | "Repeated"
  | "Graduated"
  | "Deactivated";

export type PromotionStatus =
  | "PROMOTED"
  | "PROMOTED_WITH_CONDITIONS"
  | "REPEATED"
  | "TRANSFERRED"
  | "WITHDRAWN"
  | "GRADUATED"
  | "PENDING";

export type SubscriptionStatus =
  | "TRIAL"
  | "ACTIVE"
  | "GRACE_PERIOD"
  | "EXPIRED"
  | "SUSPENDED"
  | "CANCELLED"
  | "FREE_EXCEPTION";

export type ExceptionType =
  | "FULL_FREE_ACCESS"
  | "TEMPORARY_FREE_ACCESS"
  | "FEATURE_FREE_ACCESS"
  | "EXTENDED_TRIAL"
  | "PROMOTIONAL_ACCESS";

export type AssessmentStatus =
  | "DRAFT"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "RETURNED"
  | "APPROVED"
  | "SIGNED"
  | "PUBLISHED"
  | "LOCKED"
  | "AMENDED";

export type AttendanceStatus = "PRESENT" | "ABSENT" | "EXCUSED" | "LATE";

// --------------------------------------------------------------------------------------
// 1. Platform & Tenant Engine
// --------------------------------------------------------------------------------------
export interface School {
  id: string;
  name: string;
  shortCode: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  region: string;
  circuit?: string;
  gesRegistrationNumber?: string;
  motto: string;
  headTeacherName: string;
  headTeacherSignatureUrl?: string;
  logoUrl?: string;
  subscriptionId?: string;
  status: "ACTIVE" | "SUSPENDED" | "TRIAL" | "EXPIRED" | "FREE_EXCEPTION";
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceGHS: number;
  billingCycle: "TERMLY" | "ANNUAL";
  maxStudents: number;
  maxTeachers: number;
  maxClasses: number;
  enabledLevels: LevelCode[];
  enabledFeatures: string[];
  active: boolean;
}

export interface Subscription {
  id: string;
  schoolId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: string;
  expiryDate: string;
  billingCycle: "TERMLY" | "ANNUAL";
  studentLimit: number;
  teacherLimit: number;
  classLimit: number;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionException {
  id: string;
  schoolId: string;
  exceptionType: ExceptionType;
  reason: string;
  grantedBy: string;
  grantedAt: string;
  startDate: string;
  expiryDate?: string;
  permanent: boolean;
  notes?: string;
  status: "ACTIVE" | "REVOKED" | "EXPIRED";
}

// --------------------------------------------------------------------------------------
// 2. User & Authentication Engine
// --------------------------------------------------------------------------------------
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  schoolId?: string; // null for MAIN_ADMIN
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  permissions: string[];
  lastLogin?: string;
  createdAt: string;
}

export interface TeacherProfile {
  id: string;
  userId: string;
  schoolId: string;
  staffId: string;
  fullName: string;
  gender: Gender;
  phone: string;
  email: string;
  specialization?: string;
  qualification?: string;
  signatureUrl?: string;
  isActive: boolean;
}

export interface StudentProfile {
  id: string;
  schoolId: string;
  studentNumber: string; // e.g. "ESBA/2026/001"
  admissionNumber: string; // School admission number
  surname: string;
  firstName: string;
  middleName?: string;
  gender: Gender;
  dateOfBirth: string;
  nationality: string;
  photoUrl?: string;
  parentName: string;
  parentContact: string;
  parentEmail?: string;
  homeAddress: string;
  admissionDate: string;
  currentLevelId: LevelCode;
  currentClassId: string;
  currentStreamId?: string;
  status: EnrollmentStatus;
  createdAt: string;
}

// --------------------------------------------------------------------------------------
// 3. Academic Structure Engine
// --------------------------------------------------------------------------------------
export interface AcademicYear {
  id: string;
  schoolId: string;
  yearLabel: string; // e.g. "2025/2026"
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface Term {
  id: string;
  schoolId: string;
  academicYearId: string;
  termNumber: 1 | 2 | 3;
  termName: "Term 1" | "Term 2" | "Term 3";
  startDate: string;
  endDate: string;
  vacationDate?: string;
  reopeningDate?: string;
  isCurrent: boolean;
}

export interface SchoolClass {
  id: string;
  schoolId: string;
  level: LevelCode;
  keyPhase: KeyPhase;
  name: string; // e.g. "Basic 7" or "JHS 1"
  classTeacherId?: string;
  capacity?: number;
}

export interface Stream {
  id: string;
  schoolId: string;
  classId: string;
  streamName: string; // e.g. "A", "B", "Gold", "Blue"
  streamLabel: string; // e.g. "JHS 1A", "Basic 4B"
  classTeacherId?: string;
}

export interface Subject {
  id: string;
  schoolId?: string; // null if official curriculum subject
  code: string;
  name: string;
  keyPhases: KeyPhase[];
  isCore: boolean;
  curriculumVersionId?: string;
}

export interface TeacherSubjectAssignment {
  id: string;
  schoolId: string;
  teacherId: string;
  academicYearId: string;
  termId: string;
  classId: string;
  streamId?: string;
  subjectId: string;
  role: "PRIMARY_TEACHER" | "ASSISTANT_TEACHER";
  status: "ACTIVE" | "INACTIVE";
}

export interface StudentEnrollment {
  id: string;
  schoolId: string;
  studentId: string;
  academicYearId: string;
  termId: string;
  levelId: LevelCode;
  classId: string;
  streamId?: string;
  rollNumber?: number;
  status: EnrollmentStatus;
  promotionStatus: PromotionStatus;
  createdAt: string;
}

// --------------------------------------------------------------------------------------
// 4. Curriculum Engine (NaCCA Standards-Based)
// --------------------------------------------------------------------------------------
export interface CurriculumVersion {
  id: string;
  code: string; // "NACCA_SBC_2020"
  title: string;
  frameworkAuthority: "NaCCA" | "GES" | "MoE";
  effectiveYear: number;
  active: boolean;
  description: string;
}

export interface CurriculumStrand {
  id: string;
  curriculumVersionId: string;
  subjectId: string;
  levelId: LevelCode;
  strandNumber: number;
  name: string;
}

export interface CurriculumSubStrand {
  id: string;
  strandId: string;
  subStrandNumber: number;
  name: string;
}

export interface ContentStandard {
  id: string;
  subStrandId: string;
  code: string; // e.g. "B7.1.1.1"
  description: string;
}

export interface CoreCompetency {
  id: string;
  code: string;
  name: string;
  description: string;
}

// --------------------------------------------------------------------------------------
// 5. Assessment & Grading Engine
// --------------------------------------------------------------------------------------
export type AssessmentComponentType =
  | "INDIVIDUAL_TEST"
  | "GROUP_WORK"
  | "INDIVIDUAL_TASK"
  | "PROJECT"
  | "PORTFOLIO"
  | "PERFORMANCE"
  | "CLASS_EXERCISE"
  | "PRACTICAL"
  | "PRESENTATION"
  | "END_OF_TERM_EXAM"
  | "OTHER";

export interface AssessmentComponent {
  id: string;
  templateId: string;
  code: string; // e.g. "TEST_1", "GROUP_1", "EXAM"
  name: string; // e.g. "Individual Test"
  componentType: AssessmentComponentType;
  maxScore: number; // e.g. 15, 100
  isInternalSBA: boolean; // true for SBA, false for End of Term Exam
  sortOrder: number;
}

export interface AssessmentTemplate {
  id: string;
  schoolId?: string; // null if platform default
  name: string; // "NaCCA Basic/JHS Standard SBA (30/70)"
  keyPhases: KeyPhase[];
  levels: LevelCode[];
  internalMax: number; // e.g. 60
  internalWeightPercent: number; // e.g. 30
  examMax: number; // e.g. 100
  examWeightPercent: number; // e.g. 70
  finalMax: number; // 100
  isDefault: boolean;
  components: AssessmentComponent[];
}

export interface GradingScaleItem {
  grade: string; // "1", "2", "3" or "A", "B", "C"
  numericalValue: number; // 1 (highest) to 9 (lowest) for JHS/BECE
  minScore: number; // 80
  maxScore: number; // 100
  descriptor: string; // "High Distinction", "Proficient", etc.
  remark: string; // "Excellent", "Very Good", etc.
}

export interface GradingScale {
  id: string;
  schoolId?: string; // null if platform standard
  name: string; // "WAEC/GES Standard 9-Point Scale"
  type: "NINE_POINT_NUMERIC" | "LETTER_SCALE_AF";
  items: GradingScaleItem[];
  isDefault: boolean;
}

export interface AssessmentScoreRecord {
  id: string;
  schoolId: string;
  academicYearId: string;
  termId: string;
  studentId: string;
  classId: string;
  streamId?: string;
  subjectId: string;
  templateId: string;
  componentScores: Record<string, number>; // componentId -> raw score
  internalTotal: number;
  internalScaled: number;
  examRaw: number;
  examScaled: number;
  finalTotal: number;
  grade: string;
  descriptor: string;
  remark: string;
  subjectPosition?: number;
  classPosition?: number;
  status: AssessmentStatus;
  enteredBy: string;
  enteredAt: string;
  updatedAt: string;
  version: number;
}

export interface CorrectionRequest {
  id: string;
  schoolId: string;
  scoreRecordId: string;
  studentId: string;
  subjectId: string;
  componentId: string;
  oldValue: number;
  proposedValue: number;
  reason: string;
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

// --------------------------------------------------------------------------------------
// 6. Reports & Digital Signatures Engine
// --------------------------------------------------------------------------------------
export interface ReportCard {
  id: string;
  verificationCode: string; // e.g. "ESBA-2026-9F72A81"
  schoolId: string;
  studentId: string;
  academicYearId: string;
  termId: string;
  classId: string;
  streamId?: string;
  version: number;
  resultHash: string; // SHA-256 hash of subject scores
  overallPosition: number;
  numberOnRoll: number;
  attendancePresent: number;
  attendanceTotal: number;
  conductRemark: string;
  interestRemark: string;
  classTeacherRemark: string;
  classTeacherSigned: boolean;
  classTeacherSignedAt?: string;
  headTeacherRemark: string;
  headTeacherSigned: boolean;
  headTeacherSignedAt?: string;
  promotedTo?: string;
  published: boolean;
  publishedAt?: string;
  createdAt: string;
}

export interface VerificationResult {
  valid: boolean;
  verificationCode: string;
  schoolName: string;
  studentInitials: string;
  academicYear: string;
  term: string;
  level: string;
  issueDate: string;
  status: "GENUINE_AUTHENTIC" | "INVALID_CODE" | "SUPERSEDED_REVISION";
}

// --------------------------------------------------------------------------------------
// 7. Attendance & Audit Logs
// --------------------------------------------------------------------------------------
export interface AttendanceRecord {
  id: string;
  schoolId: string;
  studentId: string;
  academicYearId: string;
  termId: string;
  date: string;
  status: AttendanceStatus;
  reason?: string;
  recordedBy: string;
}

export interface AuditLog {
  id: string;
  schoolId?: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action:
    | "LOGIN"
    | "LOGOUT"
    | "CREATE"
    | "UPDATE"
    | "DELETE"
    | "IMPORT"
    | "EXPORT"
    | "SUBMIT_SCORES"
    | "APPROVE_SCORES"
    | "REJECT_SCORES"
    | "PUBLISH_REPORTS"
    | "DIGITAL_SIGN"
    | "GRANT_EXCEPTION"
    | "REVOKE_EXCEPTION"
    | "PASSWORD_RESET";
  entityType: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface ImportPreviewRow {
  rowNumber: number;
  data: Record<string, any>;
  errors: string[];
  warnings: string[];
  isValid: boolean;
}

export interface ImportJobSummary {
  id: string;
  type: "STUDENTS" | "TEACHERS" | "CLASSES" | "SCORES";
  fileName: string;
  totalRows: number;
  validRows: number;
  errorRows: number;
  status: "PENDING_PREVIEW" | "IMPORTED" | "FAILED";
  importedAt?: string;
  importedBy?: string;
}
