import { authorizeAction } from "./policy";
import type { ActionRequest, AgentTask } from "./types";

export interface ToolDefinition<TInput = unknown, TOutput = unknown> {
  name: string;
  description: string;
  action: ActionRequest;
  execute: (input: TInput) => Promise<TOutput>;
}

export class ToolGateway {
  private readonly tools = new Map<string, ToolDefinition>();

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
    if (!decision.allowed) throw new Error(`Tool call denied: ${decision.reason}`);
    return tool.execute(input);
  }
}
