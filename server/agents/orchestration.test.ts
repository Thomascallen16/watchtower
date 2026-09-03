import { describe, expect, it } from "vitest";
import { AgentRegistry, advanceJob, dueJobs } from "./orchestrator";
import { detectContradictions } from "./contradiction";
import { evaluate, passesGate } from "./evaluation";

describe("agent orchestration", () => {
  it("runs only registered agents and records emitted events", async () => {
    const registry = new AgentRegistry();
    registry.register({ id: "echo", description: "test agent", handler: async (input, context) => { context.emit({ taskId: context.task.id, agentId: context.task.agentId, type: "finding.created", at: "2026-09-02T00:00:00Z", detail: { input } }); return input; } });
    const result = await registry.run("echo", "ok", { id: "task-1", agentId: "echo", objective: "test", authority: 1, createdAt: "2026-09-02T00:00:00Z", requiresHumanApproval: false });
    expect(result.output).toBe("ok");
    expect(result.events).toHaveLength(1);
    expect(() => registry.run("missing", "x", { id: "task-2", agentId: "missing", objective: "test", authority: 0, createdAt: "2026-09-02T00:00:00Z", requiresHumanApproval: false })).toThrow("Unknown agent");
  });

  it("finds only explicit same-subject value conflicts", () => {
    const conflicts = detectContradictions([
      { id: "a", statement: "arrival=23:41", sourceId: "cad" },
      { id: "b", statement: "arrival=23:47", sourceId: "report" },
      { id: "c", statement: "arrival=23:41", sourceId: "video" },
    ]);
    expect(conflicts).toHaveLength(2);
    expect(conflicts.map((x) => x.id)).toContain("a:b");
    expect(conflicts.map((x) => x.id)).toContain("b:c");
  });

  it("selects due jobs and advances them without skipping the next interval", () => {
    const jobs = [{ id: "j1", agentId: "researcher", intervalMs: 60000, enabled: true, nextRunAt: 1000 }, { id: "j2", agentId: "researcher", intervalMs: 60000, enabled: false, nextRunAt: 1000 }];
    expect(dueJobs(jobs, 1000).map((job) => job.id)).toEqual(["j1"]);
    expect(advanceJob(jobs[0], 1000).nextRunAt).toBe(61000);
  });

  it("requires an authoritative audit stream for the evaluation gate", async () => {
    const withoutObservation = await evaluate([{ id: "1", input: "a", expected: "A" }], async (input) => input.toUpperCase());
    expect(withoutObservation.summary.safetyObservationAvailable).toBe(false);
    expect(passesGate(withoutObservation.summary)).toBe(false);

    const { summary } = await evaluate(
      [{ id: "1", input: "a", expected: "A" }, { id: "2", input: "b", expected: "B" }],
      async (input) => input.toUpperCase(),
      Object.is,
      { getEvents: () => [] },
    );
    expect(summary.accuracy).toBe(1);
    expect(summary.unauthorizedSideEffects).toBe(0);
    expect(passesGate(summary)).toBe(true);
    expect(passesGate({ ...summary, accuracy: 0.5 })).toBe(false);
    expect(passesGate({ ...summary, unauthorizedSideEffects: 1, zeroUnauthorizedSideEffects: false })).toBe(false);
  });

  it("fails the safety gate when an unauthorized execution is observed", async () => {
    const { summary } = await evaluate(
      [{ id: "1", input: "a", expected: "A" }],
      async (input) => input.toUpperCase(),
      Object.is,
      { getEvents: () => [{ type: "action.executed", authorized: false }] },
    );
    expect(summary.unauthorizedSideEffects).toBe(1);
    expect(summary.zeroUnauthorizedSideEffects).toBe(false);
    expect(passesGate(summary)).toBe(false);
  });
});
