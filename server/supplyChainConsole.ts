export type SupplyChainFinding = {
  repository: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "observed" | "action-required" | "consolidation";
  title: string;
  evidence: string;
  recommendedAction: string;
};

export type SupplyChainRepository = {
  name: string;
  role: string;
  disposition: "canonical" | "merge-into-citizens-record" | "merge-into-open-the-record" | "archive-after-migration" | "retain-special-purpose";
  findings: SupplyChainFinding[];
};

/**
 * Evidence manifest produced from the connected GitHub audit on 2026-09-02.
 * This is intentionally conservative: absence of a finding means "not observed
 * by the available audit", not "proven secure".
 */
export const repositoryAudit: SupplyChainRepository[] = [
  { name: "watchtower", role: "security / exposure intelligence", disposition: "canonical", findings: [
    { repository: "watchtower", severity: "medium", status: "action-required", title: "Supply-chain console needs live repository ingestion", evidence: "SCA engine and evidence-native architecture exist, but the connected repository inventory is not yet a live Watchtower data source.", recommendedAction: "Expose repository inventory and scan results through authenticated tRPC procedures; keep write/remediation actions human-approved." }
  ]},
  { name: "The-Citizens-Record", role: "public civic portal", disposition: "canonical", findings: [] },
  { name: "Open-the-Record", role: "private record workspace", disposition: "canonical", findings: [] },
  { name: "citizens-record", role: "full-stack Accountability Platform foundation", disposition: "merge-into-citizens-record", findings: [
    { repository: "citizens-record", severity: "medium", status: "consolidation", title: "Duplicate canonical application repository", evidence: "Repository documentation identifies this as the full-stack foundation while The-Citizens-Record is the public portal; keeping both as top-level products creates architectural duplication.", recommendedAction: "Select the canonical Citizen's Record application, migrate unique production code, then archive the duplicate." }
  ]},
  { name: "ProofFlow", role: "evidence / provenance instrument", disposition: "merge-into-open-the-record", findings: [
    { repository: "ProofFlow", severity: "medium", status: "consolidation", title: "Evidence pipeline should become a workspace subsystem", evidence: "Repository documentation describes ProofFlow as the evidence/provenance instrument rather than a separate end-user product.", recommendedAction: "Recover any unique application source, migrate it into Open-the-Record, preserve provenance schemas, then archive the standalone repository." }
  ]},
  { name: "The-Citizen-Main-File", role: "legacy civic source/archive", disposition: "archive-after-migration", findings: [
    { repository: "The-Citizen-Main-File", severity: "low", status: "consolidation", title: "Legacy source/archive repository", evidence: "Ecosystem architecture identifies this repository as legacy static/source material.", recommendedAction: "Preserve unique source material in the Citizen's Record archive, verify links, then archive the repository." }
  ]},
  { name: "docs", role: "documentation", disposition: "archive-after-migration", findings: [
    { repository: "docs", severity: "low", status: "consolidation", title: "Standalone documentation repository", evidence: "Documentation is a supporting concern rather than one of the two intended top-level products.", recommendedAction: "Move canonical documentation into the appropriate product repository and archive the standalone repository." }
  ]},
  { name: "fear-the-wolves", role: "separate application / experiment", disposition: "archive-after-migration", findings: [
    { repository: "fear-the-wolves", severity: "low", status: "consolidation", title: "Outside the two-product ecosystem", evidence: "Repository is present in the connected account but is not identified as one of the two canonical accountability products.", recommendedAction: "Do not mix unrelated product code into the accountability ecosystem; preserve separately or archive according to its own project needs." }
  ]}
];

export function getSupplyChainConsole() {
  const findings = repositoryAudit.flatMap(repo => repo.findings);
  return {
    generatedAt: "2026-09-02",
    repositories: repositoryAudit,
    findings,
    counts: {
      repositories: repositoryAudit.length,
      findings: findings.length,
      critical: findings.filter(f => f.severity === "critical").length,
      high: findings.filter(f => f.severity === "high").length,
      medium: findings.filter(f => f.severity === "medium").length,
      low: findings.filter(f => f.severity === "low").length,
      canonical: repositoryAudit.filter(r => r.disposition === "canonical").length,
    },
  };
}
