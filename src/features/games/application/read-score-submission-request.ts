const maximumBodyBytes = 1_024;

type ScoreSubmissionRequestResult =
  | { success: true; body: unknown }
  | { success: false; message: string; status: 400 | 413 | 415 };

function exceedsMaximumBodySize(value: string): boolean {
  return new TextEncoder().encode(value).byteLength > maximumBodyBytes;
}

export async function readScoreSubmissionRequest(request: Request): Promise<ScoreSubmissionRequestResult> {
  const contentType = request.headers.get("content-type");
  if (!contentType?.toLowerCase().includes("application/json")) {
    return { success: false, status: 415, message: "Content-Type must be application/json." };
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maximumBodyBytes) {
    return { success: false, status: 413, message: "Request body must not exceed 1 KB." };
  }

  let text: string;
  try {
    text = await request.text();
  } catch {
    return { success: false, status: 400, message: "Request body could not be read." };
  }
  if (exceedsMaximumBodySize(text)) {
    return { success: false, status: 413, message: "Request body must not exceed 1 KB." };
  }

  try {
    return { success: true, body: JSON.parse(text) };
  } catch {
    return { success: false, status: 400, message: "Request body must be valid JSON." };
  }
}
