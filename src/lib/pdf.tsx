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
import {
  formatInspectionPhotoTileLabel,
  INSPECTION_RECORD_ONLY_FOOTNOTE_WITH_STAR,
  isExteriorInspectionAngle,
  isRecordOnlyInspectionPhoto,
} from "./inspection-angles";
import {
  hasVehicleSpecContent,
  visibleSpecDataRows,
  isPowerToWeightSpecRow,
  P_PLATE_POWER_TO_WEIGHT_FOOTNOTE,
  shouldShowPowerToWeightFootnote,
} from "./vehicle-spec-sheet";
import {
  buildKeyInsights,
  comparableListingsShowDaysListed,
  ANCAP_SAFETY_RATINGS_URL,
  formatExpiryDate,
  hasOdometerHistory,
  ODOMETER_HISTORY_LISTING_LINE,
  odometerHistoryCountLabel,
  readingAtPurchaseOfReportDetail,
  VEHICLE_RECALLS_GOV_AU_URL,
  buildReportOverviewSpecs,
  buildStatusChecks,
  formatPPlateStatus,
  MANUFACTURERS_WARRANTY_NOTICE,
  SERVICE_HISTORY_DETAIL,
  formatWarrantyRemainingDisplay,
  formatReportDate,
  formatReportReference,
  getFutureValueAtYears,
  futureValueForecastNote,
  getInspectionPhotoUrl,
  resolveDamageFindingImageUrl,
  presentValuationNote,
  reportInsightCopy,
  rideShareInsightColumnIndex,
  resolveFutureValue,
  resolveValuation,
  type ReportInsight,
} from "./report-design";
import {
  PdfCheckIcon,
  PdfInsightIcon,
  PdfSpecIcon,
  PdfStatusBadge,
} from "./report-pdf-icons";
import {
  getVehicleReportMainTitle,
  hasDamageAnalysis,
  resolveReportTier,
} from "./pricing";
import {
  REPORT_GENERAL_DISCLAIMER_PARAGRAPHS,
  REPORT_GENERAL_DISCLAIMER_TITLE,
  REPORT_TERMS_URL,
} from "./report-disclaimer";
import {
  REPORT_FOOTER_LOGO_HEIGHT,
  REPORT_FOOTER_LOGO_WIDTH,
  REPORT_HEADER_LOGO_HEIGHT,
  REPORT_HEADER_LOGO_WIDTH,
  REPORT_LOGO_OBJECT_POSITION,
  REPORT_LOGO_PNG_PATH,
} from "./report-logo-size";
import { publicPdfImage } from "./pdf-local-image";
import { VEHICLE_HERO_IMAGE_DISCLAIMER } from "./vehicle-hero-image";
import { VehicleReport } from "./types";
import type { InspectionPhoto } from "./types";

const BLUE = "#0073E3";
const GREY = "#64748b";
const LIGHT = "#f8fafc";
const SPEC_LABEL_BG = "#f1f5f9";
const TABLE_ROW_SHADE = "#eff6ff";
/** Match Tailwind slate borders on the web report. */
const BORDER_SLATE_200 = "#e2e8f0";
/** 1pt borders in react-pdf read darker/thicker than 1px on the web report. */
const PDF_BORDER_OUTER = 0.75;
const PDF_BORDER_INNER = 0.5;
const PDF_TABLE_FONT_BODY = 8;
const PDF_TABLE_FONT_HEAD = 7.5;
/** Primary $ amounts (forecast boxes + comparables price). */
const PDF_REPORT_CURRENCY = 9;
/** Secondary km / counts in valuation tables. */
const PDF_REPORT_METRIC = 8;
const PDF_TABLE_PAD_V = 7;
const PDF_TABLE_PAD_H = 12;
/** Page 1 insight cards — match web `ReportInsightCard` spacing (~p-4, text-xs). */
const PDF_INSIGHT_PAD = 7;
const PDF_INSIGHT_TITLE = 7.5;
const PDF_INSIGHT_BODY = 9;
const PDF_INSIGHT_BODY_SM = 8.25;
const PDF_INSIGHT_LINE = 1.45;
const RIDE_SHARE_ORANGE = "#E87722";
const LOGO_BLUE = publicPdfImage(REPORT_LOGO_PNG_PATH);

const PDF_A4_WIDTH = 595.28;
const PDF_A4_HEIGHT = 841.89;
/** Fixed height of the status + hero panel on page 1 (keeps yoga layout stable). */
const STATUS_PANEL_HEIGHT = 148;

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontSize: 8.5,
    fontFamily: "Helvetica",
    color: "#1e293b",
    backgroundColor: "#ffffff",
    position: "relative",
  },
  sampleWatermarkLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: PDF_A4_WIDTH,
    height: PDF_A4_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  sampleWatermarkText: {
    width: PDF_A4_WIDTH * 1.65,
    textAlign: "center",
    fontSize: 108,
    fontFamily: "Helvetica-Bold",
    color: "#94a3b8",
    opacity: 0.24,
    letterSpacing: 22,
    transform: "rotate(-35deg)",
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
    paddingVertical: 11,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: BLUE,
  },
  logoHeader: {
    width: REPORT_HEADER_LOGO_WIDTH,
    height: REPORT_HEADER_LOGO_HEIGHT,
    objectFit: "contain",
    objectPosition: REPORT_LOGO_OBJECT_POSITION,
    alignSelf: "flex-start",
  },
  headerTagline: {
    color: BLUE,
    fontSize: 6.5,
    marginTop: 3,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.15,
  },
  headerMeta: {
    textAlign: "right",
    color: GREY,
    fontSize: 7.5,
    lineHeight: 1.55,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
  },
  body: { paddingHorizontal: 32, paddingTop: 14, paddingBottom: 18 },
  bodyCompact: { paddingHorizontal: 32, paddingTop: 12, paddingBottom: 14 },
  title: { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#0f172a" },
  vehicleName: {
    marginTop: 4,
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 6.5,
    color: GREY,
    textTransform: "uppercase",
    letterSpacing: 0.15,
    fontFamily: "Helvetica-Bold",
  },
  specBar: {
    marginTop: 8,
    borderWidth: PDF_BORDER_OUTER,
    borderColor: BORDER_SLATE_200,
    borderRadius: 8,
    backgroundColor: LIGHT,
    overflow: "hidden",
  },
  specRow: {
    flexDirection: "row",
    borderBottomWidth: PDF_BORDER_INNER,
    borderBottomColor: BORDER_SLATE_200,
  },
  specItem: {
    width: "25%",
    paddingVertical: 6,
    paddingHorizontal: 9,
    borderRightWidth: PDF_BORDER_INNER,
    borderRightColor: BORDER_SLATE_200,
  },
  specLabelRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  specLabel: {
    fontSize: 7.5,
    color: "#0f172a",
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
  },
  specValue: {
    marginTop: 4,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: GREY,
    lineHeight: 1.25,
  },
  statusPanel: {
    marginTop: 8,
    flexDirection: "row",
    borderWidth: PDF_BORDER_OUTER,
    borderColor: BORDER_SLATE_200,
    borderRadius: 8,
    overflow: "hidden",
    height: STATUS_PANEL_HEIGHT,
  },
  statusLeft: {
    width: "58%",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRightWidth: PDF_BORDER_INNER,
    borderRightColor: BORDER_SLATE_200,
  },
  statusImageWrap: {
    width: "42%",
    height: STATUS_PANEL_HEIGHT,
    backgroundColor: "#f8fafc",
    flexDirection: "column",
    overflow: "hidden",
  },
  statusImageArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 0,
    paddingHorizontal: 4,
    paddingTop: 4,
  },
  statusImage: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
    objectPosition: "center",
  },
  statusImageCaption: {
    backgroundColor: "#f8fafc",
    color: "#64748b",
    fontSize: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    lineHeight: 1.35,
    borderTopWidth: PDF_BORDER_INNER,
    borderTopColor: BORDER_SLATE_200,
  },
  specHeroBanner: {
    marginTop: 10,
    width: "100%",
    minHeight: 128,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    overflow: "hidden",
    flexDirection: "column",
    borderWidth: PDF_BORDER_INNER,
    borderColor: BORDER_SLATE_200,
  },
  specHeroBannerImage: {
    width: "100%",
    height: 100,
    objectFit: "contain",
    objectPosition: "center",
  },
  statusTitle: {
    fontSize: 7.5,
    color: "#0f172a",
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  statusRow: { flexDirection: "row", marginBottom: 5, alignItems: "flex-start", gap: 6 },
  statusText: { flex: 1, fontSize: 9, lineHeight: 1.4, color: "#334155" },
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
    letterSpacing: 0.15,
    color: "#0f172a",
  },
  sectionLabelAccent: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    color: BLUE,
  },
  insightGrid: {
    marginTop: 6,
  },
  insightRow: {
    flexDirection: "row",
    alignItems: "stretch",
    marginBottom: 5,
  },
  insightCard: {
    width: "24.25%",
    marginRight: "1%",
    borderWidth: PDF_BORDER_OUTER,
    borderColor: BORDER_SLATE_200,
    borderRadius: 8,
    padding: PDF_INSIGHT_PAD,
    backgroundColor: "#f1f5f9",
  },
  insightTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 6,
  },
  insightTitle: {
    fontSize: PDF_INSIGHT_TITLE,
    color: "#0f172a",
    textAlign: "right",
    flex: 1,
    lineHeight: 1.35,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  insightBottom: {
    marginTop: 5,
    flexDirection: "column",
    alignItems: "stretch",
  },
  insightStatusRow: { flexDirection: "row", alignItems: "flex-start", gap: 4 },
  insightStatus: {
    fontSize: PDF_INSIGHT_BODY,
    fontFamily: "Helvetica",
    lineHeight: PDF_INSIGHT_LINE,
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
    borderWidth: PDF_BORDER_OUTER,
    borderColor: BORDER_SLATE_200,
    borderRadius: 6,
    padding: 8,
  },
  valLabel: { fontSize: 7, color: GREY },
  valAmount: {
    marginTop: 3,
    fontSize: PDF_REPORT_CURRENCY,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
  },
  reportCurrency: {
    fontSize: PDF_REPORT_CURRENCY,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
  },
  reportMetric: {
    fontSize: PDF_REPORT_METRIC,
    fontFamily: "Helvetica",
    color: "#334155",
  },
  section: { marginTop: 14 },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    borderBottomWidth: 2,
    borderBottomColor: BLUE,
    paddingBottom: 3,
    marginBottom: 8,
  },
  para: { lineHeight: 1.45, color: "#334155", fontSize: 8.5 },
  specSheetTableWrap: {
    marginTop: 6,
    borderWidth: PDF_BORDER_OUTER,
    borderColor: BORDER_SLATE_200,
    borderRadius: 6,
    overflow: "hidden",
  },
  specSheetRow: {
    flexDirection: "row",
    borderBottomWidth: PDF_BORDER_INNER,
    borderBottomColor: BORDER_SLATE_200,
  },
  specSheetLabelCell: {
    width: "42%",
    backgroundColor: SPEC_LABEL_BG,
    borderRightWidth: PDF_BORDER_INNER,
    borderRightColor: BORDER_SLATE_200,
    paddingVertical: PDF_TABLE_PAD_V,
    paddingHorizontal: PDF_TABLE_PAD_H,
  },
  specSheetLabel: { fontSize: PDF_TABLE_FONT_BODY, color: GREY },
  specSheetValueCell: {
    width: "58%",
    paddingVertical: PDF_TABLE_PAD_V,
    paddingHorizontal: PDF_TABLE_PAD_H,
  },
  specSheetValue: {
    fontSize: PDF_TABLE_FONT_BODY,
    fontFamily: "Helvetica",
    color: "#0f172a",
  },
  pdfTableWrap: {
    marginTop: 4,
    borderWidth: PDF_BORDER_OUTER,
    borderColor: BORDER_SLATE_200,
    borderRadius: 6,
    overflow: "hidden",
  },
  pdfTableHeadRow: {
    flexDirection: "row",
    backgroundColor: LIGHT,
    borderBottomWidth: PDF_BORDER_INNER,
    borderBottomColor: BORDER_SLATE_200,
    paddingVertical: PDF_TABLE_PAD_V,
    paddingHorizontal: PDF_TABLE_PAD_H,
  },
  pdfTableHeadCell: {
    fontSize: PDF_TABLE_FONT_HEAD,
    fontFamily: "Helvetica-Bold",
    color: GREY,
  },
  pdfTableBodyRow: {
    flexDirection: "row",
    alignItems: "stretch",
    borderBottomWidth: PDF_BORDER_INNER,
    borderBottomColor: BORDER_SLATE_200,
  },
  pdfTableBodyRowLast: {
    borderBottomWidth: 0,
  },
  pdfTableCell: {
    fontSize: PDF_TABLE_FONT_BODY,
    paddingVertical: PDF_TABLE_PAD_V,
    paddingHorizontal: PDF_TABLE_PAD_H,
    color: "#334155",
  },
  pdfTableCellBold: {
    fontSize: PDF_TABLE_FONT_BODY,
    paddingVertical: PDF_TABLE_PAD_V,
    paddingHorizontal: PDF_TABLE_PAD_H,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  pdfTableLabelCell: {
    backgroundColor: SPEC_LABEL_BG,
    borderRightWidth: PDF_BORDER_INNER,
    borderRightColor: BORDER_SLATE_200,
    paddingVertical: PDF_TABLE_PAD_V,
    paddingHorizontal: PDF_TABLE_PAD_H,
    justifyContent: "center",
  },
  featureItem: { fontSize: 6.5, color: "#334155", marginBottom: 1.5, lineHeight: 1.2 },
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
  photoGrid: { marginTop: 6 },
  photoRow: { flexDirection: "row", alignItems: "stretch", marginBottom: 6 },
  photoTile: {
    width: "23.5%",
    marginRight: "2%",
    borderWidth: PDF_BORDER_OUTER,
    borderColor: BORDER_SLATE_200,
    borderRadius: 5,
    overflow: "hidden",
  },
  photoImage: {
    width: "100%",
    height: 64,
    objectFit: "cover",
    objectPosition: "center",
    backgroundColor: "#f1f5f9",
  },
  photoCaption: {
    paddingHorizontal: 4,
    paddingTop: 3,
    paddingBottom: 1,
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    borderTopWidth: PDF_BORDER_INNER,
    borderTopColor: BORDER_SLATE_200,
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
    borderWidth: PDF_BORDER_OUTER,
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
    borderRadius: 6,
    padding: 8,
  },
  footerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: PDF_BORDER_INNER,
    borderTopColor: BORDER_SLATE_200,
    paddingTop: 6,
    paddingBottom: 10,
    paddingHorizontal: 32,
    flexShrink: 0,
  },
  footerLogo: {
    width: REPORT_FOOTER_LOGO_WIDTH,
    height: REPORT_FOOTER_LOGO_HEIGHT,
    objectFit: "contain",
    objectPosition: REPORT_LOGO_OBJECT_POSITION,
    alignSelf: "flex-start",
  },
  footerText: { fontSize: 7, color: GREY, textTransform: "uppercase" },
});

const money = (n: number) => `$${n.toLocaleString("en-AU")}`;

const MAX_COMPARABLE_ROWS = 5;

/** Factory options below the vehicle data table on PDF spec page 1. */
const SPEC_FEATURES_ON_FIRST_SPEC_PAGE = 12;
/** Factory options per continuation page (full width, compact lines). */
const SPEC_FEATURES_CONTINUATION = 28;

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
  if (insight.id === "registration") return undefined;
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
  if (tone === "muted") return { color: "#94a3b8" };
  return styles.neutral;
}

function ReportHeader({ report }: { report: VehicleReport }) {
  const reportReference = formatReportReference(report.vehicle);
  return (
    <View style={styles.header}>
      <View style={{ alignItems: "flex-start" }}>
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
  const isSample = report.id.startsWith("SAMPLE-");
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
      {isSample ? (
        <View style={styles.sampleWatermarkLayer}>
          <Text style={styles.sampleWatermarkText}>SAMPLE</Text>
        </View>
      ) : null}
    </Page>
  );
}

function PdfInsightGrid({ insights }: { insights: ReportInsight[] }) {
  const rows = chunkFactoryFeatures(insights, 4);
  return (
    <View style={styles.insightGrid}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.insightRow} wrap={false}>
          {row.map((insight, i) => (
            <PdfInsightCard
              key={insight.id}
              insight={insight}
              last={i === row.length - 1}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

function PdfInsightCard({
  insight,
  last,
}: {
  insight: ReportInsight;
  last: boolean;
}) {
  const footnote = pdfInsightFootnote(insight);
  return (
          <View style={[styles.insightCard, last ? { marginRight: 0 } : {}]}>
            <View style={styles.insightTop}>
              <PdfInsightIcon insightId={insight.id} size={14} />
              <Text style={styles.insightTitle}>{insight.title}</Text>
            </View>
            <View style={styles.insightBottom}>
              {insight.lines?.length ? (
                <View style={{ width: "100%" }}>
                  {insight.lines.map((line, lineIndex) => (
                    <Text
                      key={line.text}
                      style={{
                        fontSize:
                          insight.id === "rideshare"
                            ? PDF_INSIGHT_BODY_SM
                            : PDF_INSIGHT_BODY,
                        fontFamily: "Helvetica",
                        color: pdfRideShareLineColor(line.variant),
                        marginTop: lineIndex === 0 ? 0 : 2,
                        lineHeight: PDF_INSIGHT_LINE,
                      }}
                    >
                      {reportInsightCopy(line.text)}
                    </Text>
                  ))}
                  {insight.detail ? (
                    <Text
                      style={{
                        marginTop: 4,
                        fontSize: PDF_INSIGHT_BODY_SM,
                        color: GREY,
                        fontFamily: "Helvetica",
                        lineHeight: PDF_INSIGHT_LINE,
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
                  {insight.status?.trim() ? (
                  <Text style={[styles.insightStatus, toneStyle(insight.tone)]}>
                    {reportInsightCopy(insight.status)}
                  </Text>
                  ) : insight.detail ? (
                    <Text
                      style={{
                        fontSize: PDF_INSIGHT_BODY_SM,
                        color:
                          insight.id === "service" ? "#475569" : GREY,
                        fontFamily: "Helvetica",
                        lineHeight: PDF_INSIGHT_LINE,
                      }}
                    >
                      {insight.detail}
                    </Text>
                  ) : null}
                  {insight.statusSubtext ? (
                    <Text
                      style={[
                        styles.insightStatus,
                        insight.id === "registration" || insight.id === "market"
                          ? toneStyle(insight.tone)
                          : { color: GREY, fontFamily: "Helvetica", fontSize: PDF_INSIGHT_BODY_SM },
                        { marginTop: 3 },
                      ]}
                    >
                      {insight.statusSubtext}
                    </Text>
                  ) : null}
                  {insight.listItems?.length && insight.id !== "odometer" ? (
                    <View style={{ marginTop: 4 }}>
                      {insight.listItems.map((item, itemIndex) => (
                        <Text
                          key={item}
                          style={{
                            fontSize: PDF_INSIGHT_BODY_SM,
                            color: GREY,
                            fontFamily: "Helvetica",
                            lineHeight: PDF_INSIGHT_LINE,
                            marginTop: itemIndex === 0 ? 0 : 2,
                          }}
                        >
                          {item}
                        </Text>
                      ))}
                    </View>
                  ) : null}
                  {insight.id === "registration" && insight.detail ? (
                    <Text
                      style={[
                        styles.insightStatus,
                        toneStyle(insight.tone),
                        { marginTop: 3 },
                      ]}
                    >
                      {insight.detail}
                    </Text>
                  ) : null}
                  {insight.id === "recall" &&
                  !insight.status?.trim() &&
                  insight.tone === "muted" ? (
                    <Text
                      style={{
                        marginTop: 0,
                        fontSize: PDF_INSIGHT_BODY_SM,
                        color: "#475569",
                        fontFamily: "Helvetica",
                        lineHeight: PDF_INSIGHT_LINE,
                      }}
                    >
                      Check for recall updates on{" "}
                      <Link src={VEHICLE_RECALLS_GOV_AU_URL}>
                        www.vehiclerecalls.gov.au
                      </Link>
                    </Text>
                  ) : null}
                  {insight.id === "ancap" && insight.status === "Not available" ? (
                    <Text
                      style={{
                        marginTop: 4,
                        fontSize: PDF_INSIGHT_BODY_SM,
                        color: GREY,
                        fontFamily: "Helvetica",
                        lineHeight: PDF_INSIGHT_LINE,
                      }}
                    >
                      Verify ANCAP{"\n"}rating here:{" "}
                      <Link src={ANCAP_SAFETY_RATINGS_URL}>
                        www.ancap.com.au/safety-ratings
                      </Link>
                    </Text>
                  ) : footnote &&
                    insight.id !== "service" &&
                    !(
                      insight.id === "recall" &&
                      !insight.status?.trim() &&
                      insight.tone === "muted"
                    ) ? (
                    <Text
                      style={{
                        marginTop: 4,
                        fontSize: PDF_INSIGHT_BODY_SM,
                        color: GREY,
                        fontFamily: "Helvetica",
                        lineHeight: PDF_INSIGHT_LINE,
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
  const wrapStyle =
    layout === "banner" ? styles.specHeroBanner : styles.statusImageWrap;

  return (
    <View style={wrapStyle}>
      {heroSrc ? (
        layout === "banner" ? (
          <>
            <View style={styles.statusImageArea}>
              <Image src={heroSrc} style={styles.specHeroBannerImage} />
            </View>
            <Text style={styles.statusImageCaption}>
              *{vehicle.heroImageDisclaimer ?? VEHICLE_HERO_IMAGE_DISCLAIMER}
            </Text>
          </>
        ) : (
          <>
            <View style={styles.statusImageArea}>
              <Image src={heroSrc} style={styles.statusImage} />
            </View>
            <Text style={styles.statusImageCaption}>
              *{vehicle.heroImageDisclaimer ?? VEHICLE_HERO_IMAGE_DISCLAIMER}
            </Text>
          </>
        )
      ) : (
        <View
          style={{
            width: "100%",
            height: layout === "banner" ? 108 : STATUS_PANEL_HEIGHT - 2,
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

type OverviewSpec = ReturnType<typeof buildReportOverviewSpecs>[number];

/** Overview spec bar laid out as explicit 4-column rows. */
function buildOverviewSpecRows(specs: OverviewSpec[]): OverviewSpec[][] {
  const rows: OverviewSpec[][] = [];
  for (let i = 0; i < specs.length; i += 4) {
    rows.push(specs.slice(i, i + 4));
  }
  return rows;
}

function PdfOverviewSpecBar({ specs }: { specs: OverviewSpec[] }) {
  const rows = buildOverviewSpecRows(specs);
  let index = 0;
  return (
    <View style={styles.specBar}>
      {rows.map((row, rowIndex) => (
        <View
          key={rowIndex}
          style={[
            styles.specRow,
            rowIndex === rows.length - 1 ? { borderBottomWidth: 0 } : {},
          ]}
        >
          {row.map((s, i) => {
            const iconIndex = index++;
            return (
              <View
                key={s.label}
                style={[
                  styles.specItem,
                  i === row.length - 1 ? { borderRightWidth: 0 } : {},
                ]}
              >
                <View style={styles.specLabelRow}>
                  <PdfSpecIcon index={iconIndex} size={12} />
                  <Text style={styles.specLabel}>{s.label}</Text>
                </View>
                <Text style={styles.specValue}>{s.value}</Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function PdfManufacturersWarrantyNotice({
  vehicle,
}: {
  vehicle: VehicleReport["vehicle"];
}) {
  const warrantyExpiry = formatWarrantyRemainingDisplay(
    vehicle.warrantyRemaining,
  );

  return (
    <View
      style={{
        marginTop: 8,
        padding: 10,
        backgroundColor: LIGHT,
        borderRadius: 8,
        borderWidth: PDF_BORDER_OUTER,
        borderColor: BORDER_SLATE_200,
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
      {warrantyExpiry ? (
        <Text
          style={{
            marginTop: 4,
            fontSize: 8.5,
            fontFamily: "Helvetica-Bold",
            color: "#0f172a",
          }}
        >
          Expiry {warrantyExpiry}
        </Text>
      ) : null}
      <Text
        style={{
          marginTop: 4,
          fontSize: 8,
          fontFamily: "Helvetica",
          color: RIDE_SHARE_ORANGE,
          lineHeight: 1.45,
        }}
      >
        {MANUFACTURERS_WARRANTY_NOTICE}
      </Text>
      <View
        style={{
          marginTop: 8,
          paddingTop: 8,
          borderTopWidth: PDF_BORDER_INNER,
          borderTopColor: BORDER_SLATE_200,
        }}
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
          Service History
        </Text>
        <Text
          style={{
            marginTop: 4,
            fontSize: 8,
            fontFamily: "Helvetica",
            color: RIDE_SHARE_ORANGE,
            lineHeight: 1.45,
          }}
        >
          {SERVICE_HISTORY_DETAIL}
        </Text>
      </View>
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

function PdfPPlateSupplementContent({ report }: { report: VehicleReport }) {
  const pPlateStatus = formatPPlateStatus(report.vehicle);
  return (
    <View style={{ marginTop: 4 }}>
      <Text style={[styles.sectionTitle, { fontSize: 8 }]}>P plate status</Text>
      <View style={styles.pdfTableWrap}>
        <View style={{ flexDirection: "row" }}>
          <View style={[styles.pdfTableLabelCell, { width: "36%" }]}>
            <Text style={styles.specSheetLabel}>P plate eligibility</Text>
          </View>
          <View style={{ flex: 1, paddingVertical: PDF_TABLE_PAD_V, paddingHorizontal: PDF_TABLE_PAD_H }}>
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
        P-plate vehicle/legal reference
      </Text>
      <View style={[styles.pdfTableWrap, { marginTop: 3 }]}>
        <View style={styles.pdfTableHeadRow}>
          <Text style={[styles.pdfTableHeadCell, { width: "32%" }]}>State</Text>
          <Text style={[styles.pdfTableHeadCell, { flex: 1 }]}>
            State link references
          </Text>
        </View>
        {P_PLATE_REFERENCE_ROWS.map((row, index) => (
          <View
            key={row.state}
            style={[
              styles.pdfTableBodyRow,
              index === P_PLATE_REFERENCE_ROWS.length - 1
                ? styles.pdfTableBodyRowLast
                : {},
            ]}
          >
            <View style={[styles.pdfTableLabelCell, { width: "32%" }]}>
              <Text style={styles.specSheetLabel}>{row.state}</Text>
            </View>
            <View style={{ flex: 1, paddingVertical: PDF_TABLE_PAD_V, paddingHorizontal: PDF_TABLE_PAD_H }}>
              <Link src={row.href} style={{ fontSize: PDF_TABLE_FONT_BODY, color: BLUE }}>
                {row.label}
              </Link>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function PdfRideShareSupplementContent() {
  return (
    <View style={{ marginTop: 4 }}>
      <Text style={[styles.sectionTitle, { fontSize: 8 }]}>
        {RIDE_SHARE_TABLE_HEADING}
      </Text>
      <View style={styles.pdfTableWrap}>
        <View style={styles.pdfTableHeadRow}>
          <Text style={[styles.pdfTableHeadCell, { width: "38%" }]}>
            Requirement
          </Text>
          <Text style={[styles.pdfTableHeadCell, { width: "31%" }]}>UberX</Text>
          <Text style={[styles.pdfTableHeadCell, { width: "31%" }]}>DiDi</Text>
        </View>
        {RIDE_SHARE_ELIGIBILITY_ROWS.map((row, index) => (
          <View
            key={row.requirement}
            style={[
              styles.pdfTableBodyRow,
              index === RIDE_SHARE_ELIGIBILITY_ROWS.length - 1
                ? styles.pdfTableBodyRowLast
                : {},
            ]}
          >
            <View style={[styles.pdfTableLabelCell, { width: "38%" }]}>
              <Text style={styles.specSheetLabel}>{row.requirement}</Text>
            </View>
            <Text style={[styles.pdfTableCell, { width: "31%" }]}>{row.uberX}</Text>
            <Text style={[styles.pdfTableCell, { width: "31%" }]}>{row.didi}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function CarInsightsIntroLeadPage({
  report,
  insights,
  pageLabel,
  includeWarranty = false,
}: {
  report: VehicleReport;
  insights: ReportInsight[];
  pageLabel: string;
  includeWarranty?: boolean;
}) {
  const { vehicle } = report;
  const specs = buildReportOverviewSpecs(vehicle, report);
  const statusChecks = buildStatusChecks(report);
  const vehicleTitle = `${vehicle.make} ${vehicle.model} ${vehicle.variant} ${vehicle.year}`.trim();

  return (
    <PdfPageShell report={report} pageLabel={pageLabel}>
      <View style={styles.bodyCompact}>
        <Text style={styles.title}>{getVehicleReportMainTitle(report.tier)}</Text>
        <Text style={styles.vehicleName}>{vehicleTitle}</Text>
        <Text style={styles.subtitle}>
          A comprehensive summary of your vehicle&apos;s history, status and key insights.
        </Text>

        <PdfOverviewSpecBar specs={specs} />

        <View style={[styles.statusPanel, { marginTop: 6 }]}>
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
                        ? "#94a3b8"
                        : item.muted
                          ? "#94a3b8"
                          : styles.statusText.color,
                  }}
                >
                  {reportInsightCopy(item.label)}
                </Text>
              </View>
            ))}
          </View>
          <PdfVehicleHero vehicle={vehicle} vehicleTitle={vehicleTitle} />
        </View>

        {insights.length > 0 ? (
          <View style={{ marginTop: 8 }}>
            <Text style={styles.sectionLabel}>Key Insights</Text>
            <PdfInsightGrid insights={insights} />
          </View>
        ) : null}

        {includeWarranty ? (
          <View style={{ flexDirection: "row", marginTop: 6 }}>
            {(() => {
              const col = rideShareInsightColumnIndex(insights);
              const slotWidth = 24.25;
              const gap = 1;
              return (
                <>
                  {col > 0 ? (
                    <View style={{ width: `${col * (slotWidth + gap)}%` }} />
                  ) : null}
                  <View style={{ width: `${slotWidth}%` }}>
                    <PdfManufacturersWarrantyNotice vehicle={vehicle} />
                  </View>
                </>
              );
            })()}
          </View>
        ) : null}
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
  const valuation = resolveValuation(report);
  const futureValue = resolveFutureValue(report);
  const valuationNote = presentValuationNote(report);
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
        {valuationNote ? (
          <Text style={{ fontSize: 7, color: GREY, marginTop: 4, lineHeight: 1.35 }}>
            {valuationNote}
          </Text>
        ) : null}
      </View>

      {showFutureValue ? (
        <View style={[styles.section, { marginTop: 10 }]}>
          <Text style={styles.sectionTitle}>Future Value Forecast</Text>
          <Text style={{ fontSize: 7, color: GREY, marginTop: 2 }}>
            Based on {futureValue.yearlyKms.toLocaleString()} km per year
          </Text>
          <Text style={{ fontSize: 7, color: GREY, marginTop: 4, lineHeight: 1.35 }}>
            {futureValueForecastNote(report)}
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
                    <Text
                      style={{
                        fontSize: PDF_REPORT_METRIC,
                        color: GREY,
                        marginTop: 2,
                        fontFamily: "Helvetica",
                      }}
                    >
                      {point.odometer.toLocaleString()} km
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

    </>
  );
}

function PdfOdometerHistoryTable({ report }: { report: VehicleReport }) {
  const history = report.vehicle.odometerHistory ?? [];
  if (!hasOdometerHistory(report.vehicle)) return null;
  const purchaseLine = readingAtPurchaseOfReportDetail(report.vehicle);

  return (
    <View style={{ marginTop: 8 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <Text style={[styles.sectionTitle, { fontSize: 8, flex: 1 }]}>
          Odometer history
        </Text>
        <Text
          style={{
            fontSize: 6.5,
            fontFamily: "Helvetica-Bold",
            color: BLUE,
            textTransform: "uppercase",
            marginBottom: 2,
          }}
        >
          {odometerHistoryCountLabel(history.length)}
        </Text>
      </View>
      <View style={styles.pdfTableWrap}>
        <View style={styles.pdfTableHeadRow}>
          <Text style={[styles.pdfTableHeadCell, { width: "28%" }]}>Date</Text>
          <Text style={[styles.pdfTableHeadCell, { width: "32%" }]}>Odometer</Text>
          <Text style={[styles.pdfTableHeadCell, { width: "40%" }]}>Source</Text>
        </View>
        {history.map((entry, index) => (
          <View
            key={`${entry.date}-${entry.odometer}-${index}`}
            style={[
              styles.pdfTableBodyRow,
              index === history.length - 1 ? styles.pdfTableBodyRowLast : {},
              {
                backgroundColor: index % 2 === 1 ? TABLE_ROW_SHADE : "#ffffff",
              },
            ]}
          >
            <Text style={[styles.pdfTableCellBold, { width: "28%" }]}>
              {formatExpiryDate(entry.date)}
            </Text>
            <Text
              style={[
                styles.reportCurrency,
                styles.pdfTableCellBold,
                { width: "32%" },
              ]}
            >
              {entry.odometer.toLocaleString()} km
            </Text>
            <Text style={[styles.pdfTableCell, { width: "40%" }]}>
              {entry.source?.trim() || "—"}
            </Text>
          </View>
        ))}
      </View>
      <Text style={{ marginTop: 4, fontSize: 6.5, color: GREY, lineHeight: 1.35 }}>
        {ODOMETER_HISTORY_LISTING_LINE}
      </Text>
      {purchaseLine ? (
        <Text style={{ marginTop: 2, fontSize: 6.5, color: GREY, lineHeight: 1.35 }}>
          {purchaseLine}
        </Text>
      ) : null}
    </View>
  );
}

function PdfComparableVehiclesTable({ report }: { report: VehicleReport }) {
  const listings = report.market.comparableListings.slice(0, MAX_COMPARABLE_ROWS);
  if (listings.length === 0) return null;
  const showDaysListed =
    !report.id.startsWith("SAMPLE-") &&
    comparableListingsShowDaysListed(listings);
  const colVehicle = showDaysListed ? "38%" : "42%";
  const colPrice = showDaysListed ? "14%" : "16%";
  const colOdometer = showDaysListed ? "16%" : "18%";
  const colLocation = showDaysListed ? "22%" : "24%";
  return (
    <View style={{ marginTop: 8 }}>
      <Text style={[styles.sectionTitle, { fontSize: 8 }]}>
        Comparable vehicles for sale
      </Text>
      <View style={styles.pdfTableWrap}>
        <View style={styles.pdfTableHeadRow}>
          <Text style={[styles.pdfTableHeadCell, { width: colVehicle }]}>Vehicle</Text>
          <Text style={[styles.pdfTableHeadCell, { width: colPrice }]}>Price</Text>
          <Text style={[styles.pdfTableHeadCell, { width: colOdometer }]}>Odometer</Text>
          <Text style={[styles.pdfTableHeadCell, { width: colLocation }]}>Location</Text>
          {showDaysListed ? (
            <Text style={[styles.pdfTableHeadCell, { width: "10%" }]}>Listed</Text>
          ) : null}
        </View>
        {listings.map((listing, index) => (
          <View
            key={`${listing.title}-${index}`}
            style={[
              styles.pdfTableBodyRow,
              index === listings.length - 1 ? styles.pdfTableBodyRowLast : {},
              {
                backgroundColor: index % 2 === 1 ? TABLE_ROW_SHADE : "#ffffff",
              },
            ]}
          >
            <Text style={[styles.pdfTableCell, { width: colVehicle, color: "#0f172a" }]}>
              {listing.title}
            </Text>
            <Text style={[styles.reportCurrency, { width: colPrice, paddingVertical: PDF_TABLE_PAD_V, paddingHorizontal: PDF_TABLE_PAD_H }]}>
              {money(listing.price)}
            </Text>
            <Text style={[styles.reportMetric, styles.pdfTableCell, { width: colOdometer }]}>
              {listing.odometer.toLocaleString()} km
            </Text>
            <Text style={[styles.pdfTableCell, { width: colLocation }]}>
              {listing.location}
            </Text>
            {showDaysListed ? (
              <Text style={[styles.pdfTableCell, { width: "10%" }]}>
                {listing.daysListed}d
              </Text>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

/** Page 2 — present (+ future for Insights+) valuations, P-plate, ride share, comparables. */
function PdfValuationsPage({
  report,
  pageLabel,
}: {
  report: VehicleReport;
  pageLabel: string;
}) {
  const showFutureValue = hasDamageAnalysis(resolveReportTier(report.tier));
  return (
    <PdfPageShell report={report} pageLabel={pageLabel}>
      <View style={styles.body}>
        <PdfPresentAndFutureValuations
          report={report}
          showFutureValue={showFutureValue}
        />
        <PdfOdometerHistoryTable report={report} />
        <PdfComparableVehiclesTable report={report} />
      </View>
    </PdfPageShell>
  );
}

function PdfValuationSupplementsPage({
  report,
  pageLabel,
}: {
  report: VehicleReport;
  pageLabel: string;
}) {
  return (
    <PdfPageShell report={report} pageLabel={pageLabel}>
      <View style={styles.body}>
        <PdfPPlateSupplementContent report={report} />
        <PdfRideShareSupplementContent />
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
            <View style={styles.specSheetTableWrap}>
              {visibleSpecDataRows(sheet.dataRows).map((row, rowIndex, rows) => {
                const powerRow = isPowerToWeightSpecRow(row.label);
                const isLast = rowIndex === rows.length - 1;
                return (
                  <View
                    key={row.label}
                    style={[
                      styles.specSheetRow,
                      isLast ? { borderBottomWidth: 0 } : {},
                    ]}
                  >
                    <View style={styles.specSheetLabelCell}>
                      <Text
                        style={[
                          styles.specSheetLabel,
                          powerRow
                            ? { color: BLUE, fontFamily: "Helvetica-Bold" }
                            : {},
                        ]}
                      >
                        {row.label}
                        {powerRow ? "*" : ""}
                      </Text>
                    </View>
                    <View style={styles.specSheetValueCell}>
                      <Text
                        style={[
                          styles.specSheetValue,
                          powerRow ? { color: BLUE } : {},
                        ]}
                      >
                        {row.value}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
            {shouldShowPowerToWeightFootnote(sheet.dataRows) ? (
              <Text
                style={{
                  marginTop: 4,
                  fontSize: 6.5,
                  lineHeight: 1.4,
                  color: BLUE,
                  fontFamily: "Helvetica",
                }}
              >
                {P_PLATE_POWER_TO_WEIGHT_FOOTNOTE}
              </Text>
            ) : null}
          </View>

          <View style={[styles.section, { marginTop: 14 }]}>
            <Text style={[styles.sectionTitle, { lineHeight: 1.35, paddingBottom: 4 }]}>
              Factory features &amp; options
            </Text>
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
            <Text style={[styles.sectionTitle, { marginTop: 12 }]}>
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
        <Text style={styles.title}>{CAR_BUYING_CHECKLIST_TITLE}</Text>
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
                borderWidth: PDF_BORDER_OUTER,
                borderColor: BORDER_SLATE_200,
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

function PdfGeneralDisclaimer() {
  const [terms, ...rest] = REPORT_GENERAL_DISCLAIMER_PARAGRAPHS;
  return (
    <View
      style={{
        marginTop: 12,
        paddingTop: 8,
        borderTopWidth: PDF_BORDER_INNER,
        borderTopColor: BORDER_SLATE_200,
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
  photoImageHeight = 64,
  photoObjectFit = "cover",
}: {
  title: string;
  photos: InspectionPhoto[];
  note?: string;
  photoImageHeight?: number;
  photoObjectFit?: "cover" | "contain";
}) {
  if (photos.length === 0) return null;
  const hasRecordOnlyPhoto = photos.some((photo) =>
    isRecordOnlyInspectionPhoto(photo.angle),
  );
  return (
    <View style={[styles.section, { marginTop: 10 }]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {note ? (
        <Text style={[styles.para, { marginTop: 2, fontSize: 6.5 }]}>{note}</Text>
      ) : null}
      <View style={styles.photoGrid}>
        {chunkFactoryFeatures(photos, 4).map((row, rowIndex) => (
          <View key={rowIndex} style={styles.photoRow} wrap={false}>
            {row.map((photo, i) => {
              const url = resolvePdfImageSrc(getInspectionPhotoUrl(photo));
              const evidenceLines = formatInspectionPhotoEvidenceLines(photo);
              const baseLabel = formatInspectionPhotoTileLabel(
                photo.label,
                photo.angle,
              );
              const label =
                photo.angle === "front"
                  ? `${baseLabel} (rego visible)`
                  : baseLabel;
              return (
                <View
                  key={`${photo.angle}-${photo.uploadedAt}`}
                  style={[
                    styles.photoTile,
                    i === row.length - 1 ? { marginRight: 0 } : {},
                  ]}
                >
                  {url ? (
                    <Image
                      src={url}
                      style={[
                        styles.photoImage,
                        {
                          height: photoImageHeight,
                          objectFit: photoObjectFit,
                        },
                      ]}
                    />
                  ) : (
                    <View
                      style={[
                        styles.photoImage,
                        { height: photoImageHeight, backgroundColor: LIGHT },
                      ]}
                    />
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
        ))}
      </View>
      {hasRecordOnlyPhoto ? (
        <Text
          style={[
            styles.photoEvidenceCaption,
            {
              marginTop: 6,
              marginBottom: 4,
              width: "100%",
              textAlign: "left",
            },
          ]}
        >
          {INSPECTION_RECORD_ONLY_FOOTNOTE_WITH_STAR}
        </Text>
      ) : null}
    </View>
  );
}

function InsightsPlusWalkaroundPhotosPage({
  report,
  photos,
  pageLabel,
}: {
  report: VehicleReport;
  photos: InspectionPhoto[];
  pageLabel: string;
}) {
  const { vehicle, damage } = report;
  const vehicleTitle = `${vehicle.make} ${vehicle.model} ${vehicle.variant} ${vehicle.year}`.trim();
  const walkaroundPhotos = photos.filter((photo) =>
    isExteriorInspectionAngle(photo.angle),
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
          photoImageHeight={72}
          photoObjectFit="contain"
        />
      </View>
    </PdfPageShell>
  );
}

function InsightsPlusAdditionalPhotosPage({
  report,
  photos,
  pageLabel,
}: {
  report: VehicleReport;
  photos: InspectionPhoto[];
  pageLabel: string;
}) {
  const { vehicle } = report;
  const vehicleTitle = `${vehicle.make} ${vehicle.model} ${vehicle.variant} ${vehicle.year}`.trim();
  const additionalPhotos = photos.filter(
    (photo) => !isExteriorInspectionAngle(photo.angle),
  );
  if (additionalPhotos.length === 0) return null;

  return (
    <PdfPageShell report={report} pageLabel={pageLabel}>
      <View style={styles.body}>
        <Text style={[styles.para, { fontSize: 8, color: GREY }]}>
          Auto Verifi Insights+ · {vehicleTitle}
        </Text>
        <PdfPhotoGroup
          title="Additional Photos"
          photos={additionalPhotos}
          note="Wheels, interior, odometer, keys, and supporting records from the guided inspection."
          photoImageHeight={92}
          photoObjectFit="contain"
        />
      </View>
    </PdfPageShell>
  );
}

function InsightsPlusDamagePage({
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

  return (
    <PdfPageShell report={report} pageLabel={pageLabel}>
      <View style={styles.body}>
        <Text style={[styles.para, { fontSize: 8, color: GREY }]}>
          Auto Verifi Insights+ · {vehicleTitle}
        </Text>
        <Text style={[styles.sectionTitle, { marginTop: 4 }]}>Detected Damage</Text>

        {damage && damage.findings.length === 0 && photos.length > 0 ? (
          <Text style={[styles.para, { marginTop: 6, color: RIDE_SHARE_GREEN }]}>
            No visible damage detected in the AI analysis.
          </Text>
        ) : null}

        {damage && damage.findings.length > 0 ? (
          <View style={styles.section}>
            {chunkFactoryFeatures(damage.findings, 2).map((row, rowIndex) => (
              <View
                key={rowIndex}
                style={{ flexDirection: "row", alignItems: "stretch" }}
                wrap={false}
              >
                {row.map((f, i) => {
                  const damageImageUrl = resolvePdfImageSrc(
                    resolveDamageFindingImageUrl(f, photos),
                  );
                  return (
                    <View
                      key={`${rowIndex}-${i}`}
                      style={[
                        styles.damageCard,
                        i === row.length - 1 ? { marginRight: 0 } : {},
                      ]}
                    >
                      {damageImageUrl ? (
                        <Image src={damageImageUrl} style={styles.photoImage} />
                      ) : null}
                      <Text
                        style={{
                          marginTop: 4,
                          fontFamily: "Helvetica-Bold",
                          fontSize: 8.5,
                        }}
                      >
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
            ))}
          </View>
        ) : !damage ? (
          <Text style={[styles.para, { marginTop: 8 }]}>
            AI damage analysis will appear on this page once processing is complete.
          </Text>
        ) : null}

        {trailing}
      </View>
    </PdfPageShell>
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
  const hasAdditionalInspectionPhotos = photos.some(
    (photo) => !isExteriorInspectionAngle(photo.angle),
  );
  const insightsPlusPageCount = isPlus
    ? 2 + (hasAdditionalInspectionPhotos ? 1 : 0)
    : 0;
  const keyInsights = buildKeyInsights(report);
  const totalPages =
    1 + // Overview + all key insights + warranty
    2 + // Valuations + market; P-plate & ride-share
    specPageCount +
    insightsPlusPageCount +
    1; // Car buying checklist + general disclaimer (PPSR PDF merged after)
  let pageNumber = 1;
  const nextPageLabel = () => `${pageNumber++} / ${totalPages}`;
  const introLeadLabel = nextPageLabel();
  const valuationsLabel = nextPageLabel();
  const supplementsLabel = nextPageLabel();
  const specPageLabels = Array.from({ length: specPageCount }, () =>
    nextPageLabel(),
  );

  return (
    <Document title={`Auto Verifi Report ${report.id}`}>
      <CarInsightsIntroLeadPage
        report={report}
        insights={keyInsights}
        pageLabel={introLeadLabel}
        includeWarranty
      />
      <PdfValuationsPage report={report} pageLabel={valuationsLabel} />
      <PdfValuationSupplementsPage
        report={report}
        pageLabel={supplementsLabel}
      />
      {includeSpec && report.vehicleSpec ? (
        <VehicleSpecPages report={report} pageLabels={specPageLabels} />
      ) : null}
      {isPlus ? (
        <>
          <InsightsPlusWalkaroundPhotosPage
            report={report}
            photos={photos}
            pageLabel={nextPageLabel()}
          />
          {hasAdditionalInspectionPhotos ? (
            <InsightsPlusAdditionalPhotosPage
              report={report}
              photos={photos}
              pageLabel={nextPageLabel()}
            />
          ) : null}
          <InsightsPlusDamagePage
            report={report}
            photos={photos}
            pageLabel={nextPageLabel()}
          />
        </>
      ) : null}
      <CarBuyingChecklistPage
        report={report}
        pageLabel={nextPageLabel()}
        trailing={<PdfGeneralDisclaimer />}
      />
    </Document>
  );
}
