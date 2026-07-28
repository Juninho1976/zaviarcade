CREATE TABLE community_comments (
  id INTEGER PRIMARY KEY,
  author_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (length(body) BETWEEN 3 AND 500),
  category TEXT NOT NULL DEFAULT 'Comment' CHECK (category IN ('Comment', 'Suggestion', 'Game Review')),
  game_slug TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  removed_at TEXT,
  removed_by TEXT REFERENCES "user"(id),
  removal_reason TEXT
);
CREATE INDEX idx_community_comments_public ON community_comments(removed_at, created_at DESC, id DESC);
CREATE TABLE community_comment_reports (
  id INTEGER PRIMARY KEY,
  comment_id INTEGER NOT NULL REFERENCES community_comments(id) ON DELETE CASCADE,
  reporter_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('Inappropriate language', 'Bullying or harassment', 'Personal information', 'Spam', 'Other')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(comment_id, reporter_id)
);
CREATE INDEX idx_community_reports_comment ON community_comment_reports(comment_id, created_at DESC);
