// ======================================================================================
// E-SBA Ghana — Centralized Assessment Calculation & Grading Engine
// Implements NaCCA & GES Assessment weighting, dynamic grading, and competition ranking
// ======================================================================================

import {
  AssessmentTemplate,
  AssessmentComponent,
  GradingScale,
  GradingScaleItem,
} from "../types";

export interface ComponentScoreInput {
  componentId: string;
  rawScore: number;
}

export interface CalculationResult {
  internalTotal: number;
  internalMax: number;
  internalScaled: number;
  examRaw: number;
  examMax: number;
  examScaled: number;
  finalTotal: number;
  grade: string;
  descriptor: string;
  remark: string;
}

/**
 * Standard Ghanaian 9-Point Scale (WAEC/NaCCA JHS Default)
 */
export const DEFAULT_NINE_POINT_GRADING_SCALE: GradingScale = {
  id: "SCALE_WAEC_9_POINT",
  name: "WAEC / NaCCA 9-Point Grading Scale",
  type: "NINE_POINT_NUMERIC",
  isDefault: true,
  items: [
    { grade: "1", numericalValue: 1, minScore: 80, maxScore: 100, descriptor: "High Distinction", remark: "Exceptional / Highest" },
    { grade: "2", numericalValue: 2, minScore: 75, maxScore: 79.99, descriptor: "Distinction", remark: "Higher / Very Good" },
    { grade: "3", numericalValue: 3, minScore: 70, maxScore: 74.99, descriptor: "High Credit", remark: "High Credit / Good" },
    { grade: "4", numericalValue: 4, minScore: 65, maxScore: 69.99, descriptor: "Credit", remark: "Credit / Above Average" },
    { grade: "5", numericalValue: 5, minScore: 60, maxScore: 64.99, descriptor: "Moderate Credit", remark: "Average" },
    { grade: "6", numericalValue: 6, minScore: 50, maxScore: 59.99, descriptor: "Pass", remark: "Low Credit / Fair" },
    { grade: "7", numericalValue: 7, minScore: 45, maxScore: 49.99, descriptor: "Low Pass", remark: "Pass" },
    { grade: "8", numericalValue: 8, minScore: 40, maxScore: 44.99, descriptor: "Weak Pass", remark: "Weak Pass / Needs Support" },
    { grade: "9", numericalValue: 9, minScore: 0, maxScore: 39.99, descriptor: "Fail / Ungraded", remark: "Fail" },
  ],
};

/**
 * Letter Scale (A-F) typically used for Primary B1-B6
 */
export const PRIMARY_LETTER_GRADING_SCALE: GradingScale = {
  id: "SCALE_PRIMARY_LETTER",
  name: "Primary Standards-Based Letter Scale (A-E)",
  type: "LETTER_SCALE_AF",
  isDefault: false,
  items: [
    { grade: "A*", numericalValue: 1, minScore: 85, maxScore: 100, descriptor: "Advanced (Highly Proficient)", remark: "Excellent" },
    { grade: "A", numericalValue: 2, minScore: 75, maxScore: 84.99, descriptor: "Proficient", remark: "Very Good" },
    { grade: "B", numericalValue: 3, minScore: 65, maxScore: 74.99, descriptor: "Approaching Proficiency", remark: "Good" },
    { grade: "C", numericalValue: 4, minScore: 50, maxScore: 64.99, descriptor: "Developing Proficiency", remark: "Satisfactory" },
    { grade: "D", numericalValue: 5, minScore: 40, maxScore: 49.99, descriptor: "Emerging / Needs Support", remark: "Needs Improvement" },
    { grade: "E", numericalValue: 6, minScore: 0, maxScore: 39.99, descriptor: "Beginning", remark: "Critical Support Required" },
  ],
};

/**
 * Standard NaCCA SBA Template:
 * 4 SBA components (15 marks each = 60 max, scaled to 30%)
 * 1 Exam component (100 marks max, scaled to 70%)
 */
export const DEFAULT_NACCA_SBA_TEMPLATE: AssessmentTemplate = {
  id: "TEMPLATE_NACCA_STANDARD_30_70",
  name: "NaCCA Basic/JHS Standard SBA (30% SBA / 70% Exam)",
  keyPhases: ["KP2", "KP3", "KP4"],
  levels: ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9"],
  internalMax: 60,
  internalWeightPercent: 30,
  examMax: 100,
  examWeightPercent: 70,
  finalMax: 100,
  isDefault: true,
  components: [
    { id: "comp_ind_test", templateId: "TEMPLATE_NACCA_STANDARD_30_70", code: "IND_TEST", name: "Individual Test", componentType: "INDIVIDUAL_TEST", maxScore: 15, isInternalSBA: true, sortOrder: 1 },
    { id: "comp_grp_work", templateId: "TEMPLATE_NACCA_STANDARD_30_70", code: "GRP_WORK", name: "Group Work", componentType: "GROUP_WORK", maxScore: 15, isInternalSBA: true, sortOrder: 2 },
    { id: "comp_ind_task", templateId: "TEMPLATE_NACCA_STANDARD_30_70", code: "IND_TASK", name: "Individual Task", componentType: "INDIVIDUAL_TASK", maxScore: 15, isInternalSBA: true, sortOrder: 3 },
    { id: "comp_prj_work", templateId: "TEMPLATE_NACCA_STANDARD_30_70", code: "PRJ_WORK", name: "Project Work", componentType: "PROJECT", maxScore: 15, isInternalSBA: true, sortOrder: 4 },
    { id: "comp_end_exam", templateId: "TEMPLATE_NACCA_STANDARD_30_70", code: "END_EXAM", name: "Examination", componentType: "END_OF_TERM_EXAM", maxScore: 100, isInternalSBA: false, sortOrder: 5 },
  ],
};

/**
 * Calculates raw SBA total, scaled internal, scaled exam, final total, and grade.
 */
export function calculateAssessmentScores(
  template: AssessmentTemplate,
  gradingScale: GradingScale,
  scores: Record<string, number>
): CalculationResult {
  let internalRawSum = 0;
  let examRawScore = 0;

  for (const comp of template.components) {
    const raw = Number(scores[comp.id] ?? scores[comp.code] ?? 0);
    const validRaw = isNaN(raw) ? 0 : Math.max(0, Math.min(raw, comp.maxScore));

    if (comp.isInternalSBA) {
      internalRawSum += validRaw;
    } else {
      examRawScore = validRaw;
    }
  }

  // Internal scaling: (internalRawSum / internalMax) * internalWeightPercent
  const internalScaled =
    template.internalMax > 0
      ? (internalRawSum / template.internalMax) * template.internalWeightPercent
      : 0;

  // Exam scaling: (examRawScore / examMax) * examWeightPercent
  const examScaled =
    template.examMax > 0
      ? (examRawScore / template.examMax) * template.examWeightPercent
      : 0;

  const finalTotal = Math.min(
    template.finalMax,
    Number((internalScaled + examScaled).toFixed(2))
  );

  const gradeInfo = resolveGrade(finalTotal, gradingScale);

  return {
    internalTotal: Number(internalRawSum.toFixed(2)),
    internalMax: template.internalMax,
    internalScaled: Number(internalScaled.toFixed(2)),
    examRaw: Number(examRawScore.toFixed(2)),
    examMax: template.examMax,
    examScaled: Number(examScaled.toFixed(2)),
    finalTotal,
    grade: gradeInfo.grade,
    descriptor: gradeInfo.descriptor,
    remark: gradeInfo.remark,
  };
}

/**
 * Matches score to grading scale items.
 */
export function resolveGrade(score: number, scale: GradingScale): GradingScaleItem {
  const rounded = Math.round(score * 100) / 100;
  for (const item of scale.items) {
    if (rounded >= item.minScore && rounded <= item.maxScore) {
      return item;
    }
  }
  // Default to lowest grade if no match found
  return scale.items[scale.items.length - 1];
}

/**
 * Calculates Competition Ranking (1, 2, 2, 4...)
 * Handles ties identically according to standard Ghanaian academic reporting.
 */
export function calculateCompetitionRankings<T extends { id: string; score: number }>(
  items: T[]
): Array<T & { rank: number }> {
  const sorted = [...items].sort((a, b) => b.score - a.score);
  const ranked: Array<T & { rank: number }> = [];

  let currentRank = 1;
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i].score < sorted[i - 1].score) {
      currentRank = i + 1;
    }
    ranked.push({
      ...sorted[i],
      rank: currentRank,
    });
  }

  return ranked;
}

/**
 * Format ordinal position (e.g. 1st, 2nd, 3rd, 4th, 21st, 22nd...)
 */
export function formatOrdinalPosition(pos: number): string {
  if (pos <= 0) return "-";
  const s = ["th", "st", "nd", "rd"];
  const v = pos % 100;
  return pos + (s[(v - 20) % 10] || s[v] || s[0]);
}
