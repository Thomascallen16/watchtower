import { describe, expect, it } from "vitest";
import { authorizeAction } from "./policy";
import { buildEvidenceRecord, classifyEvidence } from "./evidence";

const baseTask = { id: "t1", agentId: "evidence-intake", objective: "ingest", authority: 2 as const, createdAt: "2026-09-02T00:00:00Z", requiresHumanApproval: false };

describe("Watchtower evidence-native agent kernel", () => {
  it("never promotes unsupported material to FACT", () => {
    expect(classifyEvidence({ statement: "Agency says X", evidence: "X", sourceVerified: false })).toBe("CLAIM");
    expect(classifyEvidence({ statement: "X", evidence: "X", sourceVerified: true, sourceSnippet: "X", sourceUrl: "https://example.test/source" })).toBe("FACT");
  });

  it("requires human approval for consequential actions", () => {
    const decision = authorizeAction(baseTask, { name: "send-request", authorityRequired: 2, consequence: "consequential", requiresHumanApproval: false });
    expect(decision.allowed).toBe(false);
    expect(decision.requiresHumanApproval).toBe(true);
  });

  it("hard-denies prohibited actions", () => {
    const decision = authorizeAction({ ...baseTask, authority: 5 }, { name: "delete-evidence", authorityRequired: 0, consequence: "prohibited", requiresHumanApproval: false });
    expect(decision.allowed).toBe(false);
  });

  it("preserves an explicit unknown", () => {
    const record = buildEvidenceRecord({ id: "e1", agentId: "evidence-intake", statement: "Unknown", unknown: "Source not yet found", sourceVerified: false });
    expect(record.classification).toBe("UNKNOWN");
  });
});
