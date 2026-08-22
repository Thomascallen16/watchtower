import { describe, expect, it } from "vitest";
import { createExposureId } from "./exposureId";

describe("createExposureId", () => {
  it("creates a public immutable identifier in the required EXP format", () => {
    const id = createExposureId();
    expect(id).toMatch(/^EXP-[A-Z0-9]{8}$/);
  });

  it("creates unique identifiers across a representative event batch", () => {
    const ids = new Set(Array.from({ length: 250 }, () => createExposureId()));
    expect(ids).toHaveLength(250);
  });
});
