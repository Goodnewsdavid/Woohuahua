/**
 * Defra-compliant microchip validation (Outline of Database Checking Protocols v1.4).
 * Max 16 chars. Allows: ISO 15-digit, AVID format, Trovan alphanumeric, hex.
 */

const MAX_LENGTH = 16;
const MIN_LENGTH = 9;

/** Allowed chars: 0-9, A-F (hex), * (AVID separator) */
const VALID_CHARS = /^[0-9A-Fa-f*]+$/;

export function validateMicrochipFormat(input: string): { valid: true; normalized: string } | { valid: false; error: string } {
  const raw = (input ?? "").trim();
  if (raw.length === 0) {
    return { valid: false, error: "Microchip number is required." };
  }
  if (raw.length > MAX_LENGTH) {
    return { valid: false, error: `Microchip number must be at most ${MAX_LENGTH} characters.` };
  }
  if (raw.length < MIN_LENGTH) {
    return { valid: false, error: `Microchip number must be at least ${MIN_LENGTH} characters.` };
  }
  if (!VALID_CHARS.test(raw)) {
    return {
      valid: false,
      error: "Microchip number may only contain digits (0-9), letters A-F, and asterisks (e.g. AVID format).",
    };
  }
  const normalized = normalizeForSearch(raw);
  if (normalized.length < MIN_LENGTH) {
    return { valid: false, error: "Microchip number appears invalid. Please check the format." };
  }
  return { valid: true, normalized };
}

/** Normalize for storage/search: AVID*012*345*678 -> 012345678, hex kept as-is. */
export function normalizeForSearch(input: string): string {
  const s = (input ?? "").trim().replace(/\*/g, "").replace(/^AVID/i, "");
  return s;
}
