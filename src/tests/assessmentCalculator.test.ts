import { describe, it, expect } from "vitest";
import {
  DEFAULT_NACCA_SBA_TEMPLATE,
  DEFAULT_NINE_POINT_GRADING_SCALE,
  calculateAssessmentScores,
  calculateCompetitionRankings,
  formatOrdinalPosition,
} from "../services/assessmentCalculator";

describe("Assessment Calculator Service (NaCCA NPLAF)", () => {
  it("accurately computes 30/70 SBA and Exam scaling", () => {
    const scores = {
      comp_ind_test: 12,
      comp_grp_work: 13,
      comp_ind_task: 11,
      comp_prj_work: 14,
      comp_end_exam: 72,
    };

    // Internal total = 12 + 13 + 11 + 14 = 50 / 60
    // Internal scaled = (50 / 60) * 30 = 25.0
    // Exam scaled = (72 / 100) * 70 = 50.4
    // Final total = 25.0 + 50.4 = 75.4

    const result = calculateAssessmentScores(
      DEFAULT_NACCA_SBA_TEMPLATE,
      DEFAULT_NINE_POINT_GRADING_SCALE,
      scores
    );

    expect(result.internalTotal).toBe(50);
    expect(result.internalScaled).toBe(25);
    expect(result.examRaw).toBe(72);
    expect(result.examScaled).toBe(50.4);
    expect(result.finalTotal).toBe(75.4);
    expect(result.grade).toBe("2");
    expect(result.descriptor).toBe("Distinction");
  });

  it("clamps component scores that exceed maximum allowed marks", () => {
    const overflowScores = {
      comp_ind_test: 25, // max is 15
      comp_grp_work: 15,
      comp_ind_task: 15,
      comp_prj_work: 15,
      comp_end_exam: 110, // max is 100
    };

    const result = calculateAssessmentScores(
      DEFAULT_NACCA_SBA_TEMPLATE,
      DEFAULT_NINE_POINT_GRADING_SCALE,
      overflowScores
    );

    // Should clamp test to 15, so internal raw is 60/60 -> 30%
    // Clamps exam to 100, so exam scaled is 70%
    // Final total is 100%
    expect(result.internalTotal).toBe(60);
    expect(result.internalScaled).toBe(30);
    expect(result.examRaw).toBe(100);
    expect(result.examScaled).toBe(70);
    expect(result.finalTotal).toBe(100);
    expect(result.grade).toBe("1");
    expect(result.descriptor).toBe("High Distinction");
  });

  it("calculates Ghanaian standard competition ranking (1, 2, 2, 4...)", () => {
    const classResults = [
      { id: "A", score: 92 },
      { id: "B", score: 85 },
      { id: "C", score: 85 },
      { id: "D", score: 78 },
      { id: "E", score: 60 },
    ];

    const ranked = calculateCompetitionRankings(classResults);

    expect(ranked.find((r) => r.id === "A")?.rank).toBe(1);
    expect(ranked.find((r) => r.id === "B")?.rank).toBe(2);
    expect(ranked.find((r) => r.id === "C")?.rank).toBe(2);
    expect(ranked.find((r) => r.id === "D")?.rank).toBe(4); // competition ranking skips 3
    expect(ranked.find((r) => r.id === "E")?.rank).toBe(5);
  });

  it("formats ordinal positions accurately", () => {
    expect(formatOrdinalPosition(1)).toBe("1st");
    expect(formatOrdinalPosition(2)).toBe("2nd");
    expect(formatOrdinalPosition(3)).toBe("3rd");
    expect(formatOrdinalPosition(4)).toBe("4th");
    expect(formatOrdinalPosition(21)).toBe("21st");
    expect(formatOrdinalPosition(22)).toBe("22nd");
    expect(formatOrdinalPosition(23)).toBe("23rd");
    expect(formatOrdinalPosition(31)).toBe("31st");
  });
});
