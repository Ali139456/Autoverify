import { notFound, redirect } from "next/navigation";
import { InspectionCapture } from "@/components/InspectionCapture";
import {
  getInspectionByToken,
  isInspectionExpired,
  updateInspection,
} from "@/lib/inspections";
import {
  coerceRavinInspectorLiteUrl,
  createRavinPartnerInvite,
  isRavinInspectorLiteUrl,
  isRavinPartnerConfigured,
  useHostedRavinInspector,
} from "@/lib/ravin-partner";
import { getReport } from "@/lib/store";
import type { InspectionSession } from "@/lib/types";

async function resolveRavinLiteRedirectUrl(
  inspection: InspectionSession,
): Promise<string | null> {
  const stored = inspection.ravinInviteUrl?.trim();
  if (!stored) return null;

  let liteUrl = coerceRavinInspectorLiteUrl(stored);
  if (isRavinInspectorLiteUrl(liteUrl)) {
    if (liteUrl !== stored) {
      await updateInspection(inspection.id, { ravinInviteUrl: liteUrl });
    }
    return liteUrl;
  }

  if (!isRavinPartnerConfigured()) return null;

  const report = await getReport(inspection.reportId);
  if (!report) return null;

  try {
    const invite = await createRavinPartnerInvite({
      claimId: report.id,
      lp: report.vehicle.rego,
      state: report.vehicle.state,
    });
    liteUrl = invite.inviteUrl;
    await updateInspection(inspection.id, {
      ravinInviteUrl: liteUrl,
      ravinInspectionId: invite.invitationId,
    });
    return isRavinInspectorLiteUrl(liteUrl) ? liteUrl : null;
  } catch (err) {
    console.error("[inspect] Ravin Inspector Lite refresh failed:", err);
    return null;
  }
}

export default async function InspectPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const inspection = await getInspectionByToken(token);

  if (!inspection) notFound();

  if (useHostedRavinInspector()) {
    const ravinRedirect = await resolveRavinLiteRedirectUrl(inspection);
    if (ravinRedirect) {
      redirect(ravinRedirect);
    }
  }

  if (isInspectionExpired(inspection)) {
    return (
      <div className="min-h-[calc(100vh-6rem)] bg-white dark:bg-ink-950">
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-10 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Link expired</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          This inspection link is no longer active. Open your Auto Verifi report
          to generate a new one.
        </p>
      </div>
      </div>
    );
  }

  return (
    <InspectionCapture
      token={token}
      initialPhotos={inspection.photos.map((photo) => ({
        angle: photo.angle,
        label: photo.label,
        uploadedAt: photo.uploadedAt,
      }))}
    />
  );
}
