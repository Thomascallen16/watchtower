import { createHash } from "node:crypto";
import type { AgentEvent, EvidenceRef } from "./types";

export function sha256(content: string | Buffer): string {
  return createHash("sha256").update(content).digest("hex");
}

export function createEvidenceRef(input: Omit<EvidenceRef, "contentHash" | "capturedAt"> & { content: string; capturedAt?: string }): EvidenceRef {
  return {
    evidenceId: input.evidenceId,
    sourceUrl: input.sourceUrl,
    sourceCitation: input.sourceCitation,
    exactSnippet: input.exactSnippet,
    verified: input.verified,
    contentHash: sha256(input.content),
    capturedAt: input.capturedAt ?? new Date().toISOString(),
  };
}

export function appendEvent(events: AgentEvent[], event: AgentEvent): AgentEvent[] {
  return [...events, Object.freeze({ ...event, detail: Object.freeze({ ...event.detail }) })];
}
