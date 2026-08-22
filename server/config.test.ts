import { describe, expect, it } from "vitest";
import { parseWatchtowerEnvironment } from "./config";

describe("Watchtower environment validation", () => {
  it("permits an integration-ready deployment with no optional provider credential", () => {
    expect(parseWatchtowerEnvironment({})).toEqual({});
  });

  it("rejects implausibly short integration credentials", () => {
    expect(() => parseWatchtowerEnvironment({ HIBP_API_KEY: "short" })).toThrow();
  });
});
