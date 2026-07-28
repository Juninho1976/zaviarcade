const usernamePattern = /^[a-z0-9](?:[a-z0-9._-]{1,28}[a-z0-9])?$/;
const displayNamePattern = /^[\p{L}\p{N}][\p{L}\p{N} _'-]*$/u;

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidUsername(value: string): boolean {
  return usernamePattern.test(normalizeUsername(value));
}

export function normalizeDisplayName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function isValidDisplayName(value: string): boolean {
  const normalized = normalizeDisplayName(value);
  return normalized.length >= 1 && normalized.length <= 24 && displayNamePattern.test(normalized);
}

export function safeReturnTo(value: string | null | undefined, fallback = "/"): string {
  if (!value?.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}

export function generateTemporaryPassword(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

