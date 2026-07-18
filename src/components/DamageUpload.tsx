"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Upload } from "lucide-react";

export function DamageUpload({ reportId }: { reportId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyze() {
    if (files.length === 0) {
      setError("Select at least one photo of the vehicle first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("reportId", reportId);
      files.forEach((f) => form.append("photos", f));
      const res = await fetch("/api/damage/analyze", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed.");
      setFiles([]);
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border-2 border-dashed border-white/15 bg-ink-950/60 p-6 text-center">
      <Camera className="mx-auto h-8 w-8 text-accent-400" aria-hidden />
      <p className="mt-2 text-sm font-medium text-slate-300">
        Upload up to 8 photos of the car (exterior panels work best)
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 8))}
        className="mx-auto mt-4 block text-sm text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-ink-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-accent-700"
      />
      {files.length > 0 && (
        <p className="mt-2 text-xs text-slate-500">
          {files.length} photo{files.length > 1 ? "s" : ""} selected
        </p>
      )}
      <button
        onClick={analyze}
        disabled={loading}
        className="mx-auto mt-4 flex items-center gap-2 rounded-lg bg-accent-600 px-6 py-2.5 font-semibold text-white transition hover:bg-accent-500 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Upload className="h-4 w-4" aria-hidden />
        )}
        {loading ? "Analyzing photos…" : "Run AI damage analysis"}
      </button>
      {error && (
        <p className="mt-3 text-sm font-medium text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
