import { describe, expect, it } from "vitest";
import { ApprovalQueue } from "./approval";
import { ModelGateway } from "./model-gateway";
import { ToolGateway } from "./tool-gateway";

const task = { id: "t1", agentId: "researcher", objective: "research", authority: 1 as const, createdAt: "2026-09-02T00:00:00Z", requiresHumanApproval: false };

describe("agent control plane", () => {
  it("only exposes registered tools and enforces policy at call time", async () => {
    const gateway = new ToolGateway();
    gateway.register({ name: "search", description: "Search sources", action: { name: "search", authorityRequired: 0, consequence: "none", requiresHumanApproval: false }, execute: async (input: string) => `found:${input}` });
    expect(await gateway.call(task, "search", "record")).toBe("found:record");
    await expect(gateway.call(task, "send", "request")).rejects.toThrow("Unknown tool");
  });

  it("denies a tool whose authority exceeds the task", async () => {
    const gateway = new ToolGateway();
    gateway.register({ name: "publish", description: "Publish externally", action: { name: "publish", authorityRequired: 4, consequence: "consequential", requiresHumanApproval: true }, execute: async () => "sent" });
    await expect(gateway.call(task, "publish", null)).rejects.toThrow("Tool call denied");
  });

  it("keeps model providers behind an explicit provider boundary", async () => {
    const gateway = new ModelGateway();
    gateway.register({ id: "fake", complete: async (request) => ({ output: request.input.toUpperCase(), model: "fake-v1" }) });
    expect(await gateway.complete("fake", { input: "hello" })).toMatchObject({ output: "HELLO", model: "fake-v1" });
    await expect(gateway.complete("missing", { input: "x" })).rejects.toThrow("Unknown model provider");
  });

  it("requires a single human decision for each consequential request", () => {
    const queue = new ApprovalQueue();
    const request = queue.request(task, { name: "publish", authorityRequired: 1, consequence: "consequential", requiresHumanApproval: true }, "2026-09-02T00:00:00Z");
    expect(queue.pending()).toHaveLength(1);
    expect(queue.decide(request.id, "approved", "2026-09-02T00:01:00Z").status).toBe("approved");
    expect(queue.pending()).toHaveLength(0);
    expect(() => queue.decide(request.id, "rejected")).toThrow("already decided");
  });
});
