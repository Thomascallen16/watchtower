import { z } from "zod";

/**
 * Optional integration configuration. Credentials are injected through managed
 * secrets and are never rendered to the browser or committed to source control.
 */
export const watchtowerEnvironmentSchema = z.object({
  HIBP_API_KEY: z.string().min(8).optional(),
  TRACKER_INTELLIGENCE_API_KEY: z.string().min(8).optional(),
  TOKEN_REFERENCE_KEY_VERSION: z.string().min(1).max(64).optional(),
});

export function parseWatchtowerEnvironment(environment: Record<string, string | undefined>) {
  return watchtowerEnvironmentSchema.parse(environment);
}

export const watchtowerEnvironment = parseWatchtowerEnvironment(process.env);
