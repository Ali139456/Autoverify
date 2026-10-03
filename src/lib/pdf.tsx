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
import { hasVehicleSpecContent } from "./vehicle-spec-sheet";
import {
  buildKeyInsights,
  buildStatusChecks,
  formatReportDate,
  formatReportReference,
  futureValueConfidenceLabel,
  getFutureValueAtYears,
  getInspectionPhotoUrl,
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
import { hasDamageAnalysis, resolveReportTier } from "./pricing";
import { VEHICLE_HERO_IMAGE_DISCLAIMER } from "./vehicle-hero-image";
import { VehicleReport } from "./types";
import type { InspectionPhoto } from "./types";

const BLUE = "#0073E3";
const GREY = "#64748b";
const LIGHT = "#f8fafc";
const LOGO_BLUE = path.join(process.cwd(), "public/logo/logo-blue-on-white.png");

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontSize: 8.5,
    fontFamily: "Helvetica",
    color: "#1e293b",
    backgroundColor: "#ffffff",
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
  logoHeader: { width: 184, height: 34, objectFit: "contain" },
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
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    backgroundColor: LIGHT,
    overflow: "hidden",
  },
  specItem: {
    width: "16.66%",
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
    minHeight: 150,
  },
  statusLeft: {
    width: "58%",
    padding: 14,
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
  },
  statusImageWrap: { width: "42%", position: "relative", minHeight: 150 },
  statusImage: { width: "100%", height: "100%", objectFit: "cover" },
  statusImageContain: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    backgroundColor: "#0f172a",
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
  statusTitle: {
    fontSize: 7,
    color: GREY,
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
    backgroundColor: LIGHT,
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
  photoGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  photoTile: {
    width: "31%",
    marginRight: "2%",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    overflow: "hidden",
  },
  photoImage: { width: "100%", height: 90, objectFit: "cover" },
  photoCaption: {
    padding: 5,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
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
  footer: {
    position: "absolute",
    bottom: 16,
    left: 32,
    right: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
  },
  footerLogo: { width: 132, height: 28, objectFit: "contain" },
  footerText: { fontSize: 7, color: GREY, textTransform: "uppercase" },
});

const money = (n: number) => `$${n.toLocaleString("en-AU")}`;

const MAX_COMPARABLE_ROWS = 7;

/** Factory options on the first spec page (right column beside vehicle data). */
const SPEC_FEATURES_FIRST_PAGE = 14;
/** Factory options per continuation page (full width). */
const SPEC_FEATURES_CONTINUATION = 40;

function countVehicleSpecPdfPages(
  sheet: NonNullable<VehicleReport["vehicleSpec"]>,
): number {
  const featureCount = sheet.factoryFeatures.length;
  if (featureCount <= SPEC_FEATURES_FIRST_PAGE) return 1;
  const remainder = featureCount - SPEC_FEATURES_FIRST_PAGE;
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

function ReportFooter({
  pageLabel,
  reportReference,
}: {
  pageLabel: string;
  reportReference: string;
}) {
  return (
    <View style={styles.footer} fixed>
      <Image src={LOGO_BLUE} style={styles.footerLogo} />
      <Text style={styles.footerText}>
        {reportReference} · Autoverifi.com.au | {pageLabel}
      </Text>
    </View>
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
              <View style={styles.insightStatusRow}>
                <PdfStatusBadge tone={insight.tone} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.insightStatus, toneStyle(insight.tone)]}>
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
                  {footnote ? (
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
}: {
  vehicle: VehicleReport["vehicle"];
  vehicleTitle: string;
}) {
  const heroSrc = resolvePdfImageSrc(vehicle.heroImageUrl);
  const useContain =
    vehicle.heroImageKind === "stock" ||
    vehicle.heroImageKind === "generated" ||
    Boolean(vehicle.heroImageUrl?.includes("/sample/"));

  return (
    <View style={styles.statusImageWrap}>
      {heroSrc ? (
        <>
          <Image
            src={heroSrc}
            style={useContain ? styles.statusImageContain : styles.statusImage}
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

function CarInsightsOverviewPage({
  report,
  pageLabel,
}: {
  report: VehicleReport;
  pageLabel: string;
}) {
  const { vehicle } = report;
  const specs = [
    { label: "Make", value: vehicle.make },
    { label: "Model", value: vehicle.model },
    { label: "Badge", value: vehicle.variant || "—" },
    { label: "Year", value: String(vehicle.year) },
    { label: "VIN", value: vehicle.vin || "—" },
    {
      label: "Odometer",
      value: vehicle.odometer ? `${vehicle.odometer.toLocaleString()} km` : "—",
    },
  ];
  const statusChecks = buildStatusChecks(report);
  const vehicleTitle = `${vehicle.make} ${vehicle.model} ${vehicle.variant} ${vehicle.year}`.trim();

  return (
    <Page size="A4" style={styles.page}>
      <ReportHeader report={report} />
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
                <PdfCheckIcon ok={item.ok} issue={item.issue} muted={item.muted} />
                <Text
                  style={{
                    ...styles.statusText,
                    color: item.issue ? "#dc2626" : item.muted ? "#94a3b8" : styles.statusText.color,
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
      <ReportFooter
        pageLabel={pageLabel}
        reportReference={formatReportReference(report.vehicle)}
      />
    </Page>
  );
}

function CarInsightsInsightsAndDetailsPage({
  report,
  pageLabel,
  showUpgrade,
}: {
  report: VehicleReport;
  pageLabel: string;
  showUpgrade: boolean;
}) {
  const { vehicle, market, valuation } = report;
  const insights = buildKeyInsights(report);
  const vehicleTitle = `${vehicle.make} ${vehicle.model} ${vehicle.variant} ${vehicle.year}`.trim();
  const showFutureValue = hasDamageAnalysis(resolveReportTier(report.tier));
  const futureValue = resolveFutureValue(report);
  const futureHorizons = [
    { label: "Today", years: 0 },
    { label: "+1 year", years: 1 },
    { label: "+3 years", years: 3 },
    { label: "+5 years", years: 5 },
  ];

  return (
    <Page size="A4" style={styles.page}>
      <ReportHeader report={report} />
      <View style={[styles.body, { paddingBottom: 48 }]}>
        <View style={[styles.insightsHeader, { marginTop: 4 }]}>
          <Text style={styles.sectionLabel}>Key Insights</Text>
          <Text style={styles.sectionLabelAccent}>All the essentials. In one place.</Text>
        </View>
        <Text style={[styles.subtitle, { marginTop: 4 }]}>Key insights — {vehicleTitle}</Text>
        <PdfInsightGrid insights={insights} />

        <View style={[styles.section, { marginTop: 10 }]}>
          <Text style={styles.sectionTitle}>
            Present Value — Market Valuation ({valuation.confidence} confidence)
          </Text>
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
            <Text style={styles.sectionTitle}>
              Future Value Forecast ({futureValueConfidenceLabel(futureValue)}{" "}
              confidence · {futureValue.yearlyKms.toLocaleString()} km/yr)
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
      </View>
      <ReportFooter
        pageLabel={pageLabel}
        reportReference={formatReportReference(report.vehicle)}
      />
    </Page>
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
}: {
  report: VehicleReport;
  pageLabels: string[];
}) {
  const sheet = report.vehicleSpec;
  if (!sheet || !hasVehicleSpecContent(sheet)) return null;

  const { vehicle } = report;
  const vehicleTitle =
    `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.variant}`.trim();
  const reportReference = formatReportReference(report.vehicle);
  const firstFeatures = sheet.factoryFeatures.slice(0, SPEC_FEATURES_FIRST_PAGE);
  const continuationChunks = chunkFactoryFeatures(
    sheet.factoryFeatures.slice(SPEC_FEATURES_FIRST_PAGE),
    SPEC_FEATURES_CONTINUATION,
  );

  return (
    <>
      <Page size="A4" style={styles.page}>
        <ReportHeader report={report} />
        <View style={styles.body}>
          <Text style={styles.title}>Vehicle Data &amp; Factory Equipment</Text>
          <Text style={styles.vehicleName}>{vehicleTitle}</Text>
          <Text style={styles.subtitle}>
            Full specification and build options (as returned from data providers).
          </Text>

          <View style={[styles.section, { flexDirection: "row" }]}>
            <View style={{ width: "58%", marginRight: 12 }}>
              <Text style={styles.sectionTitle}>Vehicle data</Text>
              {sheet.dataRows.map((row) => (
                <View key={row.label} style={styles.specSheetRow}>
                  <View style={styles.specSheetLabelCell}>
                    <Text style={styles.specSheetLabel}>{row.label}</Text>
                  </View>
                  <View style={styles.specSheetValueCell}>
                    <Text style={styles.specSheetValue}>{row.value}</Text>
                  </View>
                </View>
              ))}
            </View>
            <View style={{ width: "40%" }}>
              <Text style={styles.sectionTitle}>Factory features &amp; options</Text>
              <FactoryFeatureLines features={firstFeatures} />
            </View>
          </View>
        </View>
        <ReportFooter
          pageLabel={pageLabels[0] ?? ""}
          reportReference={reportReference}
        />
      </Page>
      {continuationChunks.map((chunk, index) => (
        <Page key={`spec-cont-${index}`} size="A4" style={styles.page}>
          <ReportHeader report={report} />
          <View style={styles.body}>
            <Text style={styles.title}>Vehicle Data &amp; Factory Equipment</Text>
            <Text style={styles.subtitle}>
              Factory features &amp; options (continued)
            </Text>
            <FactoryFeatureLines features={chunk} />
          </View>
          <ReportFooter
            pageLabel={pageLabels[index + 1] ?? pageLabels[0] ?? ""}
            reportReference={reportReference}
          />
        </Page>
      ))}
    </>
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
    <Page size="A4" style={styles.page}>
      <ReportHeader report={report} />
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
      <ReportFooter
        pageLabel={pageLabel}
        reportReference={formatReportReference(report.vehicle)}
      />
    </Page>
  );
}

function InsightsPlusPage({
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

  return (
    <Page size="A4" style={styles.page}>
      <ReportHeader report={report} />
      <View style={styles.body}>
        <Text style={styles.title}>Auto Verifi Insights+ Report</Text>
        <Text style={styles.vehicleName}>{vehicleTitle}</Text>
        <View style={styles.plusHeading}>
          <Text style={styles.plusTitle}>Current Body Condition</Text>
          <Text style={styles.plusSub}>AI-Powered Image Analysis</Text>
        </View>

        {damage ? (
          <View style={[styles.section, { marginTop: 12 }]}>
            <Text style={styles.para}>
              Overall condition: {damage.overallCondition} · {damage.analyzedPhotos}{" "}
              photo(s) analyzed
              {damage.findings.length === 0 ? " · No visible damage detected" : ""}
            </Text>
          </View>
        ) : (
          <Text style={[styles.para, { marginTop: 12 }]}>
            Guided walkaround photos and AI damage analysis will appear here once the
            mobile inspection is completed.
          </Text>
        )}

        {photos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Walkaround Photos</Text>
            <View style={styles.photoGrid}>
              {photos.map((photo) => {
                const url = resolvePdfImageSrc(getInspectionPhotoUrl(photo));
                return (
                  <View key={`${photo.angle}-${photo.uploadedAt}`} style={styles.photoTile}>
                    {url ? (
                      <Image src={url} style={styles.photoImage} />
                    ) : (
                      <View style={[styles.photoImage, { backgroundColor: LIGHT }]} />
                    )}
                    <Text style={styles.photoCaption}>{photo.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

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
      </View>
      <ReportFooter
        pageLabel={pageLabel}
        reportReference={formatReportReference(report.vehicle)}
      />
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
    (isPlus ? 1 : 0) +
    (includePpsrIntro ? 1 : 0);
  let pageNumber = 1;
  const nextPageLabel = () => `${pageNumber++} / ${totalPages}`;
  const overviewLabel = nextPageLabel();
  const insightsLabel = nextPageLabel();
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
      />
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
      {includePpsrIntro ? (
        <PpsrCertificateIntroPage
          report={report}
          pageLabel={`${pageNumber++} / ${totalPages}+`}
        />
      ) : null}
    </Document>
  );
}
