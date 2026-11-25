import { listAdminJobs, type AdminJobRow } from "@/lib/admin/jobs";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Transient Supabase / cold-start failures — safe to retry once or twice. */
export async function loadAdminJobsWithRetry(
  maxAttempts = 3,
): Promise<{ jobs: AdminJobRow[]; configured: boolean; warnings: string[] }> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const result = await listAdminJobs();
      return {
        jobs: result.jobs,
        configured: result.configured,
        warnings: result.warnings ?? [],
      };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error("Could not load bookings.");
      if (attempt < maxAttempts) {
        await sleep(250 * attempt);
      }
    }
  }

  throw lastError ?? new Error("Could not load bookings.");
}