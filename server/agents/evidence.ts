import type { EvidenceRecord, TruthClass } from "./types";

export interface ClassificationInput {
  statement: string;
  evidence?: string;
  sourceVerified: boolean;
  sourceSnippet?: string;
  sourceUrl?: string;
  unknown?: string;
  legalAuthority?: boolean;
}

/** Conservative classifier: absence of provenance never becomes FACT. */
export function classifyEvidence(input: ClassificationInput): TruthClass {
  const hasEvidence = Boolean(input.evidence?.trim());
  const hasSource = input.sourceVerified && Boolean(input.sourceSnippet?.trim()) && Boolean(input.sourceUrl?.trim());
  if (input.unknown?.trim() && !hasEvidence) return "UNKNOWN";
  if (input.legalAuthority && hasSource) return "LAW";
  if (hasSource && hasEvidence) return "FACT";
  if (hasEvidence || input.statement.trim()) return "CLAIM";
  return "UNKNOWN";
}

export function buildEvidenceRecord(input: ClassificationInput & { id: string; agentId: string; createdAt?: string }): EvidenceRecord {
  const classification = classifyEvidence(input);
  return {
    id: input.id,
    statement: input.statement,
    classification,
    evidence: input.evidence,
    unknown: input.unknown,
    createdAt: input.createdAt ?? new Date().toISOString(),
    agentId: input.agentId,
    source: input.sourceUrl || input.sourceSnippet ? {
      evidenceId: `${input.id}:source`,
      sourceUrl: input.sourceUrl,
      exactSnippet: input.sourceSnippet,
      capturedAt: input.createdAt ?? new Date().toISOString(),
      verified: input.sourceVerified,
    } : undefined,
  };
}
