"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  splitInspectionAngleLabelLines,
} from "@/lib/inspection-angles";
import { readCaptureGeolocation } from "@/lib/capture-geolocation";
import { mergeInspectionPhotosByAngle } from "@/lib/merge-inspection-photos";
import { prepareInspectionPhoto } from "@/lib/prepare-inspection-photo";
import { Logo } from "@/components/Logo";

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

function allAnglesUploaded(uploaded: Set<string>): boolean {
  return INSPECTION_ANGLES.every((angle) => uploaded.has(angle.id));
}

/** Next capture step after a successful upload (first missing angle ahead, then wrap). */
function findNextStepIndex(uploaded: Set<string>, fromStep: number): number {
  if (allAnglesUploaded(uploaded)) {
    return fromStep;
  }
  for (let i = fromStep + 1; i < INSPECTION_ANGLES.length; i++) {
    if (!uploaded.has(INSPECTION_ANGLES[i].id)) return i;
  }
  for (let i = 0; i < fromStep; i++) {
    if (!uploaded.has(INSPECTION_ANGLES[i].id)) return i;
  }
  return fromStep;
}

const INSPECTION_SUBMITTED_KEY = (reportId: string) =>
  `autoverifi-inspection-submitted:${reportId}`;

function markInspectionSubmitted(reportId: string) {
  try {
    sessionStorage.setItem(INSPECTION_SUBMITTED_KEY(reportId), "1");
  } catch {
    // sessionStorage may be unavailable in strict private modes
  }
}

function tryCloseInspectionTab(): boolean {
  try {
    window.location.replace("https://www.google.com/");
    return true;
  } catch {
    return false;
  }
}

export function InspectionCapture({
  token,
  reportId,
  initialPhotos = [],
}: {
  token: string;
  reportId: string;
  initialPhotos?: UploadedPhoto[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadingRef = useRef(false);
  const [photos, setPhotos] = useState<UploadedPhoto[]>(initialPhotos);
  const [stepIndex, setStepIndex] = useState(0);
  const initialUploaded = useMemo(
    () => new Set(initialPhotos.map((photo) => photo.angle)),
    [initialPhotos],
  );
  const [screen, setScreen] = useState<"capture" | "submit">(() =>
    allAnglesUploaded(initialUploaded) ? "submit" : "capture",
  );
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneMessage, setDoneMessage] = useState<string | null>(null);
  const [exitDismissed, setExitDismissed] = useState(false);

  const currentAngle = INSPECTION_ANGLES[stepIndex];
  const captureAngleLabel = splitInspectionAngleLabelLines(currentAngle.label);
  const captureHint = getInspectionAngleHint(currentAngle.id);
  const uploadedAngles = useMemo(
    () => new Set(photos.map((photo) => photo.angle)),
    [photos],
  );
  const completedCount = uploadedAngles.size;
  const allPhotosComplete = completedCount >= INSPECTION_ANGLES.length;

  const fetchPhotosFromServer = useCallback(async (): Promise<
    UploadedPhoto[] | null
  > => {
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
  }, [token]);

  const applyServerPhotos = useCallback((synced: UploadedPhoto[] | null) => {
    if (!synced) return;
    setPhotos((prev) => mergeInspectionPhotosByAngle(prev, synced));
  }, []);

  useEffect(() => {
    void fetchPhotosFromServer().then(applyServerPhotos);
  }, [fetchPhotosFromServer, applyServerPhotos]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (uploadingRef.current) return;
      void fetchPhotosFromServer().then(applyServerPhotos);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [fetchPhotosFromServer, applyServerPhotos]);

  useEffect(() => {
    if (allPhotosComplete) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [stepIndex, allPhotosComplete]);

  useEffect(() => {
    if (doneMessage) return;
    if (allPhotosComplete && screen === "capture") {
      setScreen("submit");
    }
  }, [allPhotosComplete, screen, doneMessage]);

  async function uploadPhoto(file: File) {
    setUploading(true);
    uploadingRef.current = true;
    setError(null);

    const capturedStep = stepIndex;
    const capturedAngleId = currentAngle.id;

    try {
      const capturedAt = new Date().toISOString();
      const [prepared, geo] = await Promise.all([
        prepareInspectionPhoto(file, capturedAngleId),
        readCaptureGeolocation(),
      ]);
      const form = new FormData();
      form.append("angle", capturedAngleId);
      form.append("photo", prepared, prepared.name);
      form.append("capturedAt", capturedAt);
      if (geo) {
        form.append("latitude", String(geo.latitude));
        form.append("longitude", String(geo.longitude));
        form.append("locationAccuracyM", String(geo.locationAccuracyM));
      }

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

      const synced = await fetchPhotosFromServer();
      let merged: UploadedPhoto[] = [];
      setPhotos((prev) => {
        merged = mergeInspectionPhotosByAngle(prev, [data.photo!], synced ?? []);
        return merged;
      });

      const uploaded = new Set(merged.map((photo) => photo.angle));
      uploaded.add(capturedAngleId);
      const complete = allAnglesUploaded(uploaded);
      if (complete) {
        setScreen("submit");
      } else {
        setStepIndex(findNextStepIndex(uploaded, capturedStep));
      }
    } catch (err) {
      setError(inspectionErrorMessage(err, "Upload failed."));
    } finally {
      uploadingRef.current = false;
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function submitInspection() {
    setSubmitting(true);
    setError(null);

    try {
      const synced = await fetchPhotosFromServer();
      let latest = photos;
      if (synced) {
        setPhotos((prev) => {
          latest = mergeInspectionPhotosByAngle(prev, synced);
          return latest;
        });
      }
      if (latest.length === 0) {
        throw new Error("Upload at least one photo before submitting.");
      }

      const res = await fetch(`/api/inspections/${token}/complete`, {
        method: "POST",
      });
      const data = await readJsonResponse<{
        error?: string;
        complete?: boolean;
        message?: string;
      }>(res, "Submission failed.");
      if (!res.ok) throw new Error(data.error ?? "Submission failed.");

      markInspectionSubmitted(reportId);
      if (data.complete) {
        setDoneMessage(
          "Inspection complete. Your Auto Verifi report has been updated with AI damage analysis.",
        );
      } else {
        setDoneMessage(
          data.message ??
            "Photos saved to your Auto Verifi report. AI damage analysis will be added automatically once condition assessment is complete.",
        );
      }
    } catch (err) {
      setError(inspectionErrorMessage(err, "Submission failed."));
    } finally {
      setSubmitting(false);
    }
  }

  if (screen === "submit" && allPhotosComplete && !doneMessage) {
    return (
      <div className="inspect-capture-page mx-auto flex min-h-[100dvh] max-w-lg flex-col px-4 py-8 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
        <Logo variant="onDark" height={36} linked={false} className="mb-8" />
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <CheckCircle2 className="h-16 w-16 text-emerald-400" aria-hidden />
          <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-white">
            Ready to submit
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
            All {INSPECTION_ANGLES.length} photos are uploaded. Submit now to send
            them for AI condition assessment on your Insights+ report.
          </p>
          {error ? (
            <div
              className="mt-6 w-full rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200"
              role="alert"
            >
              {error}
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => void submitInspection()}
            disabled={submitting}
            className="mt-8 inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-600 to-accent-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-accent-900/40 transition hover:from-accent-500 hover:to-accent-400 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            ) : (
              <Sparkles className="h-5 w-5" aria-hidden />
            )}
            {submitting ? "Submitting…" : "Submit inspection"}
          </button>
          <button
            type="button"
            onClick={() => setScreen("capture")}
            disabled={submitting}
            className="mt-4 text-sm font-medium text-slate-400 underline-offset-2 hover:text-slate-200 hover:underline disabled:opacity-50"
          >
            Review or retake photos
          </button>
        </div>
      </div>
    );
  }

  if (doneMessage) {
    return (
      <div className="inspect-capture-page mx-auto flex min-h-[100dvh] max-w-lg flex-col items-center justify-center px-4 py-10 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] text-center">
        <CheckCircle2 className="h-14 w-14 text-emerald-400" aria-hidden />
        <h1 className="mt-5 text-2xl font-bold text-white">All done</h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
          {doneMessage}
        </p>
        {!exitDismissed ? (
          <button
            type="button"
            onClick={() => {
              tryCloseInspectionTab();
              setExitDismissed(true);
            }}
            className="mt-10 inline-flex w-full max-w-xs items-center justify-center rounded-xl bg-accent-600 px-6 py-3.5 text-base font-bold text-white transition hover:bg-accent-500"
          >
            Exit
          </button>
        ) : null}
        <p className="mt-3 max-w-xs text-[11px] leading-relaxed text-slate-500">
          {exitDismissed
            ? "Inspection complete. Close this browser tab or return to your messages — there is nothing else to do on this link."
            : "Tap Exit to finish. This screen stays here; we will not send you back to the report QR code."}
        </p>
      </div>
    );
  }

  return (
    <div className="inspect-capture-page mx-auto min-h-[100dvh] max-w-lg bg-ink-950 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] text-white">
      <div className="mb-6">
        <Logo variant="onDark" height={36} linked={false} className="mb-4" />
        <h1 className="text-2xl font-extrabold tracking-tight">
          AI condition assessment
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          This takes about 5–10 minutes to complete.
        </p>
        <p className="mt-1 text-sm text-slate-400">
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
            <p className="mt-1 text-lg font-bold leading-snug">
              {captureAngleLabel.primary}
              {captureAngleLabel.secondary ? (
                <>
                  <br />
                  <span className="text-base font-semibold text-slate-300">
                    {captureAngleLabel.secondary}
                  </span>
                </>
              ) : null}
            </p>
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
          <p className="mt-2 max-w-sm text-[11px] leading-relaxed text-slate-500">
            Each photo is time-stamped on your Insights+ report. Allow location
            access when prompted so we can record where the inspection was taken.
          </p>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
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
          {INSPECTION_ANGLES.map((angle, index) => (
            <li key={angle.id}>
              <button
                type="button"
                disabled={uploading}
                onClick={() => setStepIndex(index)}
                className={`w-full rounded-lg px-3 py-2 text-left transition disabled:opacity-50 ${
                  uploadedAngles.has(angle.id)
                    ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : angle.id === currentAngle.id
                      ? "border border-accent-500/30 bg-accent-500/10 text-accent-200"
                      : "border border-white/5 bg-white/[0.03]"
                }`}
              >
                {angle.label}
              </button>
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

      {!allPhotosComplete ? (
        <>
          <p className="mt-4 text-center text-xs text-slate-500">
            You can submit once at least one photo has uploaded. If one angle fails,
            skip it and submit the rest.
          </p>
          <button
            type="button"
            onClick={() => void submitInspection()}
            disabled={submitting || completedCount === 0}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-600 to-accent-500 px-5 py-3.5 text-sm font-bold text-white transition hover:from-accent-500 hover:to-accent-400 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden />
            )}
            {submitting ? "Submitting AI condition images…" : "Submit inspection"}
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setScreen("submit")}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-3.5 text-sm font-bold text-emerald-200 transition hover:bg-emerald-500/20"
        >
          Continue to submit
        </button>
      )}
    </div>
  );
}
