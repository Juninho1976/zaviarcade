import { betterAuth } from "better-auth";
import { admin, username } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { MIN_PASSWORD_LENGTH } from "@/features/auth/application/validation";

const developmentSecret = "zavi-arcade-local-development-secret-change-me";

function getAuthSecret(secret?: string): string {
  if (secret) return secret;
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  if (process.env.NODE_ENV !== "production") return developmentSecret;
  throw new Error("AUTH_SECRET is required in production.");
}

export function createAuth(database: D1Database, secret?: string, allowSignUp = false) {
  return betterAuth({
    database,
    secret: getAuthSecret(secret),
    baseURL: process.env.BETTER_AUTH_URL,
    basePath: "/api/auth",
    emailAndPassword: {
      enabled: true,
      disableSignUp: !allowSignUp,
      minPasswordLength: MIN_PASSWORD_LENGTH,
      maxPasswordLength: 128,
    },
    user: {
      additionalFields: {
        mustChangePassword: {
          type: "boolean",
          required: true,
          defaultValue: true,
          input: true,
        },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
    },
    rateLimit: {
      enabled: true,
      storage: "database",
      window: 60,
      max: 60,
      customRules: {
        "/sign-in/username": {
          window: 60,
          max: process.env.ZAVI_ARCADE_E2E === "1" ? 100 : 5,
        },
      },
    },
    disabledPaths: [
      ...(!allowSignUp ? ["/sign-up/email"] : []),
      "/is-username-available",
      "/change-email",
      "/forget-password",
      "/reset-password",
    ],
    advanced: {
      database: {
        generateId: () => crypto.randomUUID(),
      },
      cookiePrefix: "zavi-arcade",
      useSecureCookies: process.env.NODE_ENV === "production",
    },
    plugins: [
      username({
        minUsernameLength: 3,
        maxUsernameLength: 30,
        usernameValidator: (value) => /^[a-z0-9](?:[a-z0-9._-]{1,28}[a-z0-9])?$/.test(value),
        validationOrder: { username: "post-normalization" },
      }),
      admin({
        defaultRole: "user",
        adminRoles: ["admin"],
        defaultBanReason: "Account disabled by the Zavi Arcade administrator.",
        bannedUserMessage: "This account is unavailable. Ask your parent or site administrator for help.",
      }),
      nextCookies(),
    ],
  });
}

export type ZaviAuth = ReturnType<typeof createAuth>;
