import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  ADMIN_COOKIE_NAME,
  getAdminSigningSecret,
  hasAdminAccess,
  isAdminProtectionConfigured,
} from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Bookings dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!isAdminProtectionConfigured()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
        <div className="max-w-md rounded-2xl border border-white/10 bg-ink-900 p-6 text-center">
          <h1 className="text-lg font-bold text-white">Dashboard not configured</h1>
          <p className="mt-2 text-sm text-slate-400">
            Set <code className="text-slate-300">ADMIN_PASSWORD</code> in the server
            environment, then reload this page.
          </p>
        </div>
      </div>
    );
  }

  const secret = getAdminSigningSecret();
  const token = (await cookies()).get(ADMIN_COOKIE_NAME)?.value;
  const authenticated =
    Boolean(secret) && (await hasAdminAccess(token));

  return <AdminShell authenticated={authenticated} />;
}