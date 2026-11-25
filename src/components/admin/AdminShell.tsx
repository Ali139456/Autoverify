"use client";

import { useRouter } from "next/navigation";
import { AdminDashboard } from "./AdminDashboard";
import { AdminLoginForm } from "./AdminLoginForm";

export function AdminShell({ authenticated }: { authenticated: boolean }) {
  const router = useRouter();

  if (!authenticated) {
    return (
      <AdminLoginForm
        onSuccess={() => {
          router.refresh();
        }}
      />
    );
  }

  return <AdminDashboard />;
}