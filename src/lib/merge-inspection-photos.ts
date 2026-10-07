/** Merge photo lists by angle; keeps the newest `uploadedAt` per angle. */
export function mergeInspectionPhotosByAngle<
  T extends { angle: string; uploadedAt: string },
>(...lists: ReadonlyArray<readonly T[] | null | undefined>): T[] {
  const byAngle = new Map<string, T>();
  for (const list of lists) {
    if (!list?.length) continue;
    for (const photo of list) {
      const current = byAngle.get(photo.angle);
      if (!current || photo.uploadedAt >= current.uploadedAt) {
        byAngle.set(photo.angle, photo);
      }
    }
  }
  return [...byAngle.values()];
}
