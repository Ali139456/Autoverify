import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InspectionCapture } from "@/components/InspectionCapture";
import {
  getInspectionByToken,
  isInspectionExpired,
} from "@/lib/inspections";

export const metadata: Metadata = {
  title: "Vehicle Inspection",
  robots: { index: false, follow: false },
};

export default async function InspectPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const inspection = await getInspectionByToken(token);

  if (!inspection) notFound();

  if (isInspectionExpired(inspection)) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-10 text-center">
        <h1 className="text-2xl font-bold text-white">Link expired</h1>
        <p className="mt-3 text-sm text-slate-400">
          This inspection link is no longer active. Open your Auto Verifi report
          to generate a new one.
        </p>
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
