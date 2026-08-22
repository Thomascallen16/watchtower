import { describe, expect, it } from "vitest";
import { createExposureId } from "./exposureId";
import { createExposureEventSchema } from "../shared/watchtower";

describe("exposure-event creation", () => {
  it("accepts a source-backed live event and produces an immutable EXP identifier", () => {
    const event = createExposureEventSchema.parse({
      dataMode: "live",
      eventType: "permission_changed",
      category: "permissions",
      severity: "medium",
      title: "Sensitive permission requires review",
      description: "A supported source reported a permission change.",
      evidenceClassification: "verified",
      sourceName: "Supported provider API",
      riskImpact: 4,
      recommendedActions: ["Review the permission through the provider’s supported controls."],
    });

    expect(event.dataMode).toBe("live");
    expect(createExposureId()).toMatch(/^EXP-[A-Z0-9]{8}$/);
  });
});
