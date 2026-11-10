import { buildStatusChecks } from "@/lib/report-design";
import { registrationDisplayStatus } from "@/lib/registration-info";
import type { RegistrationInfo, VehicleReport } from "@/lib/types";

export type LavRegistrationSecurityLine = {
  label: string;
  detail: string;
  warn: boolean;
};

export function lavRegistrationSecurityLines(
  report: VehicleReport,
): LavRegistrationSecurityLine[] {
  const reg = report.registration;
  const checks = buildStatusChecks(report).filter(
    (c) => !c.label.toLowerCase().includes("odometer"),
  );

  const lines: LavRegistrationSecurityLine[] = [
    {
      label: "Registration status",
      detail: registrationDisplayStatus(reg),
      warn: false,
    },
    ...checks.map((c) => ({
      label: c.label,
      detail: c.issue ? "Issue recorded" : "Clear",
      warn: Boolean(c.issue),
    })),
  ];

  if (reg.financeDetails?.trim()) {
    lines.push({
      label: "Finance detail",
      detail: reg.financeDetails.trim(),
      warn: true,
    });
  }
  if (reg.writeOffDetails?.trim()) {
    lines.push({
      label: "Write-off detail",
      detail: reg.writeOffDetails.trim(),
      warn: true,
    });
  }

  return lines;
}

export function lavHasPpsrCertificate(registration: RegistrationInfo): boolean {
  const url = registration.ppsrCertificateUrl?.trim();
  return Boolean(url?.startsWith("http"));
}
