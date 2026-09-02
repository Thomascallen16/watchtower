import type { AgentEvent, AgentTask } from "./types";

export type AgentHandler<TInput = unknown, TOutput = unknown> = (input: TInput, context: AgentContext) => Promise<TOutput>;

export interface AgentDefinition<TInput = unknown, TOutput = unknown> {
  id: string;
  description: string;
  handler: AgentHandler<TInput, TOutput>;
}

export interface AgentContext {
  task: AgentTask;
  emit: (event: Omit<AgentEvent, "id">) => AgentEvent;
}

export class AgentRegistry {
  private readonly agents = new Map<string, AgentDefinition>();

  register<TInput, TOutput>(agent: AgentDefinition<TInput, TOutput>): void {
    if (this.agents.has(agent.id)) throw new Error(`Agent already registered: ${agent.id}`);
    this.agents.set(agent.id, agent as AgentDefinition);
  }

  has(id: string): boolean {
    return this.agents.has(id);
  }

  async run<TInput, TOutput>(id: string, input: TInput, task: AgentTask): Promise<{ output: TOutput; events: AgentEvent[] }> {
    const agent = this.agents.get(id) as AgentDefinition<TInput, TOutput> | undefined;
    if (!agent) throw new Error(`Unknown agent: ${id}`);
    const events: AgentEvent[] = [];
    const emit = (event: Omit<AgentEvent, "id">): AgentEvent => {
      const complete = Object.freeze({ ...event, id: `${task.id}:event:${events.length}` });
      events.push(complete);
      return complete;
    };
    const output = await agent.handler(input, { task, emit });
    return { output, events };
  }
}

export interface ScheduledJob {
  id: string;
  agentId: string;
  intervalMs: number;
  enabled: boolean;
  nextRunAt: number;
}

/** In-memory scheduler primitive. Persistence belongs in the production job store. */
export function dueJobs(jobs: ScheduledJob[], now = Date.now()): ScheduledJob[] {
  return jobs.filter((job) => job.enabled && job.nextRunAt <= now);
}

export function advanceJob(job: ScheduledJob, now = Date.now()): ScheduledJob {
  if (job.intervalMs <= 0) throw new Error("Scheduled job interval must be positive.");
  return { ...job, nextRunAt: Math.max(job.nextRunAt + job.intervalMs, now + job.intervalMs) };
}
