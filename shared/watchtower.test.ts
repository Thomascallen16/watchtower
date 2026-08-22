import { describe, expect, it } from "vitest";
import { createExposureEventSchema, demoDisclosure } from "./watchtower";

describe("Watchtower data boundaries", () => {
  it("uses the required disclosure text for simulated information", () => {
    expect(demoDisclosure).toBe("DEMO DATA — NOT A LIVE SECURITY FINDING.");
  });

  it("does not allow the live event creation endpoint to write demo data", () => {
    const result = createExposureEventSchema.safeParse({
      dataMode: "demo",
      eventType: "Demo event",
      category: "devices",
      severity: "low",
      title: "Demo event",
      description: "A simulated event must never enter the live event endpoint.",
      evidenceClassification: "detected",
      sourceName: "Demo source",
      riskImpact: 1,
      recommendedActions: ["Do not persist demo data as live data."],
    });

    expect(result.success).toBe(false);
  });
});
