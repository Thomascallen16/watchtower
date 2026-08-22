import { describe, expect, it } from "vitest";
import { integrationSchema } from "../shared/watchtower";

describe("integration schema", () => {
  it("accepts official-provider metadata without any password or raw token field", () => {
    const input = integrationSchema.parse({ provider: "Example provider", authorizationMethod: "oauth2", supportedData: ["devices"], scopes: ["devices.read"] });
    expect(input).toMatchObject({ provider: "Example provider", authorizationMethod: "oauth2" });
    expect(Object.keys(input)).not.toContain("password");
    expect(Object.keys(input)).not.toContain("token");
  });
});
