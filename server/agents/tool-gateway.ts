import { authorizeAction } from "./policy";
import { ApprovalQueue } from "./approval";
import type { ActionRequest, AgentTask } from "./types";

export interface ToolDefinition<TInput = unknown, TOutput = unknown> {
  name: string;
  description: string;
  action: ActionRequest;
  execute: (input: TInput) => Promise<TOutput>;
}

/** Policy-enforced tool boundary. Consequential tools can only execute with a matching, one-time human approval. */
export class ToolGateway {
  private readonly tools = new Map<string, ToolDefinition>();

  constructor(private readonly approvals = new ApprovalQueue()) {}

  register<TInput, TOutput>(tool: ToolDefinition<TInput, TOutput>): void {
    if (this.tools.has(tool.name)) throw new Error(`Tool already registered: ${tool.name}`);
    this.tools.set(tool.name, tool as ToolDefinition);
  }

  describe(): Array<Pick<ToolDefinition, "name" | "description" | "action">> {
    return [...this.tools.values()].map(({ name, description, action }) => ({ name, description, action }));
  }

  async call<TInput, TOutput>(task: AgentTask, name: string, input: TInput): Promise<TOutput> {
    const tool = this.tools.get(name) as ToolDefinition<TInput, TOutput> | undefined;
    if (!tool) throw new Error(`Unknown tool: ${name}`);
    const decision = authorizeAction(task, tool.action);
    if (!decision.allowed) {
      if (decision.requiresHumanApproval) {
        const approval = this.approvals.request(task, tool.action, input);
        throw new Error(`Human approval required: ${approval.id}`);
      }
      throw new Error(`Tool call denied: ${decision.reason}`);
    }
    return tool.execute(input);
  }

  /** Execute exactly the action+input that a human approved. The approval is consumed before execution. */
  async callApproved<TInput, TOutput>(task: AgentTask, name: string, input: TInput, approvalId: string): Promise<TOutput> {
    const tool = this.tools.get(name) as ToolDefinition<TInput, TOutput> | undefined;
    if (!tool) throw new Error(`Unknown tool: ${name}`);
    const decision = authorizeAction(task, tool.action);
    if (!decision.requiresHumanApproval || decision.reason === "Prohibited action.") {
      throw new Error("Approved execution is only valid for an action that requires human approval.");
    }
    this.approvals.consume(approvalId, task, tool.action, input);
    return tool.execute(input);
  }

  getApprovalQueue(): ApprovalQueue {
    return this.approvals;
  }
}
