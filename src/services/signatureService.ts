// ======================================================================================
// E-SBA Ghana — Digital Signature & Cryptographic Report Verification Service
// Handles SHA-256 Result Hashing, Tamper Detection, and Verification Codes
// ======================================================================================

import { AssessmentScoreRecord, ReportCard, VerificationResult } from "../types";

/**
 * Computes a deterministic SHA-256 hash string for an array of assessment scores.
 */
export async function generateResultHash(
  studentId: string,
  academicYearId: string,
  termId: string,
  scores: AssessmentScoreRecord[]
): Promise<string> {
  // Sort deterministically by subjectId
  const sortedScores = [...scores].sort((a, b) =>
    a.subjectId.localeCompare(b.subjectId)
  );

  const payload = JSON.stringify({
    studentId,
    academicYearId,
    termId,
    scores: sortedScores.map((s) => ({
      subj: s.subjectId,
      int: s.internalScaled,
      ex: s.examScaled,
      fin: s.finalTotal,
      grd: s.grade,
    })),
  });

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    // Fallback pseudo-hash for older runtimes without crypto.subtle
    let hash = 0;
    for (let i = 0; i < payload.length; i++) {
      hash = (hash << 5) - hash + payload.charCodeAt(i);
      hash |= 0;
    }
    return `hash_${Math.abs(hash).toString(16)}`;
  }
}

/**
 * Generates an official Ghanaian E-SBA verification code.
 * Format: ESBA-[Year]-[7-char alphanumeric uppercase]
 * e.g. ESBA-2026-9F72A81
 */
export function generateVerificationCode(yearLabel: string): string {
  const cleanYear = yearLabel.split("/")[0] || "2026";
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // readable chars without ambiguous 0/O 1/I
  let randomSegment = "";
  for (let i = 0; i < 7; i++) {
    randomSegment += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ESBA-${cleanYear}-${randomSegment}`;
}

/**
 * Verifies authenticity of a report card record.
 */
export function verifyReportAuthenticity(
  verificationCode: string,
  reportRegistry: ReportCard[],
  schoolsMap: Record<string, { name: string }>,
  studentsMap: Record<string, { surname: string; firstName: string }>
): VerificationResult {
  const matchedReport = reportRegistry.find(
    (r) => r.verificationCode.trim().toUpperCase() === verificationCode.trim().toUpperCase()
  );

  if (!matchedReport) {
    return {
      valid: false,
      verificationCode,
      schoolName: "Unknown",
      studentInitials: "N/A",
      academicYear: "N/A",
      term: "N/A",
      level: "N/A",
      issueDate: "N/A",
      status: "INVALID_CODE",
    };
  }

  const school = schoolsMap[matchedReport.schoolId];
  const student = studentsMap[matchedReport.studentId];

  const initials = student
    ? `${student.firstName.charAt(0)}. ${student.surname}`
    : "Verified Learner";

  return {
    valid: true,
    verificationCode: matchedReport.verificationCode,
    schoolName: school ? school.name : "Ghanaian Basic School",
    studentInitials: initials,
    academicYear: matchedReport.academicYearId,
    term: matchedReport.termId,
    level: matchedReport.classId,
    issueDate: matchedReport.publishedAt || matchedReport.createdAt,
    status: matchedReport.published ? "GENUINE_AUTHENTIC" : "SUPERSEDED_REVISION",
  };
}
