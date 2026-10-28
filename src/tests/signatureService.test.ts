import { describe, it, expect } from "vitest";
import {
  generateVerificationCode,
  verifyReportAuthenticity,
} from "../services/signatureService";
import { DEMO_REPORTS, DEMO_SCHOOL, DEMO_STUDENTS } from "../data/mockData";

describe("Digital Signature & Report Verification Service", () => {
  it("generates an official verification code adhering to ESBA-YYYY-XXXXXXX format", () => {
    const code = generateVerificationCode("2026/2027");
    expect(code).toMatch(/^ESBA-2026-[A-Z0-9]{7}$/);
  });

  it("verifies genuine report card codes", () => {
    const schoolsMap = { [DEMO_SCHOOL.id]: { name: DEMO_SCHOOL.name } };
    const studentsMap = {
      [DEMO_STUDENTS[0].id]: {
        surname: DEMO_STUDENTS[0].surname,
        firstName: DEMO_STUDENTS[0].firstName,
      },
    };

    const result = verifyReportAuthenticity(
      "ESBA-2026-9F72A81",
      DEMO_REPORTS,
      schoolsMap,
      studentsMap
    );

    expect(result.valid).toBe(true);
    expect(result.status).toBe("GENUINE_AUTHENTIC");
    expect(result.schoolName).toBe(DEMO_SCHOOL.name);
    expect(result.studentInitials).toBe("K. Mensah");
  });

  it("identifies invalid/fake report codes", () => {
    const schoolsMap = { [DEMO_SCHOOL.id]: { name: DEMO_SCHOOL.name } };
    const studentsMap = {};

    const result = verifyReportAuthenticity(
      "ESBA-FAKE-9999999",
      DEMO_REPORTS,
      schoolsMap,
      studentsMap
    );

    expect(result.valid).toBe(false);
    expect(result.status).toBe("INVALID_CODE");
  });
});
