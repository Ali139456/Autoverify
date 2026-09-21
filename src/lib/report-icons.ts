import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  BarChart3,
  Calendar,
  Car,
  CarFront,
  CircleGauge,
  ClipboardList,
  FileSearch,
  FileText,
  MapPin,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";

export type ReportIconName =
  | "car"
  | "settings"
  | "sparkles"
  | "calendar"
  | "map-pin"
  | "gauge"
  | "file"
  | "shield"
  | "car-side"
  | "gauge-insight"
  | "wrench"
  | "id-card"
  | "alert"
  | "users"
  | "car-front"
  | "chart"
  | "sliders"
  | "search-doc"
  | "clipboard";

export const SPEC_ICON_NAMES: ReportIconName[] = [
  "car",
  "settings",
  "sparkles",
  "calendar",
  "map-pin",
  "gauge",
];

export const INSIGHT_ICON_NAMES: Record<string, ReportIconName> = {
  ppsr: "file",
  stolen: "shield",
  writeoff: "car-side",
  odometer: "gauge-insight",
  service: "wrench",
  registration: "clipboard",
  recall: "alert",
  ownership: "users",
  usage: "car-front",
  market: "chart",
  specs: "sliders",
  future: "sparkles",
  risk: "search-doc",
};

export const WEB_ICONS: Record<ReportIconName, LucideIcon> = {
  car: Car,
  settings: Settings2,
  sparkles: Sparkles,
  calendar: Calendar,
  "map-pin": MapPin,
  gauge: CircleGauge,
  file: FileText,
  shield: ShieldCheck,
  "car-side": CarFront,
  "gauge-insight": CircleGauge,
  wrench: Wrench,
  "id-card": FileText,
  clipboard: ClipboardList,
  alert: AlertCircle,
  users: Users,
  "car-front": CarFront,
  chart: BarChart3,
  sliders: SlidersHorizontal,
  "search-doc": FileSearch,
};
