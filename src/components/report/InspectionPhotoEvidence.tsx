import {
  formatInspectionPhotoEvidenceLines,
  formatLavInspectionPhotoEvidenceLines,
} from "@/lib/inspection-photo-evidence";
import type { InspectionPhoto } from "@/lib/types";

/** Timestamp + location shown beneath the photo (never overlaid on the image). */
export function InspectionPhotoEvidenceCaption({
  photo,
  lavEvidenceLabels,
}: {
  photo: InspectionPhoto;
  /** When true, use LAV labelled captions (GPS / date only). */
  lavEvidenceLabels?: boolean;
}) {
  const lines = lavEvidenceLabels
    ? formatLavInspectionPhotoEvidenceLines(photo)
    : formatInspectionPhotoEvidenceLines(photo);
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
