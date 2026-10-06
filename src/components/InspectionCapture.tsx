"use client";

import { useMemo, useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  getInspectionAngleHint,
  INSPECTION_ANGLES,
} from "@/lib/inspection-angles";
import { prepareInspectionPhoto } from "@/lib/prepare-inspection-photo";

type UploadedPhoto = {
  angle: string;
  label: string;
  uploadedAt: string;
};

/** Safari reports non-JSON bodies from res.json() as "The string did not match the expected pattern." */
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
    const snippet = raw.trim().slice(0, 120);
    const looksHtml = snippet.startsWith("<");
    throw new Error(
      looksHtml
        ? `${fallback} Server returned an error page (HTTP ${res.status}). Try a smaller photo or check your connection.`
        : snippet || `${fallback} (HTTP ${res.status}).`,
    );
  }
}

function inspectionErrorMessage(err: unknown, fallback: string): string {
  if (!(err instanceof Error)) return fallback;
  if (/did not match the expected pattern|JSON Parse error/i.test(err.message)) {
    return `${fallback} Try a smaller photo or check your connection.`;
  }
  return err.message;
}

export function InspectionCapture({
  token,
  initialPhotos = [],
}: {
  token: string;
  initialPhotos?: UploadedPhoto[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<UploadedPhoto[]>(initialPhotos);
  const [stepIndex, setStepIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneMessage, setDoneMessage] = useState<string | null>(null);

  const currentAngle = INSPECTION_ANGLES[stepIndex];
  const captureHint = getInspectionAngleHint(currentAngle.id);
  const uploadedAngles = useMemo(
    () => new Set(photos.map((photo) => photo.angle)),
    [photos],
  );
  const completedCount = INSPECTION_ANGLES.filter((angle) =>
    uploadedAngles.has(angle.id),
  ).length;

  function findNextStepIndex(
    fromIndex: number,
    uploaded: Set<string>,
  ): number {
    for (let i = fromIndex + 1; i < INSPECTION_ANGLES.length; i++) {
      if (!uploaded.has(INSPECTION_ANGLES[i].id)) return i;
    }
    for (let i = 0; i <= fromIndex; i++) {
      if (!uploaded.has(INSPECTION_ANGLES[i].id)) return i;
    }
    return fromIndex;
  }

  async function fetchPhotosFromServer(): Promise<UploadedPhoto[] | null> {
    const res = await fetch(`/api/inspections/${token}`);
    if (!res.ok) return null;
    try {
      const data = await readJsonResponse<{ photos?: UploadedPhoto[] }>(
        res,
        "Could not refresh photo list.",
      );
      return Array.isArray(data.photos) ? data.photos : null;
    } catch {
      return null;
    }
  }

  async function uploadPhoto(file: File) {
    setUploading(true);
    setError(null);

    const capturedStep = stepIndex;
    const capturedAngleId = currentAngle.id;

    try {
      const prepared = await prepareInspectionPhoto(file, capturedAngleId);
      const form = new FormData();
      form.append("angle", capturedAngleId);
      form.append("photo", prepared, prepared.name);

      const res = await fetch(`/api/inspections/${token}/photos`, {
        method: "POST",
        body: form,
      });
      const data = await readJsonResponse<{
        error?: string;
        photo?: UploadedPhoto;
      }>(res, "Upload failed.");
      if (!res.ok) throw new Error(data.error ?? "Upload failed.");
      if (!data.photo?.angle) {
        throw new Error("Upload did not confirm. Please try again.");
      }

      const optimistic = [
        ...photos.filter((photo) => photo.angle !== capturedAngleId),
        data.photo!,
      ];
      setPhotos(optimistic);

      const synced = await fetchPhotosFromServer();
      const finalPhotos = synced ?? optimistic;
      if (synced) setPhotos(synced);

      const uploaded = new Set(finalPhotos.map((photo) => photo.angle));
      setStepIndex(findNextStepIndex(capturedStep, uploaded));
    } catch (err) {
      setError(inspectionErrorMessage(err, "Upload failed."));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function submitInspection() {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/inspections/${token}/complete`, {
        method: "POST",
      });
      const data = await readJsonResponse<{
        error?: string;
        complete?: boolean;
        message?: string;
      }>(res, "Submission failed.");
      if (!res.ok) throw new Error(data.error ?? "Submission failed.");

      if (data.complete) {
        setDoneMessage(
          "Inspection complete. Your Auto Verifi report has been updated with AI damage analysis.",
        );
      } else {
        setDoneMessage(
          data.message ??
            "Photos sent to Ravin for analysis. Your report will update automatically when processing finishes.",
        );
      }
    } catch (err) {
      setError(inspectionErrorMessage(err, "Submission failed."));
    } finally {
      setSubmitting(false);
    }
  }

  if (doneMessage) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-10 text-center">
        <CheckCircle2 className="h-14 w-14 text-emerald-400" aria-hidden />
        <h1 className="mt-5 text-2xl font-bold text-white">All done</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">{doneMessage}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-[100dvh] max-w-lg bg-ink-950 px-4 py-6 text-white">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent-400">
          Auto Verifi inspection
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight">
          Guided photo capture
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Step {stepIndex + 1} of {INSPECTION_ANGLES.length} · {completedCount} uploaded
        </p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent-600 to-accent-400 transition-all"
            style={{
              width: `${(completedCount / INSPECTION_ANGLES.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-ink-900/80 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setStepIndex((value) => Math.max(0, value - 1))}
            disabled={stepIndex === 0 || uploading}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 disabled:opacity-40"
            aria-label="Previous angle"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>

          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Capture
            </p>
            <p className="mt-1 text-lg font-bold">{currentAngle.label}</p>
            {captureHint ? (
              <p className="mt-1 text-xs font-medium text-slate-400">{captureHint}</p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() =>
              setStepIndex((value) =>
                Math.min(INSPECTION_ANGLES.length - 1, value + 1),
              )
            }
            disabled={stepIndex === INSPECTION_ANGLES.length - 1 || uploading}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 disabled:opacity-40"
            aria-label="Next angle"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-white/15 bg-ink-950/70 px-4 py-8 text-center">
          {uploadedAngles.has(currentAngle.id) ? (
            <CheckCircle2 className="h-10 w-10 text-emerald-400" aria-hidden />
          ) : (
            <Camera className="h-10 w-10 text-accent-400" aria-hidden />
          )}
          <p className="mt-3 text-sm text-slate-300">
            {uploadedAngles.has(currentAngle.id)
              ? "Photo uploaded for this angle."
              : "Use your phone camera to capture this angle clearly."}
          </p>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void uploadPhoto(file);
            }}
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-accent-500 disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Camera className="h-4 w-4" aria-hidden />
            )}
            {uploading
              ? "Uploading…"
              : uploadedAngles.has(currentAngle.id)
                ? "Retake photo"
                : "Take photo"}
          </button>
        </div>

        <ul className="mt-5 grid grid-cols-2 gap-2 text-xs text-slate-400">
          {INSPECTION_ANGLES.map((angle) => (
            <li
              key={angle.id}
              className={`rounded-lg px-3 py-2 ${
                uploadedAngles.has(angle.id)
                  ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : angle.id === currentAngle.id
                    ? "border border-accent-500/30 bg-accent-500/10 text-accent-200"
                    : "border border-white/5 bg-white/[0.03]"
              }`}
            >
              {angle.label}
            </li>
          ))}
        </ul>
      </div>

      {error && (
        <div
          className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200"
          role="alert"
        >
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={() => void submitInspection()}
        disabled={submitting || completedCount === 0}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-600 to-accent-500 px-5 py-3.5 text-sm font-bold text-white transition hover:from-accent-500 hover:to-accent-400 disabled:opacity-50"
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Sparkles className="h-4 w-4" aria-hidden />
        )}
        {submitting ? "Submitting to Ravin…" : "Submit inspection"}
      </button>
    </div>
  );
}
