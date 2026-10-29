// ======================================================================================
// E-SBA Ghana — School Registration & Admin Account Creation Modal
// Onboards Ghanaian Basic Schools (B1 - JHS 3) with GES/MoE district registration
// ======================================================================================

import React, { useState } from "react";
import { School } from "../../types";
import {
  GraduationCap,
  Building2,
  Mail,
  Phone,
  MapPin,
  Lock,
  User,
  ShieldCheck,
  X,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

interface SchoolRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: (newSchool: Partial<School>, adminEmail: string) => void;
  onSwitchToLogin: () => void;
}

const GHANA_REGIONS = [
  "Greater Accra Region",
  "Ashanti Region",
  "Central Region",
  "Eastern Region",
  "Western Region",
  "Volta Region",
  "Northern Region",
  "Upper East Region",
  "Upper West Region",
  "Bono Region",
  "Bono East Region",
  "Ahafo Region",
  "Oti Region",
  "Savannah Region",
  "North East Region",
  "Western North Region",
];

export const SchoolRegistrationModal: React.FC<SchoolRegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegisterSuccess,
  onSwitchToLogin,
}) => {
  const [formData, setFormData] = useState({
    name: "Achimota Basic School",
    shortCode: "ABS",
    region: "Greater Accra Region",
    district: "Ga West Municipal",
    email: "head@achimota-basic.edu.gh",
    phone: "0244123456",
    headTeacherName: "Mrs. Grace Mensah-Bonsu",
    password: "Password123!",
    confirmPassword: "Password123!",
    emisCode: "GES-GAW-2026-042",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Please provide the school name and administrative email.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onRegisterSuccess(
        {
          name: formData.name,
          shortCode: formData.shortCode.toUpperCase(),
          region: formData.region,
          district: formData.district,
          email: formData.email,
          phone: formData.phone,
          headTeacherName: formData.headTeacherName,
        },
        formData.email
      );
    }, 600);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white px-6 py-6 sm:px-8 border-b border-indigo-700/50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/50 border border-indigo-400/30 flex items-center justify-center text-white shadow-inner">
                <GraduationCap className="w-6 h-6 text-indigo-200" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-300">
                  Institutional Registration
                </span>
                <h2 className="text-xl sm:text-2xl font-black font-serif text-white">
                  Register Your Basic School
                </h2>
                <p className="text-xs text-indigo-200/80 mt-0.5">
                  Deploy a dedicated E-SBA multi-tenant instance for Basic 1 to JHS 3
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-indigo-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* School Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official School Name (GES Registered)
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Pokuase Basic School"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Short Code */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                School Short Code (Acronym)
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={formData.shortCode}
                onChange={(e) => setFormData({ ...formData, shortCode: e.target.value.toUpperCase() })}
                placeholder="e.g. PBS"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs uppercase font-mono font-bold focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
              />
            </div>

            {/* GES EMIS Code */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                MoE / GES EMIS Code
              </label>
              <input
                type="text"
                value={formData.emisCode}
                onChange={(e) => setFormData({ ...formData, emisCode: e.target.value })}
                placeholder="e.g. GES-GAW-2026-042"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs font-mono focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
              />
            </div>

            {/* Region */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Administrative Region
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs bg-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
                >
                  {GHANA_REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* District */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Education District / Municipality
              </label>
              <input
                type="text"
                required
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                placeholder="e.g. Ga West Municipal"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
              />
            </div>

            {/* Headteacher Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Headteacher / Administrator
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.headTeacherName}
                  onChange={(e) => setFormData({ ...formData, headTeacherName: e.target.value })}
                  placeholder="e.g. Mr. Samuel Darko"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
                />
              </div>
            </div>

            {/* School Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0244000000"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
                />
              </div>
            </div>

            {/* Admin Email */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                School Administrator Email (Login ID)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@school.edu.gh"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Standards Callout */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-2.5 text-[11px] text-indigo-900 leading-normal">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-indigo-950">NaCCA & Data Protection Guarantee:</strong> Your school tenant is configured with automated 30% SBA continuous assessment weighting, 70% exam weighting, and isolated PostgreSQL storage.
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Creating school instance...</span>
              ) : (
                <>
                  <span>Complete Registration & Launch Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Switch to Login */}
          <div className="text-center pt-1 text-xs text-slate-500">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              Sign in here
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};