type ScoreSubmissionResponse = {
  error?: unknown;
  scoreId?: unknown;
};

export async function submitGeorgePacManScore(score: number, submissionId: string): Promise<number> {
  const response = await fetch("/api/games/georges-pac-man/scores", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ score, submissionId }),
  });
  const body = await response.json().catch(() => ({})) as ScoreSubmissionResponse;

  if (!response.ok) {
    if (body.error === "Game not found.") {
      throw new Error("This leaderboard is not ready yet. Ask the site administrator to apply the latest database migration, then try saving again.");
    }
    throw new Error(typeof body.error === "string" ? body.error : "Your score could not be saved. Please try again.");
  }
  if (typeof body.scoreId !== "number") {
    throw new Error("The score service returned an unexpected response.");
  }
  return body.scoreId;
}
