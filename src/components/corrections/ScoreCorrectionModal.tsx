// ======================================================================================
// E-SBA Ghana — Score Correction Workflow Modal (Section 24)
// Prevents silent overwriting of submitted/approved marks; ensures audit compliance
// ======================================================================================

import React, { useState } from "react";
import { CorrectionRequest, AssessmentScoreRecord, StudentProfile } from "../../types";
import { AlertTriangle, Send, X, ShieldAlert } from "lucide-react";

interface ScoreCorrectionModalProps {
  scoreRecord: AssessmentScoreRecord;
  student: StudentProfile;
  subjectName: string;
  onRequestCorrection: (req: Partial<CorrectionRequest>) => void;
  onClose: () => void;
}

export const ScoreCorrectionModal: React.FC<ScoreCorrectionModalProps> = ({
  scoreRecord,
  student,
  subjectName,
  onRequestCorrection,
  onClose,
}) => {
  const [componentId, setComponentId] = useState<string>("comp_end_exam");
  const [oldValue, setOldValue] = useState<number>(scoreRecord.examRaw || 0);
  const [proposedValue, setProposedValue] = useState<number>(scoreRecord.examRaw || 0);
  const [reason, setReason] = useState("");

  const handleComponentChange = (id: string) => {
    setComponentId(id);
    const oldVal =
      id === "comp_end_exam"
        ? scoreRecord.examRaw
        : scoreRecord.componentScores[id] || 0;
    setOldValue(oldVal);
    setProposedValue(oldVal);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    onRequestCorrection({
      schoolId: scoreRecord.schoolId,
      scoreRecordId: scoreRecord.id,
      studentId: student.id,
      subjectId: scoreRecord.subjectId,
      componentId,
      oldValue,
      proposedValue,
      reason,
      requestedBy: "Mr. Kofi Mensah (Subject Teacher)",
      requestedAt: new Date().toISOString(),
      status: "PENDING",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Formal Score Correction Request
              </h3>
              <p className="text-[11px] text-slate-500">
                Audited modification workflow for submitted assessment marks
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

        {/* Learner Info */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Learner:</span>
            <strong className="text-slate-900">
              {student.surname}, {student.firstName} ({student.studentNumber})
            </strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Subject:</span>
            <strong className="text-indigo-950">{subjectName}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Current Status:</span>
            <span className="font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.2 rounded text-[10px]">
              {scoreRecord.status}
            </span>
          </div>
        </div>

        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Note:</strong> Modifying approved or published marks requires authorization from the Head of Institution. Previous digital signatures will be invalidated and a new report card version will be created.
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Select Assessment Component:
            </label>
            <select
              value={componentId}
              onChange={(e) => handleComponentChange(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
            >
              <option value="comp_ind_test">Individual Test (15 Marks)</option>
              <option value="comp_grp_work">Group Work (15 Marks)</option>
              <option value="comp_ind_task">Individual Task (15 Marks)</option>
              <option value="comp_prj_work">Project Work (15 Marks)</option>
              <option value="comp_end_exam">End-of-Term Examination (100 Marks)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-500 block mb-1">
                Recorded Score (Old):
              </label>
              <input
                type="number"
                disabled
                value={oldValue}
                className="w-full px-3 py-1.5 bg-slate-100 border border-slate-300 rounded text-xs font-bold text-slate-600"
              />
            </div>
            <div>
              <label className="font-semibold text-indigo-950 block mb-1">
                Proposed Correction:
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={proposedValue}
                onChange={(e) => setProposedValue(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 border border-indigo-500 rounded text-xs font-bold text-indigo-950 focus:ring-1 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Official Justification / Reason:
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Script recount showed learner earned 14 marks on question 3 which was omitted during initial tabulation..."
              className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-indigo-600"
            />
          </div>

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
              className="px-4 py-2 bg-indigo-700 text-white rounded font-semibold hover:bg-indigo-800 inline-flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Correction Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
