import { describe, expect, it } from "vitest";
import { ingestEvidence } from "./intake";

describe("evidence intake", () => {
  it("creates verified FACT evidence with a content hash", async () => {
    const result = await ingestEvidence({ agentId: "watchtower-evidence", document: { id: "doc-1", content: "Primary source text", sourceUrl: "https://example.test/record", verifiedSource: true }, statement: "The record states X.", evidence: "The record states X.", now: "2026-09-02T10:00:00.000Z" });
    expect(result.record.classification).toBe("FACT");
    expect(result.record.source?.verified).toBe(true);
    expect(result.record.source?.contentHash).toMatch(/^[a-f0-9]{64}$/);
    expect(result.events.map((event) => event.type)).toEqual(["tool.called", "evidence.created", "finding.created"]);
  });

  it("never upgrades unverified material to FACT", async () => {
    const result = await ingestEvidence({ agentId: "watchtower-evidence", document: { id: "doc-2", content: "Unverified text", sourceUrl: "https://example.test/record", verifiedSource: false }, statement: "Someone says X.", evidence: "Someone says X." });
    expect(result.record.classification).toBe("CLAIM");
  });

  it("tracks unresolved gaps as UNKNOWN when evidence is absent", async () => {
    const result = await ingestEvidence({ agentId: "watchtower-evidence", document: { id: "doc-3", content: "Partial record", verifiedSource: false }, statement: "The record may establish X.", unknown: "The primary source has not been verified." });
    expect(result.record.classification).toBe("UNKNOWN");
    expect(result.record.unknown).toContain("not been verified");
  });

  it("recognizes verified legal authority as LAW", async () => {
    const result = await ingestEvidence({ agentId: "watchtower-legal", document: { id: "law-1", content: "Statute text", sourceCitation: "RSMo § 1.010", verifiedSource: true }, statement: "RSMo § 1.010 applies.", legalAuthorityHint: true });
    expect(result.record.classification).toBe("LAW");
  });
});
