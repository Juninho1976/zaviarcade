"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { safeReturnTo } from "@/features/auth/application/validation";

export function LoginForm({ returnTo }: { returnTo: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/sign-in/username", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          username: String(form.get("username") ?? ""),
          password: String(form.get("password") ?? ""),
          rememberMe: true,
        }),
      });
      if (!response.ok) {
        setError("That username or password did not work. Please try again.");
        return;
      }
      router.replace(safeReturnTo(returnTo));
      router.refresh();
    } catch {
      setError("Login is unavailable right now. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={submit}>
      <label className="block font-semibold text-slate-800">
        Username
        <input
          autoCapitalize="none"
          autoComplete="username"
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-cyan-700 focus:ring-2 focus:ring-cyan-200"
          name="username"
          required
        />
      </label>
      <label className="block font-semibold text-slate-800">
        Password
        <input
          autoComplete="current-password"
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-cyan-700 focus:ring-2 focus:ring-cyan-200"
          name="password"
          required
          type="password"
        />
      </label>
      {error ? <p className="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-800" role="alert">{error}</p> : null}
      <button
        className="w-full rounded-xl bg-cyan-800 px-5 py-3 font-bold text-white hover:bg-cyan-950 disabled:cursor-wait disabled:opacity-70"
        disabled={pending}
        type="submit"
      >
        {pending ? "Logging in…" : "Log in and play"}
      </button>
    </form>
  );
}

