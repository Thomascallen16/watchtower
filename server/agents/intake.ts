import { createEvidenceRef } from "./provenance";
import { classifyEvidence } from "./evidence";
import type { AgentEvent, EvidenceRecord } from "./types";

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

/** Deterministic first stage of Evidence Intake. Classification is delegated to the canonical evidence classifier. */
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

  const classification = classifyEvidence({
    statement: input.statement,
    evidence: evidenceText,
    sourceVerified: verified,
    sourceSnippet: source.exactSnippet,
    sourceUrl: source.sourceUrl,
    unknown: unknownText,
    legalAuthority: input.legalAuthorityHint,
  });

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
