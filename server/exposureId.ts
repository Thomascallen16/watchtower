import { customAlphabet } from "nanoid";

const createSuffix = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 8);

/** Generates a compact, immutable exposure identifier safe for public display. */
export function createExposureId(): string {
  return `EXP-${createSuffix()}`;
}
