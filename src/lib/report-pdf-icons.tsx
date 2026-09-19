import React from "react";
import { Circle, Path, Svg, Text as SvgText } from "@react-pdf/renderer";
import type { InsightStatus } from "./report-design";
import { INSIGHT_ICON_NAMES, SPEC_ICON_NAMES, type ReportIconName } from "./report-icons";

const STROKE = "#334155";

function IconSvg({
  children,
  size = 12,
}: {
  children: React.ReactNode;
  size?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {children}
    </Svg>
  );
}

function CarIcon({ size = 12 }: { size?: number }) {
  return (
    <IconSvg size={size}>
      <Path
        d="M5 17h14l-1.2-4.5a2 2 0 0 0-1.9-1.3H8.1a2 2 0 0 0-1.9 1.3L5 17zm2.5-6.8h9"
        stroke={STROKE}
        strokeWidth={1.6}
        fill="none"
      />
      <Circle cx="8" cy="17" r="1.4" fill={STROKE} />
      <Circle cx="16" cy="17" r="1.4" fill={STROKE} />
    </IconSvg>
  );
}

function SettingsIcon({ size = 12 }: { size?: number }) {
  return (
    <IconSvg size={size}>
      <Circle cx="12" cy="12" r="3" stroke={STROKE} strokeWidth={1.6} fill="none" />
      <Path
        d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"
        stroke={STROKE}
        strokeWidth={1.6}
        fill="none"
      />
    </IconSvg>
  );
}

function SparklesIcon({ size = 12 }: { size?: number }) {
  return (
    <IconSvg size={size}>
      <Path d="M12 3l1 4 4 1-4 1-1 4-1-4-4-1 4-1 1-4z" fill={STROKE} />
    </IconSvg>
  );
}

function CalendarIcon({ size = 12 }: { size?: number }) {
  return (
    <IconSvg size={size}>
      <Path
        d="M6 5h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm0 4h12"
        stroke={STROKE}
        strokeWidth={1.6}
        fill="none"
      />
    </IconSvg>
  );
}

function MapPinIcon({ size = 12 }: { size?: number }) {
  return (
    <IconSvg size={size}>
      <Path
        d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z"
        stroke={STROKE}
        strokeWidth={1.6}
        fill="none"
      />
      <Circle cx="12" cy="11" r="2" fill={STROKE} />
    </IconSvg>
  );
}

function GaugeIcon({ size = 12 }: { size?: number }) {
  return (
    <IconSvg size={size}>
      <Path
        d="M12 4a8 8 0 1 0 8 8M12 12l4-2"
        stroke={STROKE}
        strokeWidth={1.6}
        fill="none"
      />
    </IconSvg>
  );
}

function FileIcon({ size = 12 }: { size?: number }) {
  return (
    <IconSvg size={size}>
      <Path
        d="M8 4h8l2 2v14H8V4zm2 0v4h6"
        stroke={STROKE}
        strokeWidth={1.6}
        fill="none"
      />
    </IconSvg>
  );
}

function ShieldIcon({ size = 12 }: { size?: number }) {
  return (
    <IconSvg size={size}>
      <Path
        d="M12 3l7 3v6c0 4.5-3.5 7.5-7 9-3.5-1.5-7-4.5-7-9V6l7-3z"
        stroke={STROKE}
        strokeWidth={1.6}
        fill="none"
      />
    </IconSvg>
  );
}

function WrenchIcon({ size = 12 }: { size?: number }) {
  return (
    <IconSvg size={size}>
      <Path
        d="M14 4l6 6-3 3-2-2-6 6-3-3 6-6-2-2 3-3z"
        stroke={STROKE}
        strokeWidth={1.6}
        fill="none"
      />
    </IconSvg>
  );
}

function AlertIcon({ size = 12 }: { size?: number }) {
  return (
    <IconSvg size={size}>
      <Circle cx="12" cy="12" r="8" stroke={STROKE} strokeWidth={1.6} fill="none" />
      <Path d="M12 8v5M12 16h.01" stroke={STROKE} strokeWidth={1.8} />
    </IconSvg>
  );
}

function UsersIcon({ size = 12 }: { size?: number }) {
  return (
    <IconSvg size={size}>
      <Circle cx="9" cy="9" r="2.5" stroke={STROKE} strokeWidth={1.6} fill="none" />
      <Circle cx="16" cy="10" r="2" stroke={STROKE} strokeWidth={1.6} fill="none" />
      <Path d="M4 19c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke={STROKE} strokeWidth={1.6} fill="none" />
    </IconSvg>
  );
}

function ChartIcon({ size = 12 }: { size?: number }) {
  return (
    <IconSvg size={size}>
      <Path d="M5 19V9M10 19V5M15 19v-7M20 19V3" stroke={STROKE} strokeWidth={1.8} />
    </IconSvg>
  );
}

function SlidersIcon({ size = 12 }: { size?: number }) {
  return (
    <IconSvg size={size}>
      <Path d="M4 7h16M4 12h16M4 17h16" stroke={STROKE} strokeWidth={1.6} />
      <Circle cx="9" cy="7" r="1.6" fill={STROKE} />
      <Circle cx="15" cy="12" r="1.6" fill={STROKE} />
      <Circle cx="11" cy="17" r="1.6" fill={STROKE} />
    </IconSvg>
  );
}

function SearchDocIcon({ size = 12 }: { size?: number }) {
  return (
    <IconSvg size={size}>
      <Path d="M8 4h8l2 2v10H8V4z" stroke={STROKE} strokeWidth={1.6} fill="none" />
      <Circle cx="15" cy="15" r="3" stroke={STROKE} strokeWidth={1.6} fill="none" />
    </IconSvg>
  );
}

const PDF_ICONS: Record<ReportIconName, React.FC<{ size?: number }>> = {
  car: CarIcon,
  settings: SettingsIcon,
  sparkles: SparklesIcon,
  calendar: CalendarIcon,
  "map-pin": MapPinIcon,
  gauge: GaugeIcon,
  file: FileIcon,
  shield: ShieldIcon,
  "car-side": CarIcon,
  "gauge-insight": GaugeIcon,
  wrench: WrenchIcon,
  "id-card": FileIcon,
  clipboard: FileIcon,
  alert: AlertIcon,
  users: UsersIcon,
  "car-front": CarIcon,
  chart: ChartIcon,
  sliders: SlidersIcon,
  "search-doc": SearchDocIcon,
};

export function PdfReportIcon({
  name,
  size = 12,
}: {
  name: ReportIconName;
  size?: number;
}) {
  const Icon = PDF_ICONS[name] ?? FileIcon;
  return <Icon size={size} />;
}

export function PdfSpecIcon({ index, size = 11 }: { index: number; size?: number }) {
  const name = SPEC_ICON_NAMES[index] ?? "car";
  return <PdfReportIcon name={name} size={size} />;
}

export function PdfInsightIcon({
  insightId,
  size = 12,
}: {
  insightId: string;
  size?: number;
}) {
  const name = INSIGHT_ICON_NAMES[insightId] ?? "file";
  return <PdfReportIcon name={name} size={size} />;
}

export function PdfStatusBadge({ tone }: { tone: InsightStatus }) {
  const color =
    tone === "clear"
      ? "#22c55e"
      : tone === "warn"
        ? "#ef4444"
        : tone === "info"
          ? "#0ea5e9"
          : "#f59e0b";

  return (
    <Svg width={10} height={10} viewBox="0 0 10 10">
      <Circle cx="5" cy="5" r="5" fill={color} />
      {tone === "info" ? (
        <SvgText x="5" y="7" style={{ fontSize: 7, fill: "#ffffff", textAnchor: "middle" }}>
          i
        </SvgText>
      ) : tone === "neutral" || tone === "warn" ? (
        <Path d="M3 5h4" stroke="#ffffff" strokeWidth={1.2} />
      ) : (
        <Path d="M3 5.2l1.6 1.6L7.2 4" stroke="#ffffff" strokeWidth={1.1} fill="none" />
      )}
    </Svg>
  );
}

export function PdfCheckIcon({ ok }: { ok: boolean }) {
  return (
    <Svg width={11} height={11} viewBox="0 0 11 11">
      <Circle cx="5.5" cy="5.5" r="5.5" fill={ok ? "#22c55e" : "#cbd5e1"} />
      <Path d="M3.2 5.6l1.5 1.5 3.1-3.2" stroke="#ffffff" strokeWidth={1.1} fill="none" />
    </Svg>
  );
}
