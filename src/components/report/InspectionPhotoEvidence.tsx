import { formatInspectionPhotoEvidenceLine } from "@/lib/inspection-photo-evidence";
import type { InspectionPhoto } from "@/lib/types";

export function InspectionPhotoEvidenceOverlay({
  photo,
}: {
  photo: InspectionPhoto;
}) {
  const line = formatInspectionPhotoEvidenceLine(photo);
  if (!line) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/55 to-transparent px-2 pb-1.5 pt-6">
      <p className="text-left text-[10px] font-semibold leading-snug text-white sm:text-[11px]">
        {line}
      </p>
    </div>
  );
}

export function InspectionPhotoEvidenceCaption({
  photo,
}: {
  photo: InspectionPhoto;
}) {
  const line = formatInspectionPhotoEvidenceLine(photo);
  if (!line) return null;

  return (
    <p className="mt-0.5 text-[10px] leading-snug text-slate-500">{line}</p>
  );
}
