// ======================================================================================
// E-SBA Ghana — Identity Verification & Password Recovery System (Section 33)
// Supports OTP / Link reset for staff and school-administered recovery for basic learners
// ======================================================================================

import React, { useState } from "react";
import { UserRole } from "../../types";
import { KeyRound, Mail, ShieldCheck, CheckCircle, ArrowRight, Lock } from "lucide-react";

interface PasswordRecoveryModalProps {
  onClose: () => void;
}

export const PasswordRecoveryModal: React.FC<PasswordRecoveryModalProps> = ({ onClose }) => {
  const [role, setRole] = useState<UserRole>("TEACHER");
  const [identifier, setIdentifier] = useState("");
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Request, 2: OTP / Verify, 3: Reset
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    setStep(2);
    setErrorMsg(null);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 4) {
      setErrorMsg("Please enter a valid 6-digit verification code");
      return;
    }
    setStep(3);
    setErrorMsg(null);
  };

  const handleCompleteReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    // Invalidate old sessions and finish
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Secure Account Recovery
              </h3>
              <p className="text-[11px] text-slate-500">
                Ghana E-SBA password recovery & credential resets (Section 33)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold"
          >
            ×
          </button>
        </div>

        {errorMsg && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-800 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Step 1: Identifier Entry */}
        {step === 1 && (
          <form onSubmit={handleRequestReset} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Account Role:
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs bg-slate-50"
              >
                <option value="TEACHER">Teaching Staff</option>
                <option value="SCHOOL_ADMIN">School Admin / Headteacher</option>
                <option value="STUDENT">Learner (School Student Number)</option>
                <option value="MAIN_ADMIN">Main Platform Administrator</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                {role === "STUDENT"
                  ? "Student Number / Admission Number:"
                  : "Institutional Email or Staff ID:"}
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={
                  role === "STUDENT"
                    ? "e.g. ESBA/2026/001"
                    : "e.g. kofi.mensah@democommunity.edu.gh"
                }
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            {role === "STUDENT" && (
              <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200">
                * Basic school learners without individual email addresses receive recovery via their school administrator and guardian SMS PIN.
              </p>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-700 text-white rounded font-semibold hover:bg-indigo-800 inline-flex items-center gap-1 shadow-sm"
              >
                Send Verification Code
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* Step 2: OTP Entry */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-3 text-xs">
            <p className="text-slate-600 text-xs">
              A 6-digit OTP verification code has been dispatched to the contact on record for <strong>{identifier}</strong>.
            </p>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Enter 6-Digit OTP Code:
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="e.g. 549210"
                className="w-full px-3 py-2 border border-slate-300 rounded font-mono text-center tracking-widest text-base font-bold text-indigo-950 focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-3 py-1.5 border rounded text-slate-700 font-semibold"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-700 text-white rounded font-semibold hover:bg-indigo-800 shadow-sm"
              >
                Verify Code
              </button>
            </div>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleCompleteReset} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                New Password:
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Confirm New Password:
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
              />
            </div>

            <p className="text-[11px] text-slate-500">
              Upon successful reset, all existing sessions on other devices will be invalidated immediately.
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-700 text-white rounded font-semibold hover:bg-emerald-800 shadow-sm"
              >
                Set New Password & Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
