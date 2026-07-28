import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createAuth } from "@/features/auth/server/auth";

async function handle(request: Request): Promise<Response> {
  const { env } = await getCloudflareContext({ async: true });
  return createAuth(env.DB, env.AUTH_SECRET).handler(request);
}

export const GET = handle;
export const POST = handle;

