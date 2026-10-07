/* eslint-disable jsx-a11y/alt-text -- @react-pdf/renderer Image has no alt prop */
import React from "react";
import path from "path";
import {
  Document,
  Image,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { hasPpsrCertificate } from "./ppsr-certificate";
import {
  RIDE_SHARE_ELIGIBILITY_ROWS,
  RIDE_SHARE_TABLE_HEADING,
} from "./ride-share-eligibility";
import {
  isPPlateAdvisoryCopy,
  P_PLATE_REFERENCE_ROWS,
} from "./p-plate-reference";
import { formatInspectionPhotoEvidenceLines } from "./inspection-photo-evidence";
import {
  CAR_BUYING_CHECKLIST_INTRO,
  CAR_BUYING_CHECKLIST_ITEMS,
  CAR_BUYING_CHECKLIST_TITLE,
} from "./car-buying-checklist";
import { isExteriorInspectionAngle } from "./inspection-angles";
import { hasVehicleSpecContent } from "./vehicle-spec-sheet";
import {
  buildKeyInsights,
  ANCAP_SAFETY_RATINGS_URL,
  buildReportOverviewSpecs,
  buildStatusChecks,
  formatPPlateStatus,
  MANUFACTURERS_WARRANTY_NOTICE,
  formatReportDate,
  formatReportReference,
  getFutureValueAtYears,
  getInspectionPhotoUrl,
  ODOMETER_NO_HISTORY_LABEL,
  resolveDamageFindingImageUrl,
  resolveFutureValue,
  type ReportInsight,
} from "./report-design";
import {
  PdfCheckIcon,
  PdfInsightIcon,
  PdfSpecIcon,
  PdfStatusBadge,
} from "./report-pdf-icons";
import { formatAbnDisplay, getCompanyDetails } from "./company";
import { hasDamageAnalysis, resolveReportTier } from "./pricing";
import {
  REPORT_DISCLAIMER_CLOSING,
  REPORT_DISCLAIMER_LEAD,
  REPORT_GENERAL_DISCLAIMER_PARAGRAPHS,
  REPORT_GENERAL_DISCLAIMER_TITLE,
  REPORT_TERMS_URL,
} from "./report-disclaimer";
import {
  REPORT_FOOTER_LOGO_HEIGHT,
  REPORT_FOOTER_LOGO_WIDTH,
  REPORT_HEADER_LOGO_HEIGHT,
  REPORT_HEADER_LOGO_WIDTH,
} from "./report-logo-size";
import { VEHICLE_HERO_IMAGE_DISCLAIMER } from "./vehicle-hero-image";
import { VehicleReport } from "./types";
import type { InspectionPhoto } from "./types";

const BLUE = "#0073E3";
const GREY = "#64748b";
const LIGHT = "#f8fafc";
const SPEC_LABEL_BG = "#f1f5f9";
const RIDE_SHARE_ORANGE = "#E87722";
const LOGO_BLUE = path.join(process.cwd(), "public/logo/logo-blue-on-white.png");
const LOGO_INVERSE = path.join(process.cwd(), "public/logo/logo-inverse.png");

const PDF_A4_HEIGHT = 841.89;

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontSize: 8.5,
    fontFamily: "Helvetica",
    color: "#1e293b",
    backgroundColor: "#ffffff",
  },
  pageFrame: {
    height: PDF_A4_HEIGHT,
    minHeight: PDF_A4_HEIGHT,
    flexDirection: "column",
  },
  pageContent: {
    flex: 1,
  },
  header: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 32,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: BLUE,
  },
  logoHeader: {
    width: REPORT_HEADER_LOGO_WIDTH,
    height: REPORT_HEADER_LOGO_HEIGHT,
    objectFit: "contain",
  },
  headerTagline: {
    color: BLUE,
    fontSize: 6.5,
    marginTop: 3,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.8,
  },
  headerMeta: {
    textAlign: "right",
    color: GREY,
    fontSize: 7.5,
    lineHeight: 1.55,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
  },
  body: { paddingHorizontal: 32, paddingTop: 22, paddingBottom: 56 },
  title: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#0f172a" },
  vehicleName: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 7,
    color: GREY,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontFamily: "Helvetica-Bold",
  },
  specBar: {
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    backgroundColor: LIGHT,
    overflow: "hidden",
  },
  specItem: {
    width: "25%",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
  },
  specLabelRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  specLabel: {
    fontSize: 6.5,
    color: GREY,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
  },
  specValue: {
    marginTop: 3,
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  statusPanel: {
    marginTop: 14,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    overflow: "hidden",
    minHeight: 168,
  },
  statusLeft: {
    width: "58%",
    padding: 14,
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
  },
  statusImageWrap: {
    width: "42%",
    position: "relative",
    minHeight: 168,
    backgroundColor: "#020617",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  statusImage: { width: "100%", height: "100%", objectFit: "cover" },
  statusImageContain: {
    width: "94%",
    height: "88%",
    objectFit: "contain",
    objectPosition: "center",
    backgroundColor: "#020617",
    alignSelf: "center",
  },
  statusImageCaption: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(15,23,42,0.72)",
    color: "#ffffff",
    fontSize: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    lineHeight: 1.35,
  },
  specHeroBanner: {
    marginTop: 10,
    width: "100%",
    minHeight: 128,
    backgroundColor: "#020617",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  specHeroBannerImage: {
    width: "98%",
    height: 108,
    objectFit: "contain",
    objectPosition: "center",
    backgroundColor: "#020617",
  },
  statusTitle: {
    fontSize: 7,
    color: "#0f172a",
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
  },
  statusRow: { flexDirection: "row", marginBottom: 5, alignItems: "flex-start", gap: 5 },
  statusText: { flex: 1, fontSize: 8.5, color: "#334155" },
  insightsHeader: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  sectionLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#0f172a",
  },
  sectionLabelAccent: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    color: BLUE,
  },
  insightGrid: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  insightCard: {
    width: "24%",
    marginRight: "1%",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    padding: 8,
    minHeight: 64,
    backgroundColor: "#f1f5f9",
  },
  insightTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 4,
  },
  insightTitle: { fontSize: 7, color: GREY, textAlign: "right", flex: 1 },
  insightBottom: {
    marginTop: 6,
    flexDirection: "column",
    alignItems: "stretch",
  },
  insightStatusRow: { flexDirection: "row", alignItems: "flex-start", gap: 3 },
  insightStatus: { fontSize: 7.5, fontFamily: "Helvetica-Bold", lineHeight: 1.35 },
  upgradeBox: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dbeafe",
    backgroundColor: "#f0f7ff",
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  upgradeButton: {
    backgroundColor: BLUE,
    color: "#ffffff",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  clear: { color: "#15803d" },
  warn: { color: "#dc2626" },
  info: { color: "#0284c7" },
  neutral: { color: "#d97706" },
  valRow: { flexDirection: "row", marginTop: 8 },
  valBox: {
    width: "32%",
    marginRight: "2%",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    padding: 8,
  },
  valLabel: { fontSize: 7, color: GREY },
  valAmount: { marginTop: 3, fontSize: 10, fontFamily: "Helvetica-Bold", color: BLUE },
  section: { marginTop: 14 },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    borderBottomWidth: 1.5,
    borderBottomColor: BLUE,
    paddingBottom: 3,
    marginBottom: 8,
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    color: "#ffffff",
    padding: 5,
    fontFamily: "Helvetica-Bold",
    fontSize: 7.5,
  },
  tableRow: {
    flexDirection: "row",
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    fontSize: 7.5,
  },
  para: { lineHeight: 1.45, color: "#334155", fontSize: 8.5 },
  specSheetRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  specSheetLabelCell: {
    width: "42%",
    backgroundColor: SPEC_LABEL_BG,
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  specSheetLabel: { fontSize: 7.5, color: GREY },
  specSheetValueCell: {
    width: "58%",
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  specSheetValue: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  featureItem: { fontSize: 7.5, color: "#334155", marginBottom: 3 },
  plusHeading: {
    marginTop: 4,
    borderLeftWidth: 3,
    borderLeftColor: BLUE,
    paddingLeft: 10,
  },
  plusTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  plusSub: { marginTop: 2, fontSize: 11, fontFamily: "Helvetica-Bold", color: BLUE },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 6 },
  photoTile: {
    width: "23.5%",
    marginRight: "2%",
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 5,
    overflow: "hidden",
  },
  photoImage: { width: "100%", height: 64, objectFit: "cover" },
  photoCaption: {
    paddingHorizontal: 4,
    paddingTop: 3,
    paddingBottom: 1,
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  photoEvidenceCaption: {
    paddingHorizontal: 4,
    paddingBottom: 1,
    fontSize: 5.5,
    color: GREY,
    lineHeight: 1.3,
  },
  damageCard: {
    width: "48%",
    marginRight: "2%",
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
    borderRadius: 6,
    padding: 8,
  },
  footerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 32,
    flexShrink: 0,
  },
  footerLogo: {
    width: REPORT_FOOTER_LOGO_WIDTH,
    height: REPORT_FOOTER_LOGO_HEIGHT,
    objectFit: "contain",
  },
  footerText: { fontSize: 7, color: GREY, textTransform: "uppercase" },
});

const money = (n: number) => `$${n.toLocaleString("en-AU")}`;

const MAX_COMPARABLE_ROWS = 7;

/** Factory options below the full-width vehicle data table on spec page 1. */
const SPEC_FEATURES_ON_FIRST_SPEC_PAGE = 28;
/** Factory options per continuation page (full width). */
const SPEC_FEATURES_CONTINUATION = 40;

function countVehicleSpecPdfPages(
  sheet: NonNullable<VehicleReport["vehicleSpec"]>,
): number {
  const featureCount = sheet.factoryFeatures.length;
  if (featureCount === 0) return 1;
  if (featureCount <= SPEC_FEATURES_ON_FIRST_SPEC_PAGE) return 1;
  const remainder = featureCount - SPEC_FEATURES_ON_FIRST_SPEC_PAGE;
  return 1 + Math.ceil(remainder / SPEC_FEATURES_CONTINUATION);
}

function chunkFactoryFeatures<T>(items: T[], size: number): T[][] {
  if (size <= 0 || items.length === 0) return [];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function resolvePdfImageSrc(url: string | null | undefined): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) {
    return path.join(process.cwd(), "public", trimmed.replace(/^\//, ""));
  }
  return trimmed;
}

function pdfInsightFootnote(insight: ReportInsight): string | undefined {
  const detail = insight.detail?.trim();
  if (!detail) return undefined;
  const sub = insight.statusSubtext?.trim();
  if (sub && detail === sub) return undefined;
  return detail;
}

function toneStyle(tone: string) {
  if (tone === "clear") return styles.clear;
  if (tone === "warn") return styles.warn;
  if (tone === "info") return styles.info;
  return styles.neutral;
}

function ReportHeader({ report }: { report: VehicleReport }) {
  const reportReference = formatReportReference(report.vehicle);
  return (
    <View style={styles.header}>
      <View>
        <Image src={LOGO_BLUE} style={styles.logoHeader} />
        <Text style={styles.headerTagline}>
          Past | Present | Future Vehicle Insights
        </Text>
      </View>
      <View style={styles.headerMeta}>
        <Text>Generated: {formatReportDate(report.createdAt)}</Text>
        <Text>Report ref: {reportReference}</Text>
        <Text>Autoverifi.com.au</Text>
      </View>
    </View>
  );
}

function PdfPageShell({
  report,
  pageLabel,
  children,
}: {
  report: VehicleReport;
  pageLabel: string;
  children: React.ReactNode;
}) {
  const reportReference = formatReportReference(report.vehicle);
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.pageFrame}>
        <View style={styles.pageContent}>
          <ReportHeader report={report} />
          {children}
        </View>
        <View style={styles.footerBar}>
          <Image src={LOGO_BLUE} style={styles.footerLogo} />
          <Text style={styles.footerText}>
            {reportReference} · Autoverifi.com.au | {pageLabel}
          </Text>
        </View>
      </View>
    </Page>
  );
}

function PdfInsightGrid({ insights }: { insights: ReportInsight[] }) {
  return (
    <View style={styles.insightGrid}>
      {insights.map((insight) => {
        const footnote = pdfInsightFootnote(insight);
        return (
          <View key={insight.id} style={styles.insightCard} wrap={false}>
            <View style={styles.insightTop}>
              <PdfInsightIcon insightId={insight.id} />
              <Text style={styles.insightTitle}>{insight.title}</Text>
            </View>
            <View style={styles.insightBottom}>
              {insight.lines?.length ? (
                <View style={{ flex: 1, minWidth: 0 }}>
                  {insight.lines.map((line) => (
                    <Text
                      key={line.text}
                      style={{
                        fontSize: 7.5,
                        fontFamily: "Helvetica-Bold",
                        color: pdfRideShareLineColor(line.variant),
                        marginTop: 2,
                        lineHeight: 1.35,
                      }}
                    >
                      {line.variant === "action" ? `✓ ${line.text}` : line.text}
                    </Text>
                  ))}
                  {insight.detail ? (
                    <Text
                      style={{
                        marginTop: 3,
                        fontSize: 7,
                        color: GREY,
                        fontFamily: "Helvetica",
                      }}
                    >
                      {insight.detail}
                    </Text>
                  ) : null}
                </View>
              ) : (
              <View style={styles.insightStatusRow}>
                <PdfStatusBadge tone={insight.tone} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={[
                      styles.insightStatus,
                      insight.id === "odometer" &&
                      insight.status === "No odometer history reported"
                        ? { color: RIDE_SHARE_ORANGE }
                        : toneStyle(insight.tone),
                    ]}
                  >
                    {insight.status}
                  </Text>
                  {insight.statusSubtext && !footnote ? (
                    <Text
                      style={[
                        styles.insightStatus,
                        insight.id === "registration" || insight.id === "market"
                          ? toneStyle(insight.tone)
                          : { color: GREY, fontFamily: "Helvetica" },
                        { marginTop: 2, fontSize: 7 },
                      ]}
                    >
                      {insight.statusSubtext}
                    </Text>
                  ) : null}
                  {insight.id === "ancap" && insight.status === "Not available" ? (
                    <Text
                      style={{
                        marginTop: 3,
                        fontSize: 6.5,
                        color: GREY,
                        fontFamily: "Helvetica",
                        lineHeight: 1.4,
                      }}
                    >
                      Verify ANCAP rating here:{" "}
                      <Link src={ANCAP_SAFETY_RATINGS_URL}>
                        www.ancap.com.au/safety-ratings
                      </Link>
                    </Text>
                  ) : footnote ? (
                    <Text
                      style={{
                        marginTop: 3,
                        fontSize: 7,
                        color: GREY,
                        fontFamily: "Helvetica",
                        lineHeight: 1.35,
                      }}
                    >
                      {footnote}
                    </Text>
                  ) : null}
                </View>
              </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function PdfVehicleHero({
  vehicle,
  vehicleTitle,
  layout = "panel",
}: {
  vehicle: VehicleReport["vehicle"];
  vehicleTitle: string;
  layout?: "panel" | "banner";
}) {
  const heroSrc = resolvePdfImageSrc(vehicle.heroImageUrl);
  const useContain =
    vehicle.heroImageKind === "stock" ||
    vehicle.heroImageKind === "generated" ||
    Boolean(vehicle.heroImageUrl?.includes("/sample/"));

  const wrapStyle =
    layout === "banner" ? styles.specHeroBanner : styles.statusImageWrap;

  return (
    <View style={wrapStyle}>
      {heroSrc ? (
        <>
          <Image
            src={heroSrc}
            style={
              layout === "banner"
                ? useContain
                  ? styles.specHeroBannerImage
                  : styles.statusImage
                : useContain
                  ? styles.statusImageContain
                  : styles.statusImage
            }
          />
          <Text style={styles.statusImageCaption}>
            *{vehicle.heroImageDisclaimer ?? VEHICLE_HERO_IMAGE_DISCLAIMER}
          </Text>
        </>
      ) : (
        <View
          style={{
            flex: 1,
            backgroundColor: "#0f172a",
            justifyContent: "center",
            alignItems: "center",
            padding: 12,
          }}
        >
          <Text style={{ color: "#94a3b8", fontSize: 8, textAlign: "center" }}>
            {vehicleTitle}
            {vehicle.colour ? `\n${vehicle.colour}` : ""}
          </Text>
        </View>
      )}
    </View>
  );
}

function PdfManufacturersWarrantyNotice() {
  return (
    <View
      style={{
        marginTop: 8,
        padding: 10,
        backgroundColor: LIGHT,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#e2e8f0",
      }}
      wrap={false}
    >
      <Text
        style={{
          fontSize: 8,
          fontFamily: "Helvetica-Bold",
          color: "#0f172a",
          textTransform: "uppercase",
          letterSpacing: 0.6,
        }}
      >
        Manufacturer&apos;s warranty remaining
      </Text>
      <Text
        style={{
          marginTop: 4,
          fontSize: 8,
          fontFamily: "Helvetica-Bold",
          color: RIDE_SHARE_ORANGE,
          lineHeight: 1.45,
        }}
      >
        {MANUFACTURERS_WARRANTY_NOTICE}
      </Text>
    </View>
  );
}

const RIDE_SHARE_GREEN = "#059669";

function pdfRideShareLineColor(variant: string): string {
  if (variant === "eligible") return RIDE_SHARE_GREEN;
  if (variant === "action") return RIDE_SHARE_ORANGE;
  if (variant === "ineligible") return "#d97706";
  return GREY;
}

function PdfValuationSupplements({ report }: { report: VehicleReport }) {
  const pPlateStatus = formatPPlateStatus(report.vehicle);
  return (
    <View style={{ marginTop: 8 }} wrap={false}>
      <Text style={[styles.sectionTitle, { fontSize: 8 }]}>P plate status</Text>
      <View
        style={{
          marginTop: 4,
          borderWidth: 1,
          borderColor: "#e2e8f0",
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <View
            style={{
              width: "36%",
              backgroundColor: SPEC_LABEL_BG,
              padding: 5,
              borderRightWidth: 1,
              borderRightColor: "#e2e8f0",
            }}
          >
            <Text style={styles.specSheetLabel}>P plate eligibility</Text>
          </View>
          <View style={{ flex: 1, padding: 5 }}>
            <Text
              style={[
                styles.specSheetValue,
                isPPlateAdvisoryCopy(pPlateStatus)
                  ? { color: RIDE_SHARE_ORANGE, fontFamily: "Helvetica-Bold" }
                  : {},
              ]}
            >
              {pPlateStatus}
            </Text>
          </View>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 8, fontSize: 8 }]}>
        Official P-plate vehicle/legal reference
      </Text>
      <View
        style={{
          marginTop: 3,
          borderWidth: 1,
          borderColor: "#e2e8f0",
          borderRadius: 6,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            backgroundColor: LIGHT,
            borderBottomWidth: 1,
            borderBottomColor: "#e2e8f0",
            padding: 4,
          }}
        >
          <Text style={{ width: "22%", fontSize: 6.5, fontFamily: "Helvetica-Bold" }}>
            State
          </Text>
          <Text style={{ flex: 1, fontSize: 6.5, fontFamily: "Helvetica-Bold" }}>
            State link references
          </Text>
        </View>
        {P_PLATE_REFERENCE_ROWS.map((row, index) => (
          <View
            key={row.state}
            style={{
              flexDirection: "row",
              borderTopWidth: index === 0 ? 0 : 1,
              borderTopColor: "#e2e8f0",
              alignItems: "flex-start",
            }}
          >
            <View
              style={{
                width: "22%",
                backgroundColor: SPEC_LABEL_BG,
                padding: 4,
                borderRightWidth: 1,
                borderRightColor: "#e2e8f0",
              }}
            >
              <Text style={styles.specSheetLabel}>{row.state}</Text>
            </View>
            <View style={{ flex: 1, padding: 4 }}>
              <Link src={row.href} style={{ fontSize: 6.5, color: BLUE }}>
                {row.label}
              </Link>
            </View>
          </View>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 8, fontSize: 8 }]}>
        {RIDE_SHARE_TABLE_HEADING}
      </Text>
      <View
        style={{
          marginTop: 4,
          borderWidth: 1,
          borderColor: "#e2e8f0",
          borderRadius: 6,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            backgroundColor: LIGHT,
            borderBottomWidth: 1,
            borderBottomColor: "#e2e8f0",
            padding: 4,
          }}
        >
          <Text style={{ width: "28%", fontSize: 6.5, fontFamily: "Helvetica-Bold" }}>
            Requirement
          </Text>
          <Text style={{ width: "36%", fontSize: 6.5, fontFamily: "Helvetica-Bold" }}>
            UberX
          </Text>
          <Text style={{ width: "36%", fontSize: 6.5, fontFamily: "Helvetica-Bold" }}>
            DiDi
          </Text>
        </View>
        {RIDE_SHARE_ELIGIBILITY_ROWS.map((row, index) => (
          <View
            key={row.requirement}
            style={{
              flexDirection: "row",
              borderTopWidth: index === 0 ? 0 : 1,
              borderTopColor: "#e2e8f0",
              alignItems: "flex-start",
            }}
          >
            <View
              style={{
                width: "28%",
                backgroundColor: SPEC_LABEL_BG,
                padding: 4,
                borderRightWidth: 1,
                borderRightColor: "#e2e8f0",
              }}
            >
              <Text style={styles.specSheetLabel}>{row.requirement}</Text>
            </View>
            <Text style={{ width: "36%", fontSize: 6.5, padding: 4, color: "#334155" }}>
              {row.uberX}
            </Text>
            <Text style={{ width: "36%", fontSize: 6.5, padding: 4, color: "#334155" }}>
              {row.didi}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function CarInsightsOverviewPage({
  report,
  pageLabel,
}: {
  report: VehicleReport;
  pageLabel: string;
}) {
  const { vehicle } = report;
  const specs = buildReportOverviewSpecs(vehicle, report);
  const statusChecks = buildStatusChecks(report);
  const vehicleTitle = `${vehicle.make} ${vehicle.model} ${vehicle.variant} ${vehicle.year}`.trim();

  return (
    <PdfPageShell report={report} pageLabel={pageLabel}>
      <View style={styles.body}>
        <Text style={styles.title}>Auto Verifi – Vehicle Insights Report</Text>
        <Text style={styles.vehicleName}>{vehicleTitle}</Text>
        <Text style={styles.subtitle}>
          A comprehensive summary of your vehicle&apos;s history, status and key insights.
        </Text>

        <View style={styles.specBar}>
          {specs.map((s, i) => (
            <View key={s.label} style={styles.specItem}>
              <View style={styles.specLabelRow}>
                <PdfSpecIcon index={i} />
                <Text style={styles.specLabel}>{s.label}</Text>
              </View>
              <Text
                style={[
                  styles.specValue,
                  s.label === "VIN" ? { fontSize: 6.5, lineHeight: 1.35 } : {},
                ]}
              >
                {s.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.statusPanel}>
          <View style={styles.statusLeft}>
            <Text style={styles.statusTitle}>Vehicle Status</Text>
            {statusChecks.map((item) => (
              <View key={item.label} style={styles.statusRow}>
                <PdfCheckIcon
                  ok={item.ok}
                  issue={item.issue}
                  muted={item.muted}
                  advisory={item.advisory}
                />
                <Text
                  style={{
                    ...styles.statusText,
                    color: item.issue
                      ? "#dc2626"
                      : item.advisory
                        ? RIDE_SHARE_ORANGE
                        : item.muted
                          ? "#94a3b8"
                          : styles.statusText.color,
                  }}
                >
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
          <PdfVehicleHero vehicle={vehicle} vehicleTitle={vehicleTitle} />
        </View>

      </View>
    </PdfPageShell>
  );
}

function PdfPresentAndFutureValuations({
  report,
  showFutureValue,
}: {
  report: VehicleReport;
  showFutureValue: boolean;
}) {
  const { valuation } = report;
  const futureValue = resolveFutureValue(report);
  const futureHorizons = [
    { label: "Today", years: 0 },
    { label: "+1 year", years: 1 },
    { label: "+3 years", years: 3 },
    { label: "+5 years", years: 5 },
  ];

  return (
    <>
      <View style={[styles.section, { marginTop: 4 }]}>
        <Text style={styles.sectionTitle}>Present Value — Market Valuation</Text>
        <View style={styles.valRow}>
          {[
            ["Trade-in", valuation.tradeLow, valuation.tradeHigh],
            ["Private sale", valuation.privateLow, valuation.privateHigh],
            ["Dealer retail", valuation.retailLow, valuation.retailHigh],
          ].map(([label, low, high]) => (
            <View key={label as string} style={styles.valBox}>
              <Text style={styles.valLabel}>{label}</Text>
              <Text style={styles.valAmount}>
                {money(low as number)} – {money(high as number)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {showFutureValue ? (
        <View style={[styles.section, { marginTop: 10 }]}>
          <Text style={styles.sectionTitle}>Future Value Forecast</Text>
          <Text style={{ fontSize: 7, color: GREY, marginTop: 2 }}>
            Based on {futureValue.yearlyKms.toLocaleString()} km per year
          </Text>
          <View style={styles.valRow}>
            {futureHorizons.map(({ label, years }) => {
              const point = getFutureValueAtYears(futureValue, years);
              return (
                <View key={label} style={styles.valBox}>
                  <Text style={styles.valLabel}>{label}</Text>
                  <Text style={styles.valAmount}>
                    {point ? money(point.value) : "—"}
                  </Text>
                  {point ? (
                    <Text style={{ fontSize: 7, color: GREY, marginTop: 2 }}>
                      {point.odometer.toLocaleString()} km
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      <PdfValuationSupplements report={report} />
    </>
  );
}

function PdfPresentFutureValuationPage({
  report,
  pageLabel,
}: {
  report: VehicleReport;
  pageLabel: string;
}) {
  return (
    <PdfPageShell report={report} pageLabel={pageLabel}>
      <View style={styles.body}>
        <PdfPresentAndFutureValuations report={report} showFutureValue />
      </View>
    </PdfPageShell>
  );
}

function CarInsightsInsightsAndDetailsPage({
  report,
  pageLabel,
  showUpgrade,
  includeValuationSections = true,
  trailing,
}: {
  report: VehicleReport;
  pageLabel: string;
  showUpgrade: boolean;
  includeValuationSections?: boolean;
  trailing?: React.ReactNode;
}) {
  const { vehicle, market, valuation } = report;
  const insights = buildKeyInsights(report);
  const vehicleTitle = `${vehicle.make} ${vehicle.model} ${vehicle.variant} ${vehicle.year}`.trim();
  const showFutureValue = hasDamageAnalysis(resolveReportTier(report.tier));

  return (
    <PdfPageShell report={report} pageLabel={pageLabel}>
      <View style={styles.body}>
        <View style={{ marginTop: 4 }}>
          <Text style={styles.sectionLabel}>Key Insights</Text>
        </View>
        <Text style={[styles.subtitle, { marginTop: 4 }]}>Key insights — {vehicleTitle}</Text>
        <PdfInsightGrid insights={insights} />
        <PdfManufacturersWarrantyNotice />

        {includeValuationSections ? (
          <PdfPresentAndFutureValuations
            report={report}
            showFutureValue={showFutureValue}
          />
        ) : null}

        {showUpgrade ? (
          <View style={[styles.upgradeBox, { marginTop: 10 }]} wrap={false}>
            <PdfInsightIcon insightId="ppsr" size={16} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#0f172a" }}>
                Upgrade to Auto Verifi Insights+ for AI powered condition scan.
              </Text>
            </View>
          </View>
        ) : null}

        <View style={[styles.section, { marginTop: 10 }]}>
          <Text style={styles.sectionTitle}>Comparable Vehicles For Sale</Text>
          <View style={styles.tableHead}>
            <Text style={{ width: "42%" }}>Vehicle</Text>
            <Text style={{ width: "15%" }}>Price</Text>
            <Text style={{ width: "18%" }}>Odometer</Text>
            <Text style={{ width: "15%" }}>Location</Text>
            <Text style={{ width: "10%" }}>Listed</Text>
          </View>
          {market.comparableListings.slice(0, MAX_COMPARABLE_ROWS).map((l, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={{ width: "42%" }}>{l.title}</Text>
              <Text style={{ width: "15%" }}>{money(l.price)}</Text>
              <Text style={{ width: "18%" }}>{l.odometer.toLocaleString()} km</Text>
              <Text style={{ width: "15%" }}>{l.location}</Text>
              <Text style={{ width: "10%" }}>{l.daysListed}d</Text>
            </View>
          ))}
        </View>
        {trailing}
      </View>
    </PdfPageShell>
  );
}

function FactoryFeatureLines({
  features,
}: {
  features: NonNullable<VehicleReport["vehicleSpec"]>["factoryFeatures"];
}) {
  if (features.length === 0) {
    return (
      <Text style={styles.para}>
        No factory option list was returned for this vehicle.
      </Text>
    );
  }
  return (
    <>
      {features.map((feature) => (
        <Text
          key={`${feature.code ?? "f"}-${feature.label}`}
          style={styles.featureItem}
        >
          • {feature.label}
          {feature.code ? ` (${feature.code})` : ""}
        </Text>
      ))}
    </>
  );
}

function VehicleSpecPages({
  report,
  pageLabels,
  trailing,
}: {
  report: VehicleReport;
  pageLabels: string[];
  /** Rendered at the end of the last spec page. */
  trailing?: React.ReactNode;
}) {
  const sheet = report.vehicleSpec;
  if (!sheet || !hasVehicleSpecContent(sheet)) return null;

  const { vehicle } = report;
  const specTitle =
    `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.variant}`.trim();
  const firstPageFeatures = sheet.factoryFeatures.slice(
    0,
    SPEC_FEATURES_ON_FIRST_SPEC_PAGE,
  );
  const continuationChunks = chunkFactoryFeatures(
    sheet.factoryFeatures.slice(SPEC_FEATURES_ON_FIRST_SPEC_PAGE),
    SPEC_FEATURES_CONTINUATION,
  );

  return (
    <>
      <PdfPageShell report={report} pageLabel={pageLabels[0] ?? ""}>
        <View style={styles.body}>
          <Text style={styles.title}>Vehicle Data &amp; Factory Equipment</Text>
          <Text style={[styles.vehicleName, { fontSize: 12, marginTop: 4 }]}>
            {specTitle}
          </Text>
          <Text style={{ fontSize: 7, color: GREY, marginTop: 4 }}>
            Captured {formatReportDate(sheet.capturedAt)} from registration and build
            data sources.
          </Text>

          <View style={[styles.section, { marginTop: 10 }]}>
            <Text style={styles.sectionTitle}>Vehicle data</Text>
            {sheet.dataRows.map((row) => (
              <View key={row.label} style={styles.specSheetRow}>
                <View style={styles.specSheetLabelCell}>
                  <Text style={styles.specSheetLabel}>{row.label}</Text>
                </View>
                <View style={styles.specSheetValueCell}>
                  <Text
                    style={[
                      styles.specSheetValue,
                      row.value === ODOMETER_NO_HISTORY_LABEL
                        ? { color: RIDE_SHARE_ORANGE, fontFamily: "Helvetica-Bold" }
                        : {},
                    ]}
                  >
                    {row.value}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={[styles.section, { marginTop: 10 }]}>
            <Text style={styles.sectionTitle}>Factory features &amp; options</Text>
            {sheet.factoryFeatures.length > 0 ? (
              <FactoryFeatureLines features={firstPageFeatures} />
            ) : (
              <Text style={[styles.para, { marginTop: 6 }]}>
                No factory option list was returned for this vehicle.
              </Text>
            )}
          </View>
          {continuationChunks.length === 0 ? trailing : null}
        </View>
      </PdfPageShell>

      {continuationChunks.map((chunk, index) => (
        <PdfPageShell
          key={`spec-cont-${index}`}
          report={report}
          pageLabel={pageLabels[index + 1] ?? ""}
        >
          <View style={styles.body}>
            <Text style={styles.title}>Vehicle Data &amp; Factory Equipment</Text>
            <Text style={styles.subtitle}>
              Factory features &amp; options (continued)
            </Text>
            <FactoryFeatureLines features={chunk} />
            {index === continuationChunks.length - 1 ? trailing : null}
          </View>
        </PdfPageShell>
      ))}
    </>
  );
}

function CarBuyingChecklistPage({
  report,
  pageLabel,
  trailing,
}: {
  report: VehicleReport;
  pageLabel: string;
  trailing?: React.ReactNode;
}) {
  return (
    <PdfPageShell report={report} pageLabel={pageLabel}>
      <View style={styles.body}>
        <Text style={[styles.title, { color: BLUE }]}>{CAR_BUYING_CHECKLIST_TITLE}</Text>
        <Text style={[styles.para, { marginTop: 8 }]}>{CAR_BUYING_CHECKLIST_INTRO}</Text>

        <View style={{ marginTop: 12 }}>
          {CAR_BUYING_CHECKLIST_ITEMS.map((item, index) => (
            <View
              key={item.title}
              style={{
                flexDirection: "row",
                marginBottom: 8,
                padding: 10,
                backgroundColor: LIGHT,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#e2e8f0",
              }}
              wrap={false}
            >
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: BLUE,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 10,
                }}
              >
                <Text style={{ color: "#ffffff", fontSize: 8.5, fontFamily: "Helvetica-Bold" }}>
                  {index + 1}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: "#0f172a" }}>
                  {item.title}
                </Text>
                <Text style={[styles.para, { marginTop: 3 }]}>{item.body}</Text>
                {item.href ? (
                  <Link
                    src={item.href}
                    style={{ marginTop: 4, fontSize: 8, color: BLUE, fontFamily: "Helvetica-Bold" }}
                  >
                    {item.linkLabel ?? item.href}
                  </Link>
                ) : null}
              </View>
            </View>
          ))}
        </View>

        {trailing}
      </View>
    </PdfPageShell>
  );
}

function PpsrCertificateIntroPage({
  report,
  pageLabel,
}: {
  report: VehicleReport;
  pageLabel: string;
}) {
  if (!hasPpsrCertificate(report)) return null;

  return (
    <PdfPageShell report={report} pageLabel={pageLabel}>
      <View style={styles.body}>
        <Text
          style={{
            fontSize: 8,
            fontFamily: "Helvetica-Bold",
            color: BLUE,
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          Official register search
        </Text>
        <Text style={[styles.title, { marginTop: 6, fontSize: 18, color: BLUE }]}>
          PPSR certificate
        </Text>
        <Text style={[styles.para, { marginTop: 12 }]}>
          The following pages contain the official search certificate issued by the
          Australian Financial Security Authority (AFSA) for this vehicle. It should
          be read together with your Auto Verifi report.
        </Text>
        <Text style={[styles.para, { marginTop: 8 }]}>
          For help understanding PPSR terminology and search results, visit ppsr.gov.au.
        </Text>
        <Text style={[styles.para, { marginTop: 14, fontFamily: "Helvetica-Bold" }]}>
          The official PPSR certificate PDF is appended immediately after this page in
          your downloaded report file.
        </Text>
      </View>
    </PdfPageShell>
  );
}

function PdfGeneralDisclaimer() {
  const [terms, ...rest] = REPORT_GENERAL_DISCLAIMER_PARAGRAPHS;
  return (
    <View
      style={{
        marginTop: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: "#e2e8f0",
      }}
      wrap={false}
    >
      <Text
        style={{
          fontSize: 8,
          fontFamily: "Helvetica-Bold",
          color: "#0f172a",
          textTransform: "uppercase",
          letterSpacing: 0.6,
        }}
      >
        {REPORT_GENERAL_DISCLAIMER_TITLE}
      </Text>
      <Text style={{ marginTop: 4, fontSize: 6.8, color: GREY, lineHeight: 1.4 }}>
        {terms} (
        <Link src={REPORT_TERMS_URL} style={{ color: BLUE }}>
          {REPORT_TERMS_URL}
        </Link>
        ).
      </Text>
      {rest.map((paragraph) => (
        <Text
          key={paragraph}
          style={{ marginTop: 3, fontSize: 6.8, color: GREY, lineHeight: 1.4 }}
        >
          {paragraph}
        </Text>
      ))}
    </View>
  );
}

function PdfPhotoGroup({
  title,
  photos,
  note,
}: {
  title: string;
  photos: InspectionPhoto[];
  note?: string;
}) {
  if (photos.length === 0) return null;
  return (
    <View style={[styles.section, { marginTop: 10 }]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {note ? (
        <Text style={[styles.para, { marginTop: 2, fontSize: 6.5 }]}>{note}</Text>
      ) : null}
      <View style={styles.photoGrid}>
        {photos.map((photo) => {
          const url = resolvePdfImageSrc(getInspectionPhotoUrl(photo));
          const evidenceLines = formatInspectionPhotoEvidenceLines(photo);
          const label =
            photo.angle === "front" ? `${photo.label} (rego visible)` : photo.label;
          return (
            <View
              key={`${photo.angle}-${photo.uploadedAt}`}
              style={styles.photoTile}
              wrap={false}
            >
              {url ? (
                <Image src={url} style={styles.photoImage} />
              ) : (
                <View style={[styles.photoImage, { backgroundColor: LIGHT }]} />
              )}
              <Text style={styles.photoCaption}>{label}</Text>
              {evidenceLines.map((line) => (
                <Text key={line} style={styles.photoEvidenceCaption}>
                  {line}
                </Text>
              ))}
              <View style={{ height: 3 }} />
            </View>
          );
        })}
      </View>
    </View>
  );
}

function InsightsPlusPage({
  report,
  photos,
  pageLabel,
  trailing,
}: {
  report: VehicleReport;
  photos: InspectionPhoto[];
  pageLabel: string;
  trailing?: React.ReactNode;
}) {
  const { vehicle, damage } = report;
  const vehicleTitle = `${vehicle.make} ${vehicle.model} ${vehicle.variant} ${vehicle.year}`.trim();
  const walkaroundPhotos = photos.filter((photo) =>
    isExteriorInspectionAngle(photo.angle),
  );
  const additionalPhotos = photos.filter(
    (photo) => !isExteriorInspectionAngle(photo.angle),
  );

  return (
    <PdfPageShell report={report} pageLabel={pageLabel}>
      <View style={styles.body}>
        <Text style={styles.title}>Auto Verifi Insights+ Report</Text>
        <Text style={styles.vehicleName}>{vehicleTitle}</Text>
        <View style={styles.plusHeading}>
          <Text style={styles.plusTitle}>Current Body Condition</Text>
          <Text style={styles.plusSub}>AI-Powered Image Analysis</Text>
        </View>

        {!damage && photos.length === 0 ? (
          <Text style={[styles.para, { marginTop: 12 }]}>
            Guided walkaround photos and AI damage analysis will appear here once the
            mobile inspection is completed.
          </Text>
        ) : null}

        <PdfPhotoGroup
          title="Walkaround Photos"
          photos={walkaroundPhotos}
          note="Captured on the owner's device. Time and location are recorded beneath each photo when location access is granted; the front photo should show the registration plate."
        />
        <PdfPhotoGroup title="Additional Photos" photos={additionalPhotos} />

        {damage && damage.findings.length === 0 && photos.length > 0 ? (
          <Text style={[styles.para, { marginTop: 6, color: RIDE_SHARE_GREEN }]}>
            No visible damage detected in the AI analysis.
          </Text>
        ) : null}

        {damage && damage.findings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detected Damage</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {damage.findings.map((f, i) => {
                const damageImageUrl = resolvePdfImageSrc(
                  resolveDamageFindingImageUrl(f, photos),
                );
                return (
                  <View key={i} style={styles.damageCard}>
                    {damageImageUrl ? (
                      <Image src={damageImageUrl} style={styles.photoImage} />
                    ) : null}
                    <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 8.5 }}>
                      {f.panel}
                    </Text>
                    <Text style={{ marginTop: 2, fontSize: 8, color: "#dc2626" }}>
                      {f.type} · {f.severity}
                    </Text>
                    {f.description ? (
                      <Text style={{ marginTop: 2, fontSize: 7.5, color: GREY }}>
                        {f.description}
                      </Text>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {trailing}
      </View>
    </PdfPageShell>
  );
}

function PdfReportDisclaimerPage({
  report,
  pageLabel,
}: {
  report: VehicleReport;
  pageLabel: string;
}) {
  const company = getCompanyDetails();
  const abn = formatAbnDisplay(company.abn);

  return (
    <Page size="A4" style={styles.page}>
      <View
        style={{
          flex: 1,
          backgroundColor: "#0f172a",
          paddingHorizontal: 36,
          paddingVertical: 40,
          justifyContent: "space-between",
        }}
      >
        <View>
          <Image
            src={LOGO_INVERSE}
            style={{
              width: REPORT_HEADER_LOGO_WIDTH,
              height: REPORT_HEADER_LOGO_HEIGHT,
              objectFit: "contain",
            }}
          />
          <Text
            style={{
              marginTop: 22,
              fontSize: 9,
              lineHeight: 1.5,
              color: "#94a3b8",
            }}
          >
            {REPORT_DISCLAIMER_LEAD}
          </Text>
          <Text
            style={{
              marginTop: 8,
              fontSize: 9,
              lineHeight: 1.5,
              color: "#94a3b8",
            }}
          >
            {REPORT_DISCLAIMER_CLOSING}
          </Text>
          <Text
            style={{
              marginTop: 18,
              fontSize: 9,
              lineHeight: 1.55,
              color: "#94a3b8",
            }}
          >
            {company.legalName}
            {"\n"}
            {abn ? `ABN ${abn}` : ""}
            {abn ? "\n" : ""}
            {company.address}
            {"\n"}
            {company.email}
            {"\n"}
            {company.website}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 7,
            color: GREY,
            textTransform: "uppercase",
            textAlign: "right",
          }}
        >
          {formatReportReference(report.vehicle)} · Autoverifi.com.au | {pageLabel}
        </Text>
      </View>
    </Page>
  );
}

export function ReportPdf({
  report,
  photos = [],
}: {
  report: VehicleReport;
  photos?: InspectionPhoto[];
}) {
  const isPlus = hasDamageAnalysis(report.tier);
  const includeSpec = hasVehicleSpecContent(report.vehicleSpec);
  const specPageCount =
    includeSpec && report.vehicleSpec
      ? countVehicleSpecPdfPages(report.vehicleSpec)
      : 0;
  const includePpsrIntro = hasPpsrCertificate(report);
  const totalPages =
    2 +
    specPageCount +
    (isPlus ? 2 : 0) +
    1 + // Car buying checklist + general disclaimer
    (includePpsrIntro ? 1 : 0) +
    1;
  let pageNumber = 1;
  const nextPageLabel = () => `${pageNumber++} / ${totalPages}`;
  const overviewLabel = nextPageLabel();
  const insightsLabel = nextPageLabel();
  const valuationsLabel = isPlus ? nextPageLabel() : null;
  const specPageLabels = Array.from({ length: specPageCount }, () =>
    nextPageLabel(),
  );

  return (
    <Document title={`Auto Verifi Report ${report.id}`}>
      <CarInsightsOverviewPage report={report} pageLabel={overviewLabel} />
      <CarInsightsInsightsAndDetailsPage
        report={report}
        pageLabel={insightsLabel}
        showUpgrade={!isPlus}
        includeValuationSections={!isPlus}
      />
      {isPlus && valuationsLabel ? (
        <PdfPresentFutureValuationPage
          report={report}
          pageLabel={valuationsLabel}
        />
      ) : null}
      {includeSpec && report.vehicleSpec ? (
        <VehicleSpecPages report={report} pageLabels={specPageLabels} />
      ) : null}
      {isPlus ? (
        <InsightsPlusPage
          report={report}
          photos={photos}
          pageLabel={`${pageNumber++} / ${totalPages}`}
        />
      ) : null}
      <CarBuyingChecklistPage
        report={report}
        pageLabel={`${pageNumber++} / ${totalPages}`}
        trailing={<PdfGeneralDisclaimer />}
      />
      {includePpsrIntro ? (
        <PpsrCertificateIntroPage
          report={report}
          pageLabel={`${pageNumber++} / ${totalPages}+`}
        />
      ) : null}
      <PdfReportDisclaimerPage
        report={report}
        pageLabel={`${pageNumber} / ${totalPages}`}
      />
    </Document>
  );
}
