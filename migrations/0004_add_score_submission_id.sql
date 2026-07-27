ALTER TABLE scores ADD COLUMN submission_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_scores_submission_id
ON scores(submission_id)
WHERE submission_id IS NOT NULL;
