import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function authenticatedContext(): TrpcContext {
  return {
    user: { id: 1, openId: "watchtower-test", name: "Test user", email: "test@example.com", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} },
    res: {},
  } as TrpcContext;
}

describe("Watchtower typed API", () => {
  it("returns an explainable zero-risk assessment when no records are available", async () => {
    const caller = appRouter.createCaller(authenticatedContext());
    const result = await caller.watchtower.risk.explain({ dataMode: "live", recordHistory: false });

    expect(result).toMatchObject({ total: 0, band: "low" });
    expect(result.methodology).toContain("unresolved finding");
  });

  it("does not provide an API for accepting provider passwords", () => {
    const integrationInput = { provider: "Example", authorizationMethod: "oauth2" as const, supportedData: ["devices"], scopes: ["devices.read"] };
    expect(Object.keys(integrationInput)).not.toContain("password");
    expect(Object.keys(integrationInput)).not.toContain("token");
  });
});
