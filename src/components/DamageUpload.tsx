"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Upload } from "lucide-react";
import {
  INSPECTION_ANGLES,
  MANUAL_DAMAGE_UPLOAD_MAX_PHOTOS,
} from "@/lib/inspection-angles";
import { prepareInspectionPhoto } from "@/lib/prepare-inspection-photo";

const MANUAL_PHOTO_CHECKLIST = [
  "Exterior walkaround (passenger/driver corners, roof, windscreen, mirrors, full body sides, boot open)",
  "Four tyre / wheel close-ups",
  "Odometer reading with engine running",
  "Front and rear interior",
  "VIN identification photo",
  "# Keys and registration papers",
] as const;

const ANGLE_IDS = INSPECTION_ANGLES.map((angle) => angle.id);

async function readJsonResponse<T extends object>(
  res: Response,
  fallback: string,
): Promise<T> {
  const raw = await res.text();
  if (!raw.trim()) {
    throw new Error(
      res.ok ? fallback : `${fallback} (HTTP ${res.status}).`,
    );
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    const snippet = raw.trim().slice(0, 200);
    if (/FUNCTION_PAYLOAD_TOO_LARGE|Request Entity Too Large/i.test(snippet)) {
      throw new Error(
        "Upload too large for one request. We resize photos automatically — refresh the page and try again, or use fewer images.",
      );
    }
    throw new Error(
      snippet.startsWith("<")
        ? `${fallback} Server error (HTTP ${res.status}). Try fewer or smaller photos.`
        : snippet || `${fallback} (HTTP ${res.status}).`,
    );
  }
}

export function DamageUpload({ reportId }: { reportId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function analyze() {
    if (files.length === 0) {
      setError("Select at least one photo of the vehicle first.");
      return;
    }
    setLoading(true);
    setError(null);
    setProgress(null);
    try {
      const prepared: File[] = [];
      for (let i = 0; i < files.length; i++) {
        const angleId = ANGLE_IDS[i] ?? `photo_${i + 1}`;
        setProgress(`Preparing photo ${i + 1} of ${files.length}…`);
        prepared.push(await prepareInspectionPhoto(files[i], angleId));
      }

      for (let i = 0; i < prepared.length; i++) {
        const angleId = ANGLE_IDS[i];
        if (!angleId) {
          throw new Error("Too many photos selected for the checklist.");
        }
        setProgress(`Uploading photo ${i + 1} of ${prepared.length}…`);
        const form = new FormData();
        form.append("reportId", reportId);
        form.append("angle", angleId);
        form.append("photo", prepared[i]);
        if (i === prepared.length - 1) {
          form.append("finalize", "1");
        }
        const res = await fetch("/api/damage/analyze", {
          method: "POST",
          body: form,
        });
        const data = await readJsonResponse<{ error?: string; message?: string }>(
          res,
          "Analysis failed.",
        );
        if (!res.ok) {
          throw new Error(data.error ?? "Analysis failed.");
        }
      }

      setFiles([]);
      if (inputRef.current) inputRef.current.value = "";
      setProgress(null);
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Analysis failed.";
      setError(
        /did not match the expected pattern|internal server error/i.test(message)
          ? "Analysis failed. Try fewer or smaller photos, or use the mobile walkaround link above."
          : message,
      );
    } finally {
      setLoading(false);
      setProgress(null);
    }
  }

  return (
    <div className="rounded-xl border-2 border-dashed border-white/15 bg-ink-950/60 p-6 text-center">
      <Camera className="mx-auto h-8 w-8 text-accent-400" aria-hidden />
      <p className="mt-2 text-sm font-medium text-slate-300">
        Prefer to upload images from this device instead? Include up to{" "}
        {MANUAL_DAMAGE_UPLOAD_MAX_PHOTOS} photos in this order:
      </p>
      <ul className="mx-auto mt-3 max-w-md list-inside list-disc text-left text-xs leading-relaxed text-slate-400">
        {MANUAL_PHOTO_CHECKLIST.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mt-3 text-xs font-medium leading-relaxed text-slate-200">
        The report updates automatically after AI analysis completes.
      </p>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">
        Photos are resized and sent one at a time so large camera rolls work on
        mobile. Production Insights+ uses Ravin computer vision (webhook after
        upload), not a separate OpenAI step.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        multiple
        onChange={(e) =>
          setFiles(
            Array.from(e.target.files ?? []).slice(
              0,
              MANUAL_DAMAGE_UPLOAD_MAX_PHOTOS,
            ),
          )
        }
        className="mx-auto mt-4 block text-sm text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-ink-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-accent-700"
      />
      {files.length > 0 && (
        <p className="mt-2 text-xs text-slate-500">
          {files.length} photo{files.length > 1 ? "s" : ""} selected
        </p>
      )}
      <button
        type="button"
        onClick={() => void analyze()}
        disabled={loading}
        className="mx-auto mt-4 flex items-center gap-2 rounded-lg bg-accent-600 px-6 py-2.5 font-semibold text-white transition hover:bg-accent-500 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Upload className="h-4 w-4" aria-hidden />
        )}
        {loading
          ? progress ?? "Analyzing photos…"
          : "Run AI damage analysis"}
      </button>
      {error && (
        <p className="mt-3 text-sm font-medium text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}