export const TRUTH_CLASSES = ["FACT", "LAW", "CLAIM", "INFERENCE", "CONTRADICTION", "QUESTION", "UNKNOWN"] as const;
export type TruthClass = (typeof TRUTH_CLASSES)[number];

export const AUTHORITY_LEVELS = [0, 1, 2, 3, 4, 5] as const;
export type AuthorityLevel = (typeof AUTHORITY_LEVELS)[number];

export type AgentCapability =
  | "observe"
  | "analyze"
  | "prepare"
  | "execute_reversible"
  | "execute_consequential"
  | "prohibited";

export interface EvidenceRef {
  evidenceId: string;
  sourceUrl?: string;
  sourceCitation?: string;
  exactSnippet?: string;
  contentHash?: string;
  capturedAt: string;
  verified: boolean;
}

export interface AgentTask {
  id: string;
  agentId: string;
  objective: string;
  authority: AuthorityLevel;
  createdAt: string;
  requiresHumanApproval: boolean;
}

export interface AgentEvent {
  id: string;
  taskId: string;
  agentId: string;
  type: "task.created" | "tool.called" | "evidence.created" | "finding.created" | "approval.requested" | "action.executed" | "action.denied" | "task.failed";
  at: string;
  detail: Record<string, unknown>;
}

export interface EvidenceRecord {
  id: string;
  statement: string;
  classification: TruthClass;
  evidence?: string;
  source?: EvidenceRef;
  unknown?: string;
  createdAt: string;
  agentId: string;
}

export interface ActionRequest {
  name: string;
  authorityRequired: AuthorityLevel;
  consequence: "none" | "reversible" | "consequential" | "prohibited";
  requiresHumanApproval: boolean;
}
