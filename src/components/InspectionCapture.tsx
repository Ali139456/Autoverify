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
  allRequiredAnglesUploaded,
  getInspectionAngleHint,
  INSPECTION_ANGLES,
  LAV_DIGITAL_INSPECTION_ANGLES,
  requiredInspectionAngles,
  splitInspectionAngleLabelLines,
  type InspectionAngleDef,
} from "@/lib/inspection-angles";
import {
  peekCaptureGeolocation,
  readCaptureGeolocation,
  warmCaptureGeolocation,
} from "@/lib/capture-geolocation";
import { mergeInspectionPhotosByAngle } from "@/lib/merge-inspection-photos";
import {
  findNextCaptureStepIndex,
  normalizeCaptureAngleId,
  persistCaptureStep,
  resolveInitialCaptureStep,
  uploadedAngleIds,
} from "@/lib/inspection-capture-step";
import { prepareInspectionPhoto } from "@/lib/prepare-inspection-photo";
import { Logo } from "@/components/Logo";
import { INSPECTION_CAPTURE_DONE_PENDING_MESSAGE } from "@/lib/damage-processing-copy";

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

type LavConditionChoice = "good" | "fair" | "poor";

export function InspectionCapture({
  token,
  reportId,
  initialPhotos = [],
  angles: initialAngles = INSPECTION_ANGLES,
  lavDigital = false,
  initialVin = "",
}: {
  token: string;
  reportId: string;
  initialPhotos?: UploadedPhoto[];
  angles?: readonly InspectionAngleDef[];
  lavDigital?: boolean;
  initialVin?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadingRef = useRef(false);
  const [angles, setAngles] =
    useState<readonly InspectionAngleDef[]>(initialAngles);
  const [photos, setPhotos] = useState<UploadedPhoto[]>(initialPhotos);
  const [stepIndex, setStepIndex] = useState(() =>
    resolveInitialCaptureStep(reportId, initialPhotos, initialAngles, lavDigital),
  );
  const initialUploaded = useMemo(
    () => uploadedAngleIds(initialPhotos, lavDigital),
    [initialPhotos, lavDigital],
  );
  const [screen, setScreen] = useState<"capture" | "submit">(() =>
    allRequiredAnglesUploaded(initialUploaded, initialAngles)
      ? "submit"
      : "capture",
  );
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneMessage, setDoneMessage] = useState<string | null>(null);
  const [exitDismissed, setExitDismissed] = useState(false);

  const currentAngle = angles[stepIndex] ?? angles[0];
  const captureAngleLabel = splitInspectionAngleLabelLines(currentAngle.label);
  const captureHint = getInspectionAngleHint(currentAngle.id);
  const uploadedAngles = useMemo(
    () => uploadedAngleIds(photos, lavDigital),
    [photos, lavDigital],
  );
  const requiredAngles = useMemo(
    () => requiredInspectionAngles(angles),
    [angles],
  );
  const completedCount = requiredAngles.filter((angle) =>
    uploadedAngles.has(angle.id),
  ).length;
  const allPhotosComplete = allRequiredAnglesUploaded(uploadedAngles, angles);
  const captureTitle = lavDigital
    ? "Digital self inspection — Asset lender verification"
    : "AI condition assessment";
  const captureDuration = lavDigital
    ? "Capture the required images on this phone."
    : "This usually takes about 5 minutes to complete.";
  const [odometerKm, setOdometerKm] = useState("");
  const [odometerSaved, setOdometerSaved] = useState(false);
  const [captureVin, setCaptureVin] = useState(initialVin);
  const [vinSaved, setVinSaved] = useState(false);
  const [conditionGrade, setConditionGrade] = useState<LavConditionChoice | "">(
    "",
  );

  const fetchPhotosFromServer = useCallback(async (): Promise<
    UploadedPhoto[] | null
  > => {
    const res = await fetch(`/api/inspections/${token}`);
    if (!res.ok) return null;
    try {
      const data = await readJsonResponse<{
        photos?: UploadedPhoto[];
        angles?: InspectionAngleDef[];
      }>(res, "Could not refresh photo list.");
      if (lavDigital) {
        setAngles(LAV_DIGITAL_INSPECTION_ANGLES);
      } else if (Array.isArray(data.angles) && data.angles.length > 0) {
        setAngles(data.angles);
      }
      return Array.isArray(data.photos) ? data.photos : null;
    } catch {
      return null;
    }
  }, [token, lavDigital]);

  const applyServerPhotos = useCallback((synced: UploadedPhoto[] | null) => {
    if (!synced) return;
    setPhotos((prev) => mergeInspectionPhotosByAngle(prev, synced));
  }, []);

  useEffect(() => {
    setAngles(lavDigital ? LAV_DIGITAL_INSPECTION_ANGLES : initialAngles);
  }, [initialAngles, lavDigital]);

  useEffect(() => {
    persistCaptureStep(reportId, stepIndex);
  }, [reportId, stepIndex]);

  useEffect(() => {
    setStepIndex((index) =>
      Math.min(index, Math.max(0, angles.length - 1)),
    );
  }, [angles.length]);

  useEffect(() => {
    warmCaptureGeolocation();
    void fetchPhotosFromServer().then(applyServerPhotos);
  }, [fetchPhotosFromServer, applyServerPhotos]);

  useEffect(() => {
    if (!lavDigital) return;
    void fetch(`/api/inspections/${token}/lav-details`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshVehicle: true }),
    }).catch(() => {
      // Non-blocking — booking data remains on the report if lookup fails.
    });
  }, [lavDigital, token]);

  async function saveLavVin() {
    const vin = captureVin.trim().toUpperCase().replace(/\s+/g, "");
    if (vin.length < 8) {
      setError("Enter the full VIN from the identification image.");
      return;
    }
    setError(null);
    const res = await fetch(`/api/inspections/${token}/lav-details`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ captureVin: vin }),
    });
    const data = await readJsonResponse<{ error?: string }>(
      res,
      "Could not save VIN.",
    );
    if (!res.ok) throw new Error(data.error ?? "Could not save VIN.");
    setCaptureVin(vin);
    setVinSaved(true);
  }

  async function saveLavOdometer() {
    const km = Number(odometerKm.replace(/,/g, "").trim());
    if (!Number.isFinite(km) || km <= 0) {
      setError("Enter a valid odometer reading in km.");
      return;
    }
    setError(null);
    const res = await fetch(`/api/inspections/${token}/lav-details`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ odometerKm: km }),
    });
    const data = await readJsonResponse<{ error?: string }>(
      res,
      "Could not save odometer.",
    );
    if (!res.ok) throw new Error(data.error ?? "Could not save odometer.");
    setOdometerSaved(true);
    if (uploadedAngles.has("dashboard")) {
      const vinIndex = angles.findIndex((angle) => angle.id === "vin_plate");
      if (vinIndex >= 0 && !uploadedAngles.has("vin_plate")) {
        setStepIndex(vinIndex);
      }
    }
  }

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
    window.scrollTo({ top: 0, behavior: "auto" });
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
      const prepared = await prepareInspectionPhoto(file, capturedAngleId);
      const geo =
        peekCaptureGeolocation() ??
        (await readCaptureGeolocation({ maxWaitMs: 1500 }));
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

      const merged = mergeInspectionPhotosByAngle(photos, [data.photo!]);
      setPhotos(merged);
      void fetchPhotosFromServer().then(applyServerPhotos);

      const uploaded = uploadedAngleIds(merged, lavDigital);
      const complete = allRequiredAnglesUploaded(uploaded, angles);
      if (complete) {
        setScreen("submit");
      } else {
        const nextStep = findNextCaptureStepIndex(
          uploaded,
          capturedStep,
          angles,
        );
        persistCaptureStep(reportId, nextStep);
        setStepIndex(nextStep);
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

      if (lavDigital) {
        if (!conditionGrade) {
          throw new Error(
            "Select the overall vehicle condition (good, fair or poor) before submitting.",
          );
        }
        const vin = captureVin.trim().toUpperCase().replace(/\s+/g, "");
        const detailRes = await fetch(`/api/inspections/${token}/lav-details`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conditionGrade,
            ...(vin.length >= 8 ? { captureVin: vin } : {}),
          }),
        });
        const detailData = await readJsonResponse<{ error?: string }>(
          detailRes,
          "Could not save inspection details.",
        );
        if (!detailRes.ok) {
          throw new Error(detailData.error ?? "Could not save inspection details.");
        }
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
          lavDigital
            ? "Inspection complete. Your lender asset verification report has been updated with your photos."
            : "Inspection complete. Your Auto Verifi report has been updated with AI damage analysis.",
        );
      } else {
        setDoneMessage(
          data.message ?? INSPECTION_CAPTURE_DONE_PENDING_MESSAGE,
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
            {lavDigital ? (
              <>
                All required images are uploaded. Submit to complete your asset
                verification. Photos are date, time stamped and geo tagged on
                your report.
              </>
            ) : (
              <>
                All {angles.length} photos are uploaded. Submit now to send
                them for AI condition assessment on your Insights+ report.
              </>
            )}
          </p>
          {lavDigital ? (
            <div className="mt-6 w-full max-w-sm text-left">
              <label
                htmlFor="lav-condition-grade"
                className="text-xs font-semibold uppercase tracking-wide text-slate-400"
              >
                Overall vehicle condition <span className="text-amber-300">*</span>
              </label>
              <select
                id="lav-condition-grade"
                value={conditionGrade}
                onChange={(e) =>
                  setConditionGrade(e.target.value as LavConditionChoice | "")
                }
                className="mt-2 w-full rounded-lg border border-white/15 bg-ink-950 px-3 py-2.5 text-sm text-white"
              >
                <option value="">Select…</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Your lender sees this on the verification report — no AI condition
                assessment is used for asset verification.
              </p>
            </div>
          ) : null}
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
            disabled={submitting || (lavDigital && !conditionGrade)}
            className="mt-8 inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-600 to-accent-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-accent-900/40 transition hover:from-accent-500 hover:to-accent-400 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            ) : lavDigital ? (
              <CheckCircle2 className="h-5 w-5" aria-hidden />
            ) : (
              <Sparkles className="h-5 w-5" aria-hidden />
            )}
            {submitting ? "Submitting…" : "Submit images"}
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
        {doneMessage &&
        doneMessage !== INSPECTION_CAPTURE_DONE_PENDING_MESSAGE ? (
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
            {doneMessage}
          </p>
        ) : null}
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
      </div>
    );
  }

  return (
    <div className="inspect-capture-page mx-auto min-h-[100dvh] max-w-lg bg-ink-950 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] text-white">
      <div className="mb-6">
        <Logo variant="onDark" height={36} linked={false} className="mb-4" />
        <h1 className="text-xl font-extrabold leading-snug tracking-tight sm:text-2xl">
          {captureTitle}
        </h1>
        <p className="mt-2 text-sm text-slate-400">{captureDuration}</p>
        <p className="mt-1 text-sm text-slate-400">
          Step {stepIndex + 1} of {angles.length} · {completedCount} of{" "}
          {requiredAngles.length} required uploaded
        </p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent-600 to-accent-400 transition-all"
            style={{
              width: `${
                requiredAngles.length
                  ? (completedCount / requiredAngles.length) * 100
                  : 0
              }%`,
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
            {currentAngle.optional ? (
              <p className="mt-1 text-xs font-semibold text-amber-300/90">
                Optional — you can skip this step
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() =>
              setStepIndex((value) =>
                Math.min(angles.length - 1, value + 1),
              )
            }
            disabled={stepIndex === angles.length - 1 || uploading}
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
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            capture="environment"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void uploadPhoto(file);
            }}
          />

          {lavDigital && currentAngle.id === "vin_plate" ? (
            <div className="mt-4 w-full max-w-xs text-left">
              <label
                htmlFor="lav-capture-vin"
                className="text-xs font-semibold uppercase tracking-wide text-slate-400"
              >
                VIN from image
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="lav-capture-vin"
                  value={captureVin}
                  style={{ textTransform: "uppercase" }}
                  onChange={(e) => {
                    setCaptureVin(e.target.value);
                    setVinSaved(false);
                  }}
                  placeholder="17-character VIN"
                  className="min-w-0 flex-1 rounded-lg border border-white/15 bg-ink-950 px-3 py-2 text-sm text-white"
                />
                <button
                  type="button"
                  onClick={() =>
                    void saveLavVin().catch((err) =>
                      setError(
                        inspectionErrorMessage(err, "Could not save VIN."),
                      ),
                    )
                  }
                  className="shrink-0 rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-white"
                >
                  Save
                </button>
              </div>
              {vinSaved ? (
                <p className="mt-1 text-xs text-emerald-400">Saved to report.</p>
              ) : (
                <p className="mt-1 text-xs text-slate-500">
                  Transcribe the VIN shown on your photo into the report.
                </p>
              )}
            </div>
          ) : null}

          {lavDigital && currentAngle.id === "dashboard" ? (
            <div className="mt-4 w-full max-w-xs text-left">
              <label
                htmlFor="lav-odometer-km"
                className="text-xs font-semibold uppercase tracking-wide text-slate-400"
              >
                Enter odometer (km)
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="lav-odometer-km"
                  inputMode="numeric"
                  value={odometerKm}
                  onChange={(e) => {
                    setOdometerKm(e.target.value);
                    setOdometerSaved(false);
                  }}
                  placeholder="e.g. 51890"
                  className="min-w-0 flex-1 rounded-lg border border-white/15 bg-ink-950 px-3 py-2 text-sm text-white"
                />
                <button
                  type="button"
                  onClick={() => void saveLavOdometer().catch((err) =>
                    setError(inspectionErrorMessage(err, "Could not save odometer.")),
                  )}
                  className="shrink-0 rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-white"
                >
                  Save
                </button>
              </div>
              {odometerSaved ? (
                <p className="mt-1 text-xs text-emerald-400">Saved to report.</p>
              ) : null}
            </div>
          ) : null}

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

          {currentAngle.optional && !uploadedAngles.has(currentAngle.id) ? (
            <button
              type="button"
              disabled={uploading}
              onClick={() => {
                const uploaded = new Set(uploadedAngles);
                if (allRequiredAnglesUploaded(uploaded, angles)) {
                  setScreen("submit");
                } else {
                  setStepIndex(
                    findNextCaptureStepIndex(uploaded, stepIndex, angles),
                  );
                }
              }}
              className="mt-3 text-sm font-semibold text-slate-400 underline-offset-2 hover:text-slate-200 hover:underline"
            >
              Skip optional step
            </button>
          ) : null}
        </div>

        <ul className="mt-5 grid grid-cols-2 gap-2 text-xs text-slate-400">
          {angles.map((angle, index) => (
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
          {!lavDigital ? (
            <p className="mt-4 text-center text-xs text-slate-500">
              You can submit once at least one photo has uploaded. If one angle
              fails, skip it and submit the rest.
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => void submitInspection()}
            disabled={submitting || completedCount === 0}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-600 to-accent-500 px-5 py-3.5 text-sm font-bold text-white transition hover:from-accent-500 hover:to-accent-400 disabled:opacity-50 ${lavDigital ? "mt-4" : "mt-3"}`}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden />
            )}
            {submitting
              ? "Submitting…"
              : lavDigital
                ? "Submit images"
                : "Submit inspection"}
          </button>
          {lavDigital ? (
            <p className="mt-2 text-center text-xs leading-relaxed text-slate-500">
              Enter odometer and VIN readings where prompted. You will choose
              overall condition (good, fair or poor) before final submit.
            </p>
          ) : null}
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
