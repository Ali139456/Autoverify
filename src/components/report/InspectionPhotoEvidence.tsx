import { formatInspectionPhotoEvidenceLines } from "@/lib/inspection-photo-evidence";
import type { InspectionPhoto } from "@/lib/types";

/** Timestamp + location shown beneath the photo (never overlaid on the image). */
export function InspectionPhotoEvidenceCaption({
  photo,
}: {
  photo: InspectionPhoto;
}) {
  const lines = formatInspectionPhotoEvidenceLines(photo);
  if (lines.length === 0) return null;

  return (
    <div className="mt-0.5 space-y-0.5">
      {lines.map((line) => (
        <p key={line} className="text-[10px] leading-snug text-slate-500">
          {line}
        </p>
      ))}
    </div>
  );
}
