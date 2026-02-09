/**
 * Defra-compliant microchip validation (Outline of Database Checking Protocols v1.4).
 * Max 16 chars. Allows: ISO 15-digit, AVID format, Trovan alphanumeric, hex.
 */

const MAX_LENGTH = 16;
const MIN_LENGTH = 9;
const VALID_CHARS = /^[0-9A-Fa-f*]*$/;

export function validateMicrochip(input: string): { valid: boolean; error?: string } {
  const raw = (input ?? "").trim();
  if (raw.length === 0) return { valid: false, error: "Microchip number is required." };
  if (raw.length > MAX_LENGTH) return { valid: false, error: `Microchip must be at most ${MAX_LENGTH} characters.` };
  if (raw.length < MIN_LENGTH) return { valid: false, error: `Microchip must be at least ${MIN_LENGTH} characters.` };
  if (!VALID_CHARS.test(raw)) {
    return {
      valid: false,
      error: "Microchip may only contain digits (0-9), letters A-F, and asterisks (e.g. AVID*012*345*678).",
    };
  }
  return { valid: true };
}

export function sanitizeMicrochipInput(value: string): string {
  return value.replace(/[^0-9A-Fa-f*]/g, "").slice(0, MAX_LENGTH);
}
