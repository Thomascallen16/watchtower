import { describe, expect, it } from "vitest";
import { calculateRiskAssessment } from "./riskEngine";

describe("calculateRiskAssessment", () => {
  it("provides transparent category contributions and a bounded total", () => {
    const assessment = calculateRiskAssessment([
      { exposureId: "EXP-AAAABBBB", category: "breaches", severity: "high", status: "investigate", riskImpact: 8, title: "Credential exposure" },
      { exposureId: "EXP-CCCCDDDD", category: "permissions", severity: "medium", status: "review", riskImpact: 3, title: "Sensitive permission" },
    ]);

    expect(assessment.total).toBe(42);
    expect(assessment.band).toBe("elevated");
    expect(assessment.categoryScores.breaches).toBe(30);
    expect(assessment.categoryScores.permissions).toBe(12);
    expect(assessment.contributions[0]).toMatchObject({ exposureId: "EXP-AAAABBBB", contribution: 30 });
    expect(assessment.contributions[1]?.reductionGuidance).toContain("permission");
  });

  it("excludes resolved and dismissed findings from the current score", () => {
    const assessment = calculateRiskAssessment([
      { exposureId: "EXP-AAAABBBB", category: "devices", severity: "critical", status: "resolved", riskImpact: 10, title: "Resolved device" },
      { exposureId: "EXP-CCCCDDDD", category: "accounts", severity: "high", status: "dismissed", riskImpact: 10, title: "Dismissed account" },
    ]);

    expect(assessment.total).toBe(0);
    expect(assessment.band).toBe("low");
    expect(assessment.contributions).toEqual([]);
  });

  it("accepts a transparent caller-supplied rules configuration", () => {
    const assessment = calculateRiskAssessment(
      [{ exposureId: "EXP-AAAABBBB", category: "devices", severity: "high", status: "review", riskImpact: 10, title: "Review device" }],
      { severityLow: 3, severityMedium: 8, severityHigh: 20, severityCritical: 40, reviewPercent: 50 },
    );

    expect(assessment.total).toBe(15);
    expect(assessment.methodology).toContain("50% multiplier");
  });
});
