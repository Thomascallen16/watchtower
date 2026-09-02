import type { ActionRequest, AgentTask } from "./types";

export interface ApprovalRequest {
  id: string;
  taskId: string;
  agentId: string;
  action: ActionRequest;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
  decidedAt?: string;
}

export class ApprovalQueue {
  private readonly requests = new Map<string, ApprovalRequest>();

  request(task: AgentTask, action: ActionRequest, now = new Date().toISOString()): ApprovalRequest {
    const request: ApprovalRequest = {
      id: `approval:${task.id}:${this.requests.size + 1}`,
      taskId: task.id,
      agentId: task.agentId,
      action,
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

  pending(): ApprovalRequest[] {
    return [...this.requests.values()].filter((request) => request.status === "pending");
  }
}
