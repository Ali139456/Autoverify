import {
  BarChart3,
  Camera,
  CarFront,
  Check,
  FileText,
  Gauge,
  Laptop,
  ScanLine,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

type SummaryRow = {
  label: string;
  Icon: LucideIcon;
  digital: string;
  physical: string;
};

const SUMMARY_ROWS: SummaryRow[] = [
  {
    label: "Vehicle Identifiers and Verification",
    Icon: CarFront,
    digital: "Matched and verified",
    physical: "Sighted and verified",
  },
  {
    label: "Odometer captured",
    Icon: Gauge,
    digital: "Digital capture",
    physical: "Physical image capture",
  },
  {
    label: "VIN identification",
    Icon: ScanLine,
    digital: "Digital capture",
    physical: "Physical image capture",
  },
  {
    label: "Photos – vehicle verification",
    Icon: Camera,
    digital: "Digital – Date/time/geo tagged images",
    physical: "Physical image capture-geo tagged",
  },
  {
    label: "Condition",
    Icon: ShieldCheck,
    digital: "Digital capture",
    physical: "Physically verified",
  },
  {
    label: "Registration papers",
    Icon: FileText,
    digital: "Digital capture",
    physical: "Physical image capture",
  },
  {
    label: "Vehicle valuation",
    Icon: BarChart3,
    digital: "Licensed Valuation Data",
    physical: "Licensed Valuation Data",
  },
  {
    label: "Report delivered",
    Icon: Laptop,
    digital: "Instant",
    physical: "Instant onsite",
  },
];

function MethodCell({ text }: { text: string }) {
  return (
    <span className="lav-summary-method">
      <Check className="lav-summary-check" aria-hidden strokeWidth={3} />
      <span>{text}</span>
    </span>
  );
}

export function LavVerificationSummaryTable() {
  return (
    <div className="lav-verification-summary w-full">
      <p className="lav-verification-summary-title">
        Verification summary – what we verify and how
      </p>
      <div className="lav-verification-summary-scroll" tabIndex={0}>
        <table className="lav-verification-summary-table">
          <thead>
            <tr>
              <th scope="col">Verification item</th>
              <th scope="col">Digital self check</th>
              <th scope="col">Physical inspection</th>
            </tr>
          </thead>
          <tbody>
            {SUMMARY_ROWS.map((row) => (
              <tr key={row.label}>
                <th scope="row">
                  <span className="lav-summary-item">
                    <row.Icon className="lav-summary-item-icon" aria-hidden />
                    <span>{row.label}</span>
                  </span>
                </th>
                <td>
                  <MethodCell text={row.digital} />
                </td>
                <td>
                  <MethodCell text={row.physical} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}