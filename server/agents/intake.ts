import { createEvidenceRef } from "./provenance";
import type { AgentEvent, EvidenceRecord, TruthClass } from "./types";

export interface IntakeDocument {
  id: string;
  content: string;
  sourceUrl?: string;
  sourceCitation?: string;
  capturedAt?: string;
  verifiedSource?: boolean;
}

export interface IntakeInput {
  agentId: string;
  document: IntakeDocument;
  statement: string;
  evidence?: string;
  unknown?: string;
  legalAuthorityHint?: boolean;
  now?: string;
}

export interface IntakeResult {
  record: EvidenceRecord;
  events: AgentEvent[];
}

/** Deterministic first stage of Evidence Intake. It never upgrades material to FACT without verified provenance and explicit evidence. */
export async function ingestEvidence(input: IntakeInput): Promise<IntakeResult> {
  const now = input.now ?? new Date().toISOString();
  const evidenceText = input.evidence?.trim() || undefined;
  const unknownText = input.unknown?.trim() || undefined;
  const verified = input.document.verifiedSource === true;
  const source = await createEvidenceRef({
    evidenceId: input.document.id,
    sourceUrl: input.document.sourceUrl,
    sourceCitation: input.document.sourceCitation,
    exactSnippet: evidenceText ?? input.statement.trim(),
    content: input.document.content,
    capturedAt: input.document.capturedAt ?? now,
    verified,
  });

  let classification: TruthClass = "CLAIM";
  if (verified && evidenceText) classification = "FACT";
  else if (verified && input.legalAuthorityHint) classification = "LAW";
  else if (!evidenceText || !verified) classification = unknownText ? "UNKNOWN" : "CLAIM";

  const record: EvidenceRecord = {
    id: input.document.id,
    statement: input.statement.trim(),
    classification,
    evidence: evidenceText,
    source,
    unknown: unknownText,
    createdAt: now,
    agentId: input.agentId,
  };

  const base = { taskId: `intake:${input.document.id}`, agentId: input.agentId, at: now };
  const events: AgentEvent[] = [
    { ...base, id: `${input.document.id}:tool`, type: "tool.called", detail: { tool: "evidence.ingest", documentId: input.document.id } },
    { ...base, id: `${input.document.id}:evidence`, type: "evidence.created", detail: { evidenceId: source.evidenceId, contentHash: source.contentHash, verified: source.verified } },
    { ...base, id: `${input.document.id}:finding`, type: "finding.created", detail: { classification, evidenceId: source.evidenceId } },
  ];
  return { record, events };
}
