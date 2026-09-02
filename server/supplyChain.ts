import { z } from "zod";

/**
 * Evidence-native supply-chain analysis primitives.
 *
 * This module deliberately does not claim exploitability from a CVE alone.
 * It correlates package inventory, vulnerability facts, code reachability,
 * runtime observations, and analyst/agent assessment into an auditable record.
 */

export const supplyChainDependencySchema = z.object({
  name: z.string().trim().min(1).max(214),
  version: z.string().trim().min(1).max(128),
  ecosystem: z.enum(["npm", "pypi", "cargo", "maven", "nuget", "go", "unknown"]),
  manifestPath: z.string().trim().min(1).max(512),
  lockfilePath: z.string().trim().max(512).optional(),
  direct: z.boolean(),
});

export const supplyChainVulnerabilitySchema = z.object({
  id: z.string().trim().min(2).max(128),
  severity: z.enum(["low", "medium", "high", "critical"]),
  affectedRange: z.string().trim().min(1).max(256),
  fixedVersion: z.string().trim().max(128).optional(),
  vulnerableFunctions: z.array(z.string().trim().min(1).max(256)).max(50),
  sourceUrl: z.string().url().max(2048).optional(),
});

export const supplyChainReachabilitySchema = z.object({
  analyzed: z.boolean(),
  vulnerableFunctionReached: z.boolean().optional(),
  reachablePaths: z.array(z.string().trim().min(1).max(512)).max(100),
  attackerControlledInput: z.boolean().optional(),
  notes: z.array(z.string().trim().min(1).max(500)).max(30),
});

export const supplyChainRuntimeSchema = z.object({
  observed: z.boolean(),
  packageExecuted: z.boolean().optional(),
  installScriptExecuted: z.boolean().optional(),
  networkDestinations: z.array(z.string().trim().min(1).max(512)).max(100),
  fileChanges: z.array(z.string().trim().min(1).max(512)).max(100),
  permissionSignals: z.array(z.string().trim().min(1).max(256)).max(50),
});

export const supplyChainAnalysisSchema = z.object({
  dependency: supplyChainDependencySchema,
  vulnerabilities: z.array(supplyChainVulnerabilitySchema).max(100),
  reachability: supplyChainReachabilitySchema,
  runtime: supplyChainRuntimeSchema,
});

export type SupplyChainDependency = z.infer<typeof supplyChainDependencySchema>;
export type SupplyChainVulnerability = z.infer<typeof supplyChainVulnerabilitySchema>;
export type SupplyChainReachability = z.infer<typeof supplyChainReachabilitySchema>;
export type SupplyChainRuntime = z.infer<typeof supplyChainRuntimeSchema>;
export type SupplyChainAnalysis = z.infer<typeof supplyChainAnalysisSchema>;

export type SupplyChainAssessment = {
  severity: "low" | "medium" | "high" | "critical";
  confidence: "low" | "medium" | "high";
  exploitability: "not_established" | "possible" | "likely" | "established";
  evidence: string[];
  unknowns: string[];
  recommendedActions: string[];
};

const severityRank = { low: 1, medium: 2, high: 3, critical: 4 } as const;

function highestSeverity(values: SupplyChainVulnerability["severity"][]): SupplyChainAssessment["severity"] {
  return values.reduce<SupplyChainAssessment["severity"]>((highest, value) =>
    severityRank[value] > severityRank[highest] ? value : highest,
  "low");
}

/**
 * Correlates deterministic evidence. No AI-generated certainty is introduced.
 * A future model gateway can consume this object to produce a separately
 * labeled inference without changing the underlying evidence contract.
 */
export function assessSupplyChainRisk(input: SupplyChainAnalysis): SupplyChainAssessment {
  const analysis = supplyChainAnalysisSchema.parse(input);
  const evidence: string[] = [
    `${analysis.dependency.name}@${analysis.dependency.version} is present in ${analysis.dependency.manifestPath}.`,
  ];
  const unknowns: string[] = [];

  if (analysis.vulnerabilities.length) {
    evidence.push(`Known vulnerability records: ${analysis.vulnerabilities.map(item => item.id).join(", ")}.`);
  }

  if (analysis.reachability.analyzed) {
    evidence.push(
      analysis.reachability.vulnerableFunctionReached
        ? "Static analysis indicates the vulnerable functionality is reachable."
        : "Static analysis did not establish a path to the vulnerable functionality.",
    );
  } else {
    unknowns.push("Code reachability has not been analyzed.");
  }

  if (analysis.reachability.attackerControlledInput === true) {
    evidence.push("A reachable path accepts attacker-controlled input.");
  } else if (analysis.reachability.attackerControlledInput === undefined) {
    unknowns.push("Whether attacker-controlled input reaches the vulnerable path is unknown.");
  }

  if (analysis.runtime.observed) {
    if (analysis.runtime.packageExecuted) evidence.push("Runtime observation shows the package executed.");
    if (analysis.runtime.installScriptExecuted) evidence.push("Runtime observation shows an install script executed.");
    if (analysis.runtime.networkDestinations.length) evidence.push(`Observed network destinations: ${analysis.runtime.networkDestinations.length}.`);
    if (analysis.runtime.fileChanges.length) evidence.push(`Observed file changes: ${analysis.runtime.fileChanges.length}.`);
  } else {
    unknowns.push("Runtime behavior has not been observed.");
  }

  const vulnerableAndReachable = analysis.vulnerabilities.length > 0 && analysis.reachability.vulnerableFunctionReached === true;
  const attackerReachable = vulnerableAndReachable && analysis.reachability.attackerControlledInput === true;
  const exploitability: SupplyChainAssessment["exploitability"] = attackerReachable
    ? "established"
    : vulnerableAndReachable
      ? "likely"
      : analysis.vulnerabilities.length
        ? "possible"
        : "not_established";

  const confidence: SupplyChainAssessment["confidence"] = attackerReachable
    ? "high"
    : analysis.vulnerabilities.length && analysis.reachability.analyzed
      ? "medium"
      : "low";

  const recommendedActions: string[] = [];
  const fixedVersions = analysis.vulnerabilities.map(item => item.fixedVersion).filter(Boolean) as string[];
  if (fixedVersions.length) recommendedActions.push(`Upgrade to a fixed version where compatible (minimum indicated: ${fixedVersions.sort().at(-1)}).`);
  if (!analysis.reachability.analyzed) recommendedActions.push("Run code-level reachability analysis before treating the vulnerability as exploitable.");
  if (!analysis.runtime.observed) recommendedActions.push("Capture sandboxed runtime behavior for the affected dependency.");
  if (analysis.runtime.installScriptExecuted) recommendedActions.push("Review install-script behavior and pin/allowlist the dependency before the next deployment.");
  if (attackerReachable) recommendedActions.push("Prioritize remediation and require human review before consequential deployment changes.");
  if (!recommendedActions.length) recommendedActions.push("Continue monitoring and preserve the evidence chain for future correlation.");

  return {
    severity: highestSeverity(analysis.vulnerabilities.map(item => item.severity)),
    confidence,
    exploitability,
    evidence,
    unknowns,
    recommendedActions,
  };
}
