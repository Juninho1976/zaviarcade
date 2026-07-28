import { describe, expect, it } from "vitest";
import { validateComment } from "./validation";
describe("community comment validation", () => { it("normalises and validates safe messages", () => expect(validateComment("  Hello\n  arcade  ")).toEqual({ value: "Hello\n arcade" })); it("rejects unsafe or invalid messages", () => { expect(validateComment(" ").error).toBeTruthy(); expect(validateComment("x".repeat(501)).error).toBeTruthy(); expect(validateComment("email me a@b.com").error).toBeTruthy(); }); });
