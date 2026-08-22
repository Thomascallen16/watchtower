import { defaultRiskConfig, type RiskCategory, type RiskConfig, type Severity } from "../shared/watchtower";

export type RiskFinding = {
  exposureId: string;
  category: RiskCategory;
  severity: Severity;
  status: "investigate" | "review" | "resolved" | "dismissed";
  riskImpact: number;
  title: string;
};

export type RiskContribution = RiskFinding & {
  contribution: number;
  reductionGuidance: string;
};

export type RiskAssessment = {
  total: number;
  band: "low" | "guarded" | "elevated" | "high" | "critical";
  categoryScores: Record<RiskCategory, number>;
  contributions: RiskContribution[];
  methodology: string;
};

const categoryGuidance: Record<RiskCategory, string> = {
  devices: "Confirm the device is recognized or remove its access through the supported provider.",
  accounts: "Review the connected account’s security settings and revoke unneeded access.",
  permissions: "Remove or narrow the sensitive permission if it is no longer needed.",
  trackers: "Review the tracker relationship and use the service’s supported privacy controls.",
  breaches: "Change exposed credentials, enable MFA, and monitor the affected account.",
  integrations: "Review the integration scopes and disconnect it if the connection is no longer necessary.",
};

const categories: RiskCategory[] = ["devices", "accounts", "permissions", "trackers", "breaches", "integrations"];

function riskBand(total: number): RiskAssessment["band"] {
  if (total <= 20) return "low";
  if (total <= 40) return "guarded";
  if (total <= 60) return "elevated";
  if (total <= 80) return "high";
  return "critical";
}

/**
 * A deterministic, inspectable MVP risk model. The score is capped at 100 and
 * includes only unresolved findings; no behavioral profiling or opaque AI score is used.
 */
export function calculateRiskAssessment(findings: RiskFinding[], config: RiskConfig = defaultRiskConfig): RiskAssessment {
  const severityWeight: Record<Severity, number> = {
    low: config.severityLow,
    medium: config.severityMedium,
    high: config.severityHigh,
    critical: config.severityCritical,
  };
  const resolvedMultiplier = {
    investigate: 1,
    review: config.reviewPercent / 100,
    resolved: 0,
    dismissed: 0,
  } as const;
  const categoryScores = Object.fromEntries(categories.map(category => [category, 0])) as Record<RiskCategory, number>;

  const contributions = findings
    .map(finding => {
      const base = severityWeight[finding.severity] + finding.riskImpact;
      const contribution = Math.max(0, Math.round(base * resolvedMultiplier[finding.status]));
      categoryScores[finding.category] = Math.min(100, categoryScores[finding.category] + contribution);
      return {
        ...finding,
        contribution,
        reductionGuidance: categoryGuidance[finding.category],
      };
    })
    .filter(finding => finding.contribution > 0)
    .sort((a, b) => b.contribution - a.contribution || a.exposureId.localeCompare(b.exposureId));

  const total = Math.min(100, contributions.reduce((sum, finding) => sum + finding.contribution, 0));

  return {
    total,
    band: riskBand(total),
    categoryScores,
    contributions,
    methodology: `Each unresolved finding contributes its configured severity weight plus its explicit impact. Review status applies the configured ${config.reviewPercent}% multiplier; resolved and dismissed findings contribute zero. Scores are capped at 100.`,
  };
}
