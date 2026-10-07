import { randomBytes } from "crypto";
import {
  INSPECTION_ANGLE_IDS,
  INSPECTION_LINK_TTL_HOURS,
  INSPECTION_PHOTO_BUCKET,
  getInspectionAngleLabel,
  isValidInspectionAngleId,
} from "./inspection-angles";
import { createServerClient } from "./supabase/server";
import { isSupabaseServerConfigured } from "./supabase/server";
import { mergeInspectionPhotosByAngle } from "./merge-inspection-photos";
import { InspectionPhoto, InspectionSession, InspectionStatus } from "./types";

type InspectionRow = {
  id: string;
  report_id: string;
  status: InspectionStatus;
  access_token: string;
  phone: string | null;
  photos: InspectionPhoto[];
  ravin_inspection_id: string | null;
  ravin_invite_url: string | null;
  ravin_payload: unknown;
  expires_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

function rowToSession(row: InspectionRow): InspectionSession {
  return {
    id: row.id,
    reportId: row.report_id,
    accessToken: row.access_token,
    status: row.status,
    phone: row.phone,
    photos: Array.isArray(row.photos) ? row.photos : [],
    ravinInspectionId: row.ravin_inspection_id,
    ravinInviteUrl: row.ravin_invite_url,
    expiresAt: row.expires_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function generateAccessToken(): string {
  return randomBytes(24).toString("base64url");
}

function getExpiresAt(): string {
  return new Date(Date.now() + INSPECTION_LINK_TTL_HOURS * 60 * 60 * 1000).toISOString();
}

export function isInspectionExpired(session: InspectionSession): boolean {
  if (!session.expiresAt) return false;
  return new Date(session.expiresAt).getTime() < Date.now();
}

/** Owner-facing link (Ravin invite when set, otherwise Auto Verifi mobile capture). */
export function getInspectionOwnerUrl(
  session: Pick<InspectionSession, "accessToken" | "ravinInviteUrl">,
  baseUrl: string,
): string {
  const base = baseUrl.replace(/\/$/, "");
  return session.ravinInviteUrl ?? `${base}/inspect/${session.accessToken}`;
}

export async function createInspection(input: {
  reportId: string;
  phone?: string;
}): Promise<InspectionSession> {
  if (!isSupabaseServerConfigured()) {
    throw new Error("Inspections require Supabase to be configured.");
  }

  const supabase = createServerClient();
  const accessToken = generateAccessToken();

  const { data, error } = await supabase
    .from("inspections")
    .insert({
      report_id: input.reportId,
      access_token: accessToken,
      phone: input.phone ?? null,
      status: "pending",
      photos: [],
      expires_at: getExpiresAt(),
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return rowToSession(data as InspectionRow);
}

export async function getInspectionByToken(
  token: string,
): Promise<InspectionSession | null> {
  if (!isSupabaseServerConfigured()) return null;
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("inspections")
    .select("*")
    .eq("access_token", token)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return rowToSession(data as InspectionRow);
}

export async function getInspectionByReportId(
  reportId: string,
): Promise<InspectionSession | null> {
  if (!isSupabaseServerConfigured()) return null;
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("inspections")
    .select("*")
    .eq("report_id", reportId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return rowToSession(data as InspectionRow);
}

export async function getInspectionById(
  id: string,
): Promise<InspectionSession | null> {
  if (!isSupabaseServerConfigured()) return null;
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("inspections")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return rowToSession(data as InspectionRow);
}

export async function getInspectionByInvitationId(
  invitationId: string,
): Promise<InspectionSession | null> {
  if (!isSupabaseServerConfigured()) return null;
  const supabase = createServerClient();

  const { data: reportMatch } = await supabase
    .from("reports")
    .select("id")
    .eq("id", invitationId)
    .maybeSingle();

  if (reportMatch?.id) {
    return getInspectionByReportId(reportMatch.id);
  }

  const { data, error } = await supabase
    .from("inspections")
    .select("*")
    .eq("ravin_inspection_id", invitationId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return rowToSession(data as InspectionRow);
}

export async function updateInspection(
  id: string,
  patch: Partial<{
    status: InspectionStatus;
    photos: InspectionPhoto[];
    ravinInspectionId: string | null;
    ravinInviteUrl: string | null;
    ravinPayload: unknown;
    completedAt: string | null;
  }>,
): Promise<InspectionSession | null> {
  const supabase = createServerClient();
  const row: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (patch.status) row.status = patch.status;
  if (patch.photos) row.photos = patch.photos;
  if (patch.ravinInspectionId !== undefined) {
    row.ravin_inspection_id = patch.ravinInspectionId;
  }
  if (patch.ravinInviteUrl !== undefined) {
    row.ravin_invite_url = patch.ravinInviteUrl;
  }
  if (patch.ravinPayload !== undefined) row.ravin_payload = patch.ravinPayload;
  if (patch.completedAt !== undefined) row.completed_at = patch.completedAt;

  const { error } = await supabase.from("inspections").update(row).eq("id", id);
  if (error) throw new Error(error.message);
  return getInspectionById(id);
}

export async function uploadInspectionPhoto(input: {
  inspection: InspectionSession;
  angle: string;
  buffer: Buffer;
  contentType: string;
  capturedAt?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  locationAccuracyM?: number | null;
  locationLabel?: string | null;
}): Promise<InspectionPhoto> {
  if (!isValidInspectionAngleId(input.angle)) {
    throw new Error("Invalid photo angle.");
  }

  const supabase = createServerClient();
  const storagePath = `${input.inspection.id}/${input.angle}.jpg`;

  const contentType =
    input.contentType?.startsWith("image/") ? input.contentType : "image/jpeg";

  const { error: uploadError } = await supabase.storage
    .from(INSPECTION_PHOTO_BUCKET)
    .upload(storagePath, input.buffer, {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    const hint =
      uploadError.message.toLowerCase().includes("bucket") ||
      uploadError.message.toLowerCase().includes("not found")
        ? " Photo storage may not be configured on the server."
        : "";
    throw new Error(`${uploadError.message}${hint}`);
  }

  const photo: InspectionPhoto = {
    angle: input.angle,
    label: getInspectionAngleLabel(input.angle),
    storagePath,
    uploadedAt: new Date().toISOString(),
    capturedAt: input.capturedAt ?? null,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    locationAccuracyM: input.locationAccuracyM ?? null,
    locationLabel: input.locationLabel ?? null,
  };

  for (let attempt = 0; attempt < 6; attempt++) {
    const fresh = await getInspectionById(input.inspection.id);
    if (!fresh) {
      throw new Error("Inspection session not found.");
    }
    const photos = mergeInspectionPhotosByAngle(fresh.photos, [photo]);

    const { data, error } = await supabase
      .from("inspections")
      .update({
        photos,
        status: "in_progress",
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.inspection.id)
      .eq("updated_at", fresh.updatedAt)
      .select("id")
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (data) return photo;
  }

  throw new Error("Could not save photo metadata. Please try again.");
}

export async function downloadInspectionPhotos(
  inspection: InspectionSession,
): Promise<{ name: string; data: Buffer; contentType: string; angle: string }[]> {
  const supabase = createServerClient();
  const downloads = await Promise.all(
    inspection.photos.map(async (photo) => {
      const { data, error } = await supabase.storage
        .from(INSPECTION_PHOTO_BUCKET)
        .download(photo.storagePath);

      if (error || !data) {
        throw new Error(error?.message ?? `Missing photo ${photo.angle}`);
      }

      const arrayBuffer = await data.arrayBuffer();
      return {
        name: `${photo.angle}.jpg`,
        data: Buffer.from(arrayBuffer),
        contentType: "image/jpeg",
        angle: photo.angle,
      };
    }),
  );

  return downloads;
}

export function getMissingAngles(photos: InspectionPhoto[]): string[] {
  const uploaded = new Set(photos.map((photo) => photo.angle));
  return INSPECTION_ANGLE_IDS.filter((angle) => !uploaded.has(angle));
}

export function getInspectionProgress(photos: InspectionPhoto[]) {
  const uploaded = new Set(photos.map((photo) => photo.angle));
  return {
    completed: INSPECTION_ANGLE_IDS.filter((angle) => uploaded.has(angle)).length,
    total: INSPECTION_ANGLE_IDS.length,
    missing: getMissingAngles(photos),
  };
}
