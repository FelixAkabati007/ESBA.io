// ======================================================================================
// E-SBA Ghana — Privacy Policy & Terms of Service Modal
// Aligned with Data Protection Act 2012 (Act 843) and GES Student Data Guidelines
// ======================================================================================

import React from "react";
import { ShieldCheck, X, FileText, Lock } from "lucide-react";

interface LegalModalProps {
  type: "PRIVACY" | "TERMS";
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  const isPrivacy = type === "PRIVACY";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              {isPrivacy ? <Lock className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isPrivacy ? "Privacy Policy & Data Protection" : "Terms of Service & Usage Agreement"}
              </h3>
              <p className="text-xs text-slate-500">
                E-SBA Ghana • Compliant with Data Protection Act 2012 (Act 843)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-5 max-h-[65vh] overflow-y-auto text-xs text-slate-600 space-y-4 leading-relaxed font-sans">
          {isPrivacy ? (
            <>
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">1. Scope of Data Governance</h4>
                <p>
                  E-SBA Ghana processes student academic marks, continuous assessment records (SBA 30%), examination scores (70%), and biometric/demographic information strictly on behalf of accredited Ghanaian basic education institutions (Basic 1 to JHS 3).
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">2. Multi-Tenant Isolation & Row Level Security (RLS)</h4>
                <p>
                  All institutional records are isolated using PostgreSQL Row Level Security (RLS). Teachers and school staff can only access learners enrolled within their authorized school tenancy. Score modifications undergo audit-log tracking preserving prior values, timestamps, and authorized staff IDs.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">3. Learner Safeguarding & Non-Disclosure</h4>
                <p>
                  Student performance metrics and terminal report cards are never monetized, sold, or shared with third-party advertisers. Access is restricted to designated Headteachers, class teachers, and verified student/guardian accounts.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">4. Cryptographic Result Verification</h4>
                <p>
                  Each published terminal report card generates a SHA-256 cryptographic hash and QR code. This allows employers, senior high schools (CSSPS), and district education directorates to verify academic authenticity without exposing non-academic private data.
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">1. Institutional Authorization</h4>
                <p>
                  By creating a School Admin account or accessing the E-SBA platform, you warrant that you are an authorized representative of a recognized Ghana Education Service (GES) or private basic school.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">2. NaCCA NPLAF Compliance</h4>
                <p>
                  Assessments generated through this platform adhere to the National Pre-Tertiary Learning Assessment Framework (NPLAF). Schools are responsible for ensuring that continuous assessment tasks (15 max each) and end-of-term examinations are faithfully entered and moderated before publication.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">3. Score Moderation & Corrections Policy</h4>
                <p>
                  Once scores are approved and published, changes require formal submission of a Score Correction Request specifying original score, proposed score, reason, and headteacher sign-off, maintaining complete audit compliance.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">4. Platform Availability & Offline Mode</h4>
                <p>
                  E-SBA provides Progressive Web App (PWA) offline capabilities. Teachers may record marks in offline environments; changes sync automatically when connectivity is re-established.
                </p>
              </div>
            </>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Last revised: October 2026</span>
            <span className="font-semibold text-indigo-600">Accra, Republic of Ghana</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};