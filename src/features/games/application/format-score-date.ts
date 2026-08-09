const scoreDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  hour: "2-digit",
  hourCycle: "h23",
  minute: "2-digit",
  month: "short",
  timeZone: "UTC",
  year: "numeric",
});

export function formatScoreDate(scoredAt: string): string {
  return `${scoreDateFormatter.format(new Date(scoredAt))} UTC`;
}
