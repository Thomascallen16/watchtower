import type { ActionRequest, AgentTask, AuthorityLevel } from "./types";

export interface AuthorizationDecision {
  allowed: boolean;
  requiresHumanApproval: boolean;
  reason: string;
}

/** Mechanical boundary between an agent's declared authority and side effects. */
export function authorizeAction(task: AgentTask, action: ActionRequest): AuthorizationDecision {
  // Level 5 is a reserved safety state, never an executable authority.
  if (task.authority === 5) {
    return { allowed: false, requiresHumanApproval: false, reason: "Authority level 5 is reserved and non-executable." };
  }
  if (action.authorityRequired === 5) {
    return { allowed: false, requiresHumanApproval: false, reason: "Actions requiring authority level 5 are non-executable." };
  }
  if (action.consequence === "prohibited") {
    return { allowed: false, requiresHumanApproval: false, reason: "Prohibited action." };
  }
  if (task.authority < action.authorityRequired) {
    return {
      allowed: false,
      requiresHumanApproval: action.requiresHumanApproval,
      reason: `Task authority ${task.authority} is below required authority ${action.authorityRequired}.`,
    };
  }
  if (action.requiresHumanApproval || action.consequence === "consequential") {
    return { allowed: false, requiresHumanApproval: true, reason: "Human approval required before external or consequential side effect." };
  }
  return { allowed: true, requiresHumanApproval: false, reason: "Within declared authority and non-consequential." };
}

export function capabilityForAuthority(level: AuthorityLevel) {
  switch (level) {
    case 0: return "observe" as const;
    case 1: return "analyze" as const;
    case 2: return "prepare" as const;
    case 3: return "execute_reversible" as const;
    case 4: return "execute_consequential" as const;
    default: return "prohibited" as const;
  }
}
