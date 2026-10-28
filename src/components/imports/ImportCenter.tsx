// ======================================================================================
// E-SBA Ghana — Excel Import & Export Center
// Validates spreadsheet structure, preview errors, and commits transactional records
// ======================================================================================

import React, { useState } from "react";
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  FileText,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { importExportService } from "../../services/importExportService";
import { ImportPreviewRow, StudentProfile } from "../../types";

interface ImportCenterProps {
  onImportStudents: (newStudents: Partial<StudentProfile>[]) => void;
  onClose: () => void;
}

export const ImportCenter: React.FC<ImportCenterProps> = ({
  onImportStudents,
  onClose,
}) => {
  const [importType, setImportType] = useState<"STUDENTS" | "SCORES">("STUDENTS");
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<ImportPreviewRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setIsProcessing(true);
    setImportSuccess(false);

    try {
      const rows = await importExportService.parseAndValidateStudentSpreadsheet(selected);
      setPreviewRows(rows);
    } catch (err) {
      console.error("Spreadsheet parse error", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = () => {
    const validRows = previewRows.filter((r) => r.isValid);
    const newStudents: Partial<StudentProfile>[] = validRows.map((r) => ({
      admissionNumber: String(r.data["Admission No"] || `ADM/${Math.floor(Math.random() * 9000 + 1000)}`),
      studentNumber: String(r.data["Student No"] || `ESBA/2026/${Math.floor(Math.random() * 900 + 100)}`),
      firstName: String(r.data["First Name"]),
      middleName: String(r.data["Middle Name"] || ""),
      surname: String(r.data["Surname"]),
      gender: r.data["Gender"] === "Female" || r.data["Gender"] === "F" ? "Female" : "Male",
      dateOfBirth: String(r.data["Date of Birth (YYYY-MM-DD)"] || "2012-01-01"),
      parentContact: String(r.data["Parent Contact"] || "0240000000"),
      parentName: String(r.data["Parent Name"] || "Parent / Guardian"),
      homeAddress: "Ga West, Greater Accra",
      admissionDate: new Date().toISOString().split("T")[0],
      currentLevelId: "B7",
      currentClassId: "CLS_JHS1",
      currentStreamId: "STR_JHS1_A",
      status: "Active",
    }));

    onImportStudents(newStudents);
    setImportSuccess(true);
  };

  const validCount = previewRows.filter((r) => r.isValid).length;
  const errorCount = previewRows.filter((r) => !r.isValid).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Excel Import & Data Validation Center
          </h2>
          <p className="text-xs text-slate-500">
            Ingest bulk learner registers and assessment score sheets with strict validation (Section 36-38).
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 font-bold text-lg"
        >
          ×
        </button>
      </div>

      {/* Template Download Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-xs">Student Registration Template</h4>
            <p className="text-[11px] text-slate-500">
              Columns: Admission No, Student No, Names, Gender, DOB, Class
            </p>
          </div>
          <button
            onClick={() => importExportService.downloadStudentTemplate()}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-indigo-700" />
            .xlsx
          </button>
        </div>

        <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-xs">Score Entry Spreadsheet Template</h4>
            <p className="text-[11px] text-slate-500">
              Includes pre-configured SBA 15-mark components & Exam 100
            </p>
          </div>
          <button
            onClick={() =>
              importExportService.downloadScoreTemplate("Mathematics", "JHS 1A", [])
            }
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-indigo-700" />
            .xlsx
          </button>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors bg-slate-50/50">
        <Upload className="w-10 h-10 text-indigo-600 mx-auto mb-2" />
        <h3 className="font-semibold text-slate-800 text-sm">
          Select or drag and drop spreadsheet file
        </h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          Supports .xlsx, .xls, and .csv files formatted according to the E-SBA Ghana specification.
        </p>

        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors">
          <FileSpreadsheet className="w-4 h-4" />
          Choose Spreadsheet File
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        {file && (
          <p className="text-xs font-mono text-indigo-900 font-semibold mt-3">
            Loaded: {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      {/* Validation Summary */}
      {previewRows.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-100 p-3 rounded-lg text-xs">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-slate-700">
                Parsed: <strong>{previewRows.length} total rows</strong>
              </span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                {validCount} Ready to Import
              </span>
              {errorCount > 0 && (
                <span className="text-rose-700 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {errorCount} Validation Errors
                </span>
              )}
            </div>

            <button
              onClick={handleConfirmImport}
              disabled={validCount === 0 || importSuccess}
              className={`px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-colors inline-flex items-center gap-1.5 ${
                validCount === 0 || importSuccess
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-emerald-700 hover:bg-emerald-800 text-white"
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              {importSuccess ? "Import Completed" : `Confirm Ingestion (${validCount} Rows)`}
            </button>
          </div>

          {importSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Successfully registered {validCount} learner profiles into the master institutional database.
            </div>
          )}

          {/* Preview Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-60 overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <tr>
                  <th className="p-2.5">Row</th>
                  <th className="p-2.5">Student No</th>
                  <th className="p-2.5">Name</th>
                  <th className="p-2.5">Gender</th>
                  <th className="p-2.5">Class</th>
                  <th className="p-2.5">Validation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {previewRows.map((row) => (
                  <tr
                    key={row.rowNumber}
                    className={row.isValid ? "hover:bg-slate-50" : "bg-rose-50/50"}
                  >
                    <td className="p-2.5 font-mono text-slate-400">{row.rowNumber}</td>
                    <td className="p-2.5 font-mono font-medium">{row.data["Student No"]}</td>
                    <td className="p-2.5 font-semibold text-slate-900">
                      {row.data["Surname"]}, {row.data["First Name"]}
                    </td>
                    <td className="p-2.5">{row.data["Gender"]}</td>
                    <td className="p-2.5">{row.data["Class"]}</td>
                    <td className="p-2.5">
                      {row.isValid ? (
                        <span className="text-[10px] text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded font-semibold">
                          Valid
                        </span>
                      ) : (
                        <span className="text-[10px] text-rose-700 font-semibold">
                          {row.errors.join(", ")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
