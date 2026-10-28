// ======================================================================================
// E-SBA Ghana — Public Report Authenticity Verifier
// Minimal public exposure adhering to student data privacy standards (Section 28)
// ======================================================================================

import React, { useState } from "react";
import { ShieldCheck, AlertTriangle, CheckCircle, Search } from "lucide-react";
import { verifyReportAuthenticity } from "../../services/signatureService";
import { DEMO_REPORTS, DEMO_SCHOOL, DEMO_STUDENTS } from "../../data/mockData";
import { VerificationResult } from "../../types";

export const PublicReportVerifier: React.FC<{ initialCode?: string }> = ({
  initialCode = "ESBA-2026-9F72A81",
}) => {
  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code.trim()) return;

    const schoolsMap = { [DEMO_SCHOOL.id]: { name: DEMO_SCHOOL.name } };
    const studentsMap = Object.fromEntries(
      DEMO_STUDENTS.map((s) => [s.id, { surname: s.surname, firstName: s.firstName }])
    );

    const res = verifyReportAuthenticity(code, DEMO_REPORTS, schoolsMap, studentsMap);
    setResult(res);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md border border-slate-200">
      <div className="text-center mb-6">
        <div className="inline-flex p-3 bg-indigo-50 text-indigo-700 rounded-full mb-3">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">
          Official Ghana E-SBA Report Verification
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Validate authenticity of printed terminal learner reports issued under the NaCCA Pre-Tertiary Assessment Framework.
        </p>
      </div>

      <form onSubmit={handleVerify} className="flex gap-2 mb-6">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. ESBA-2026-9F72A81"
          className="flex-1 px-3.5 py-2.5 text-sm uppercase tracking-wider font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
        />
        <button
          type="submit"
          className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-sm font-semibold inline-flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Search className="w-4 h-4" />
          Verify
        </button>
      </form>

      {result && (
        <div
          className={`p-5 rounded-lg border text-sm transition-all ${
            result.valid && result.status === "GENUINE_AUTHENTIC"
              ? "bg-emerald-50/70 border-emerald-300"
              : "bg-rose-50/70 border-rose-300"
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            {result.valid ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <h3
              className={`font-bold text-base ${
                result.valid ? "text-emerald-900" : "text-rose-900"
              }`}
            >
              {result.valid
                ? "Authentic & Verified Report Card"
                : "Invalid Or Revoked Report Code"}
            </h3>
          </div>

          <div className="space-y-1.5 text-xs text-slate-700">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Verification Code:</span>
              <span className="font-mono font-bold text-slate-900">{result.verificationCode}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Issuing School:</span>
              <span className="font-semibold text-slate-900">{result.schoolName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Learner Name (Protected):</span>
              <span className="font-semibold text-slate-900">{result.studentInitials}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Academic Year & Term:</span>
              <span className="font-semibold text-slate-900">
                2026/2027 • Term 1
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Status:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  result.valid
                    ? "bg-emerald-200/60 text-emerald-900"
                    : "bg-rose-200/60 text-rose-900"
                }`}
              >
                {result.status}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-4 italic">
            * Note: To protect learner privacy under national child data protection policies, full marks breakdown is withheld from public verification.
          </p>
        </div>
      )}
    </div>
  );
};
