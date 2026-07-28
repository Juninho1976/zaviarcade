import { getCloudflareContext } from "@opennextjs/cloudflare";
export type CommunityComment = { id: number; authorId: string; authorName: string; body: string; category: string; gameSlug: string | null; createdAt: string; reports: number };
export async function listCommunityComments(limit = 8, before?: string): Promise<CommunityComment[]> {
  const { env } = await getCloudflareContext({ async: true });
  const query = `SELECT c.id, c.author_id authorId, u.name authorName, c.body, c.category, c.game_slug gameSlug, c.created_at createdAt, COUNT(r.id) reports FROM community_comments c JOIN "user" u ON u.id = c.author_id LEFT JOIN community_comment_reports r ON r.comment_id = c.id WHERE c.removed_at IS NULL ${before ? "AND c.created_at < ?" : ""} GROUP BY c.id ORDER BY c.created_at DESC, c.id DESC LIMIT ?`;
  const result = before ? await env.DB.prepare(query).bind(before, limit).all<CommunityComment>() : await env.DB.prepare(query).bind(limit).all<CommunityComment>();
  return result.results;
}
export async function listReportedCommunityComments(): Promise<CommunityComment[]> {
  const { env } = await getCloudflareContext({ async: true });
  const result = await env.DB.prepare(`SELECT c.id, c.author_id authorId, u.name authorName, c.body, c.category, c.game_slug gameSlug, c.created_at createdAt, COUNT(r.id) reports FROM community_comments c JOIN "user" u ON u.id = c.author_id JOIN community_comment_reports r ON r.comment_id = c.id WHERE c.removed_at IS NULL GROUP BY c.id HAVING COUNT(r.id) > 0 ORDER BY reports DESC, c.created_at DESC`).all<CommunityComment>();
  return result.results;
}
