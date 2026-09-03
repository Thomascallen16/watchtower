import { createHash } from "node:crypto";
import type { ActionRequest, AgentTask } from "./types";

export interface ApprovalRequest {
  id: string;
  taskId: string;
  agentId: string;
  action: ActionRequest;
  inputHash: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected" | "consumed";
  decidedAt?: string;
  consumedAt?: string;
}

function fingerprint(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value, (_key, item) =>
    item && typeof item === "object" && !Array.isArray(item)
      ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b)))
      : item,
  )).digest("hex");
}

export class ApprovalQueue {
  private readonly requests = new Map<string, ApprovalRequest>();

  request(task: AgentTask, action: ActionRequest, input: unknown = undefined, now = new Date().toISOString()): ApprovalRequest {
    const request: ApprovalRequest = {
      id: `approval:${task.id}:${this.requests.size + 1}`,
      taskId: task.id,
      agentId: task.agentId,
      action,
      inputHash: fingerprint(input),
      createdAt: now,
      status: "pending",
    };
    this.requests.set(request.id, request);
    return request;
  }

  decide(id: string, decision: "approved" | "rejected", now = new Date().toISOString()): ApprovalRequest {
    const existing = this.requests.get(id);
    if (!existing) throw new Error(`Unknown approval request: ${id}`);
    if (existing.status !== "pending") throw new Error(`Approval request already decided: ${id}`);
    const updated = { ...existing, status: decision, decidedAt: now };
    this.requests.set(id, updated);
    return updated;
  }

  consume(id: string, task: AgentTask, action: ActionRequest, input: unknown, now = new Date().toISOString()): ApprovalRequest {
    const existing = this.requests.get(id);
    if (!existing) throw new Error(`Unknown approval request: ${id}`);
    if (existing.status !== "approved") throw new Error(`Approval request is not approved: ${id}`);
    if (existing.taskId !== task.id || existing.agentId !== task.agentId) throw new Error("Approval does not match task identity.");
    if (JSON.stringify(existing.action) !== JSON.stringify(action)) throw new Error("Approval does not match requested action.");
    if (existing.inputHash !== fingerprint(input)) throw new Error("Approval does not match requested input.");
    const consumed = { ...existing, status: "consumed" as const, consumedAt: now };
    this.requests.set(id, consumed);
    return consumed;
  }

  pending(): ApprovalRequest[] {
    return [...this.requests.values()].filter((request) => request.status === "pending");
  }
}
