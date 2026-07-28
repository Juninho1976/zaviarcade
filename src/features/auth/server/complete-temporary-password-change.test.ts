import { describe, expect, it, vi } from "vitest";
import {
  AccountCompletionError,
  completeTemporaryPasswordChange,
} from "./complete-temporary-password-change";

describe("completeTemporaryPasswordChange", () => {
  it("clears the temporary flag by stable user ID after Better Auth rotates the session", async () => {
    const changePassword = vi.fn().mockResolvedValue({ token: "replacement-session" });
    const run = vi.fn().mockResolvedValue({ meta: { changes: 1 } });
    const bind = vi.fn().mockReturnValue({ run });
    const prepare = vi.fn().mockReturnValue({ bind });

    await completeTemporaryPasswordChange({
      auth: { api: { changePassword } } as never,
      currentPassword: "temporary-password",
      database: { prepare } as never,
      newPassword: "new-secure-password",
      requestHeaders: new Headers({ cookie: "old-session" }),
      userId: "stable-user-id",
    });

    expect(changePassword).toHaveBeenCalledWith(expect.objectContaining({
      body: expect.objectContaining({ revokeOtherSessions: true }),
    }));
    expect(bind).toHaveBeenCalledWith(expect.any(String), "stable-user-id");
  });

  it("distinguishes a post-password-change database failure", async () => {
    const auth = { api: { changePassword: vi.fn().mockResolvedValue({}) } } as never;
    const database = {
      prepare: () => ({
        bind: () => ({ run: vi.fn().mockRejectedValue(new Error("D1 unavailable")) }),
      }),
    } as never;

    await expect(completeTemporaryPasswordChange({
      auth,
      currentPassword: "temporary-password",
      database,
      newPassword: "new-secure-password",
      requestHeaders: new Headers(),
      userId: "stable-user-id",
    })).rejects.toBeInstanceOf(AccountCompletionError);
  });
});
