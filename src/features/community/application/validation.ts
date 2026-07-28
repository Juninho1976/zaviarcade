export const commentCategories = ["Comment", "Suggestion", "Game Review"] as const;
export const reportReasons = ["Inappropriate language", "Bullying or harassment", "Personal information", "Spam", "Other"] as const;
export function normaliseComment(value: string): string { return value.trim().replace(/\r\n/g, "\n").replace(/[ \t]+/g, " "); }
export function validateComment(value: unknown): { value?: string; error?: string } {
  if (typeof value !== "string") return { error: "Write a message before publishing." };
  const normalised = normaliseComment(value);
  if (normalised.length < 3) return { error: "Comments need at least 3 characters." };
  if (normalised.length > 500) return { error: "Comments can be up to 500 characters." };
  if (/\b(?:https?:\/\/|www\.|\S+@\S+|\+?\d[\d\s()-]{7,}\d)\b/i.test(normalised)) return { error: "Please do not share contact details or links here." };
  return { value: normalised };
}
