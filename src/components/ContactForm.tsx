"use client";

import { useState } from "react";
import { ChevronDown, Loader2, Send } from "lucide-react";

const SUBJECTS = [
  "General enquiry",
  "Report or payment question",
  "Insights+ inspection",
  "Partnership or business",
  "Technical support",
] as const;

const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400";
const fieldClass =
  "w-full rounded-xl border border-white/[0.12] bg-[#070d1a]/80 px-4 py-3.5 text-[15px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition placeholder:text-slate-500 focus:border-[#0073E3]/60 focus:ring-2 focus:ring-[#0073E3]/25 disabled:opacity-60";
const selectFieldClass = `${fieldClass} cursor-pointer appearance-none pr-12`;

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
        className="rounded-2xl border border-[#0073E3]/30 bg-[#0073E3]/10 px-6 py-8 text-center sm:text-left"
        role="status"
      >
        <p className="text-lg font-bold text-white">Thanks — message sent</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          We&apos;ll reply to your email shortly.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-5 text-sm font-semibold text-[#0073E3] hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />

      <p className="text-sm font-semibold text-white">Send a message</p>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block sm:col-span-1">
          <span className={labelClass}>Name</span>
          <input
            name="name"
            required
            autoComplete="name"
            placeholder="Your name"
            disabled={status === "sending"}
            className={fieldClass}
          />
        </label>

        <label className="block sm:col-span-1">
          <span className={labelClass}>Email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            disabled={status === "sending"}
            className={fieldClass}
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>
            Phone <span className="font-normal normal-case text-slate-500">(optional)</span>
          </span>
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            placeholder="04xx xxx xxx"
            disabled={status === "sending"}
            className={fieldClass}
          />
        </label>

        <label className="block">
          <span className={labelClass}>Topic</span>
          <div className="group/select relative">
            <select
              name="subject"
              defaultValue={SUBJECTS[0]}
              disabled={status === "sending"}
              className={selectFieldClass}
            >
              {SUBJECTS.map((option) => (
                <option key={option} value={option} className="bg-[#070d1a] text-white">
                  {option}
                </option>
              ))}
            </select>
            <span
              className="pointer-events-none absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg border border-[#0073E3]/40 bg-gradient-to-b from-[#0073E3]/25 via-[#0073E3]/10 to-transparent shadow-[0_0_20px_rgba(0,115,227,0.2),inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-inset ring-white/10 transition-[transform,box-shadow,border-color] duration-200 group-focus-within/select:rotate-180 group-focus-within/select:border-[#0073E3]/70 group-focus-within/select:shadow-[0_0_24px_rgba(0,115,227,0.35),inset_0_1px_0_rgba(255,255,255,0.16)]"
              aria-hidden
            >
              <ChevronDown className="h-[18px] w-[18px] text-[#5eb3ff] drop-shadow-[0_0_6px_rgba(0,115,227,0.6)]" strokeWidth={2.25} />
            </span>
          </div>
        </label>
      </div>

      <label className="block">
        <span className={labelClass}>Message</span>
        <textarea
          name="message"
          required
          minLength={10}
          rows={6}
          disabled={status === "sending"}
          placeholder="How can we help?"
          className={`${fieldClass} min-h-[140px] resize-y`}
        />
      </label>

      {error ? (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "sending"}
        className="btn-shine group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0073E3] px-6 py-4 text-sm font-bold text-white shadow-[0_12px_40px_rgba(0,115,227,0.35)] transition hover:bg-[#0062c2] disabled:opacity-60 sm:w-auto sm:min-w-[200px]"
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
