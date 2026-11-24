type ApplicationWorker = {
  fetch(request: Request, env: CloudflareEnv, ctx: ExecutionContext): Response | Promise<Response>;
};

// These paths cannot belong to this Next.js application. Game routes, auth,
// static assets and .well-known requests must continue to pass through.
export function isScanPath(pathname: string): boolean {
  let path: string;
  try {
    path = decodeURIComponent(pathname).toLowerCase();
  } catch {
    return true;
  }
  return /\.(?:php\d*|phtml)(?:\/|$)/.test(path)
    || /(?:^|\/)\.(?:env(?:\.[^/]*)?|git|svn|hg)(?:\/|$)/.test(path)
    || /(?:^|\/)wp-(?:admin|includes|content)(?:\/|$)/.test(path);
}

export function createWorker(loadApplication: () => Promise<{ default: ApplicationWorker }>) {
  return {
    async fetch(request: Request, env: CloudflareEnv, ctx: ExecutionContext): Promise<Response> {
      if (isScanPath(new URL(request.url).pathname)) {
        return new Response(null, { status: 404 });
      }
      // Do not initialise Next.js or authentication for scan traffic.
      const { default: application } = await loadApplication();
      return application.fetch(request, env, ctx);
    },
  };
}
