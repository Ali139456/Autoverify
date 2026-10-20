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

const fieldClass =
  "w-full rounded-xl border border-white/10 bg-[#010626] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-[#4da3ff]/50 focus:ring-2 focus:ring-[#2563eb]/40 disabled:opacity-60";

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
        className="rounded-2xl border border-emerald-500/30 bg-emerald-950/40 px-5 py-6 text-sm text-emerald-100 backdrop-blur-sm"
        role="status"
      >
        <p className="font-semibold text-white">Message sent</p>
        <p className="mt-2 leading-relaxed text-emerald-100/90">
          Thanks for contacting Auto Verifi. We will reply to your email as soon
          as we can.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm font-semibold text-[#93c5fd] hover:text-white"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-white/10 bg-[#010626]/70 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-6"
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
        <span className="mb-1.5 block text-slate-300">Name</span>
        <input
          name="name"
          required
          autoComplete="name"
          placeholder="Name"
          disabled={status === "sending"}
          className={fieldClass}
        />
      </label>

      <label className="mt-4 block text-sm">
        <span className="mb-1.5 block text-slate-300">Email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="Email"
          disabled={status === "sending"}
          className={fieldClass}
        />
      </label>

      <label className="mt-4 block text-sm">
        <span className="mb-1.5 block text-slate-300">
          Phone <span className="text-slate-500">(optional)</span>
        </span>
        <input
          type="tel"
          name="phone"
          autoComplete="tel"
          placeholder="Phone"
          disabled={status === "sending"}
          className={fieldClass}
        />
      </label>

      <label className="mt-4 block text-sm">
        <span className="mb-1.5 block text-slate-300">Topic</span>
        <select
          name="subject"
          defaultValue={SUBJECTS[0]}
          disabled={status === "sending"}
          className={fieldClass}
        >
          {SUBJECTS.map((option) => (
            <option key={option} value={option} className="bg-[#010626] text-white">
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-4 block text-sm">
        <span className="mb-1.5 block text-slate-300">Message</span>
        <textarea
          name="message"
          required
          minLength={10}
          rows={5}
          disabled={status === "sending"}
          placeholder="How can we help?"
          className={`${fieldClass} resize-y`}
        />
      </label>

      {error ? (
        <p className="mt-4 text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "sending"}
        className="btn-shine group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#3b82f6] px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_28px_rgba(37,99,235,0.35)] transition hover:from-[#1d4ed8] hover:to-[#2563eb] disabled:opacity-60"
      >
        {status === "sending" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Sending…
          </>
        ) : (
          <>
            Send message
            <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </>
        )}
      </button>
    </form>
  );
}
