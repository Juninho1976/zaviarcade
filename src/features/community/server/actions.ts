"use server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { getAuthenticatedPlayer } from "@/features/auth/server/session";
import { commentCategories, reportReasons, validateComment } from "../application/validation";
export type CommunityActionState = { error?: string; success?: string };

export async function publishComment(_: CommunityActionState, formData: FormData): Promise<CommunityActionState> {
  const player = await getAuthenticatedPlayer(); if (!player) return { error: "Please sign in to publish a comment." };
  const checked = validateComment(formData.get("body")); if (!checked.value) return { error: checked.error };
  const category = formData.get("category"); if (!commentCategories.includes(category as typeof commentCategories[number])) return { error: "Choose a valid category." };
  const { env } = await getCloudflareContext({ async: true });
  const recent = await env.DB.prepare("SELECT created_at FROM community_comments WHERE author_id = ? ORDER BY id DESC LIMIT 1").bind(player.id).first<{ created_at: string }>();
  if (recent && Date.now() - new Date(recent.created_at).getTime() < 15_000) return { error: "Please wait a few seconds before posting again." };
  await env.DB.prepare("INSERT INTO community_comments (author_id, body, category, game_slug) VALUES (?, ?, ?, ?)").bind(player.id, checked.value, category, formData.get("gameSlug") || null).run(); revalidatePath("/"); return { success: "Your message is now in the community feed." };
}
export async function reportComment(commentId: number, reason: string) {
  const player = await getAuthenticatedPlayer(); if (!player) return { error: "Please sign in to report a comment." }; if (!reportReasons.includes(reason as typeof reportReasons[number])) return { error: "Choose a valid reason." };
  const { env } = await getCloudflareContext({ async: true }); const found = await env.DB.prepare("SELECT id FROM community_comments WHERE id = ? AND removed_at IS NULL").bind(commentId).first(); if (!found) return { error: "That comment is no longer available." };
  const result = await env.DB.prepare("INSERT OR IGNORE INTO community_comment_reports (comment_id, reporter_id, reason) VALUES (?, ?, ?)").bind(commentId, player.id, reason).run(); return result.meta.changes ? { success: "Thanks — your report was sent to the administrator." } : { error: "You have already reported this comment." };
}
export async function removeComment(commentId: number, reason: string) {
  const player = await getAuthenticatedPlayer(); if (!player) return { error: "Please sign in first." };
  const { env } = await getCloudflareContext({ async: true }); const comment = await env.DB.prepare("SELECT author_id FROM community_comments WHERE id = ? AND removed_at IS NULL").bind(commentId).first<{ author_id: string }>();
  if (!comment || (player.role !== "admin" && comment.author_id !== player.id)) return { error: "You cannot remove this comment." };
  const result = await env.DB.prepare("UPDATE community_comments SET removed_at = CURRENT_TIMESTAMP, removed_by = ?, removal_reason = ? WHERE id = ? AND removed_at IS NULL").bind(player.id, player.role === "admin" ? reason || "Other" : "Removed by author", commentId).run(); if (!result.meta.changes) return { error: "That comment could not be removed." }; revalidatePath("/"); revalidatePath("/admin/community"); return { success: "Comment removed." };
}
