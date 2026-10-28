// ======================================================================================
// E-SBA Ghana — Import/Export Center Engine
// Handles Excel template generation, validation, preview, error parsing, and exports
// ======================================================================================

import * as XLSX from "xlsx";
import { ImportPreviewRow, StudentProfile, TeacherProfile } from "../types";

export interface StudentImportTemplateRow {
  "Admission No": string;
  "Student No": string;
  "First Name": string;
  "Middle Name"?: string;
  Surname: string;
  Gender: "Male" | "Female";
  "Date of Birth (YYYY-MM-DD)": string;
  Class: string;
  Stream?: string;
  "Parent Contact": string;
  "Parent Name"?: string;
}

export interface ScoreImportTemplateRow {
  "Student No": string;
  "Student Name": string;
  "Individual Test (15)": number;
  "Group Work (15)": number;
  "Individual Task (15)": number;
  "Project Work (15)": number;
  "Examination (100)": number;
}

export const importExportService = {
  /**
   * Generates and triggers download of student bulk registration template
   */
  downloadStudentTemplate(): void {
    const sampleRows: StudentImportTemplateRow[] = [
      {
        "Admission No": "ADM/2026/001",
        "Student No": "ESBA/2026/001",
        "First Name": "Kofi",
        "Middle Name": "Kwarteng",
        Surname: "Mensah",
        Gender: "Male",
        "Date of Birth (YYYY-MM-DD)": "2012-05-14",
        Class: "JHS 1",
        Stream: "A",
        "Parent Contact": "0244123456",
        "Parent Name": "Kwame Mensah",
      },
      {
        "Admission No": "ADM/2026/002",
        "Student No": "ESBA/2026/002",
        "First Name": "Ama",
        "Middle Name": "",
        Surname: "Serwaa",
        Gender: "Female",
        "Date of Birth (YYYY-MM-DD)": "2012-08-22",
        Class: "JHS 1",
        Stream: "A",
        "Parent Contact": "0208987654",
        "Parent Name": "Akosua Serwaa",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students_Template");
    XLSX.writeFile(workbook, "ESBA_Ghana_Student_Import_Template.xlsx");
  },

  /**
   * Generates and triggers download of score entry spreadsheet template
   */
  downloadScoreTemplate(subjectName: string, className: string, students: StudentProfile[]): void {
    const rows = students.map((s) => ({
      "Student No": s.studentNumber,
      "Student Name": `${s.surname}, ${s.firstName}`,
      "Individual Test (15)": "",
      "Group Work (15)": "",
      "Individual Task (15)": "",
      "Project Work (15)": "",
      "Examination (100)": "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows.length ? rows : [
      {
        "Student No": "ESBA/2026/001",
        "Student Name": "Mensah, Kofi",
        "Individual Test (15)": 12,
        "Group Work (15)": 13,
        "Individual Task (15)": 11,
        "Project Work (15)": 14,
        "Examination (100)": 78,
      }
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Score_Entry");
    XLSX.writeFile(workbook, `ESBA_${className.replace(/\s+/g, "_")}_${subjectName.replace(/\s+/g, "_")}_Template.xlsx`);
  },

  /**
   * Parses and validates uploaded Student spreadsheet file
   */
  async parseAndValidateStudentSpreadsheet(file: File): Promise<ImportPreviewRow[]> {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json<any>(sheet);

    const previewRows: ImportPreviewRow[] = [];
    const seenStudentNos = new Set<string>();

    rawRows.forEach((row, idx) => {
      const rowNum = idx + 2; // spreadsheet 1-based + 1 header row
      const errors: string[] = [];
      const warnings: string[] = [];

      const studentNo = String(row["Student No"] || row["student_no"] || "").trim();
      const admissionNo = String(row["Admission No"] || row["admission_no"] || "").trim();
      const firstName = String(row["First Name"] || row["first_name"] || "").trim();
      const surname = String(row["Surname"] || row["Last Name"] || row["surname"] || "").trim();
      const gender = String(row["Gender"] || row["gender"] || "").trim();
      const dob = String(row["Date of Birth (YYYY-MM-DD)"] || row["dob"] || "").trim();
      const className = String(row["Class"] || row["class"] || "").trim();

      if (!studentNo) errors.push("Missing Student Number");
      if (!admissionNo) errors.push("Missing Admission Number");
      if (!firstName) errors.push("Missing First Name");
      if (!surname) errors.push("Missing Surname");
      if (!className) errors.push("Missing Class Assignment");

      if (gender && !["Male", "Female", "M", "F"].includes(gender)) {
        errors.push(`Invalid Gender '${gender}'. Use 'Male' or 'Female'`);
      }

      if (studentNo) {
        if (seenStudentNos.has(studentNo)) {
          errors.push(`Duplicate Student No '${studentNo}' in file`);
        } else {
          seenStudentNos.add(studentNo);
        }
      }

      previewRows.push({
        rowNumber: rowNum,
        data: row,
        errors,
        warnings,
        isValid: errors.length === 0,
      });
    });

    return previewRows;
  },

  /**
   * Export records directly to Excel or CSV
   */
  exportDataToExcel(filename: string, sheetName: string, data: Record<string, any>[]): void {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  },

  /**
   * Export records to CSV string
   */
  exportDataToCSV(filename: string, data: Record<string, any>[]): void {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  },
};
