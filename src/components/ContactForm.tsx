"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";

const SUBJECTS = [
  "General enquiry",
  "Report or payment question",
  "Insights+ inspection",
  "Partnership or business",
  "Technical support",
] as const;

async function readJson<T extends object>(
  res: Response,
  fallback: string,
): Promise<T> {
  const raw = await res.text();
  if (!raw.trim()) {
    throw new Error(res.ok ? fallback : `${fallback} (HTTP ${res.status}).`);
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(
      res.ok ? fallback : `${fallback} (HTTP ${res.status}).`,
    );
  }
}

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError(null);

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          subject: data.get("subject"),
          message: data.get("message"),
          company: data.get("company"),
        }),
      });
      const json = await readJson<{ ok?: boolean; error?: string }>(
        res,
        "Could not send message.",
      );
      if (!res.ok) {
        throw new Error(json.error ?? "Could not send message.");
      }
      setStatus("sent");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "Could not send message.",
      );
    }
  }

  if (status === "sent") {
    return (
      <div
        className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-6 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100"
        role="status"
      >
        <p className="font-semibold">Message sent</p>
        <p className="mt-2 leading-relaxed">
          Thanks for contacting Auto Verifi. We will reply to your email as
          soon as we can.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm font-semibold text-[#0073E3] hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-ink-900/80 sm:p-6"
    >
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-slate-700 dark:text-slate-200">
          Name
        </span>
        <input
          name="name"
          required
          autoComplete="name"
          disabled={status === "sending"}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#0073E3]/50 focus:ring-2 focus:ring-[#0073E3]/25 dark:border-white/10 dark:bg-ink-950 dark:text-white"
        />
      </label>

      <label className="mt-4 block text-sm">
        <span className="mb-1.5 block font-medium text-slate-700 dark:text-slate-200">
          Email
        </span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          disabled={status === "sending"}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#0073E3]/50 focus:ring-2 focus:ring-[#0073E3]/25 dark:border-white/10 dark:bg-ink-950 dark:text-white"
        />
      </label>

      <label className="mt-4 block text-sm">
        <span className="mb-1.5 block font-medium text-slate-700 dark:text-slate-200">
          Phone <span className="font-normal text-slate-500">(optional)</span>
        </span>
        <input
          type="tel"
          name="phone"
          autoComplete="tel"
          disabled={status === "sending"}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#0073E3]/50 focus:ring-2 focus:ring-[#0073E3]/25 dark:border-white/10 dark:bg-ink-950 dark:text-white"
        />
      </label>

      <label className="mt-4 block text-sm">
        <span className="mb-1.5 block font-medium text-slate-700 dark:text-slate-200">
          Topic
        </span>
        <select
          name="subject"
          defaultValue={SUBJECTS[0]}
          disabled={status === "sending"}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#0073E3]/50 focus:ring-2 focus:ring-[#0073E3]/25 dark:border-white/10 dark:bg-ink-950 dark:text-white"
        >
          {SUBJECTS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-4 block text-sm">
        <span className="mb-1.5 block font-medium text-slate-700 dark:text-slate-200">
          Message
        </span>
        <textarea
          name="message"
          required
          minLength={10}
          rows={5}
          disabled={status === "sending"}
          placeholder="How can we help?"
          className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#0073E3]/50 focus:ring-2 focus:ring-[#0073E3]/25 dark:border-white/10 dark:bg-ink-950 dark:text-white"
        />
      </label>

      {error ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "sending"}
        className="btn-shine mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0073E3] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#0062c2] disabled:opacity-60"
      >
        {status === "sending" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Sending…
          </>
        ) : (
          <>
            Send message
            <Send className="h-4 w-4" aria-hidden />
          </>
        )}
      </button>
    </form>
  );
}
