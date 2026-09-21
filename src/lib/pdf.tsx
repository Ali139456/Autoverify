import React from "react";
import path from "path";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import {
  buildKeyInsights,
  buildStatusChecks,
  formatReportDate,
  futureValueConfidenceLabel,
  getFutureValueAtYears,
  getInspectionPhotoUrl,
  resolveFutureValue,
} from "./report-design";
import {
  PdfCheckIcon,
  PdfInsightIcon,
  PdfSpecIcon,
  PdfStatusBadge,
} from "./report-pdf-icons";
import { hasDamageAnalysis } from "./pricing";
import { VehicleReport } from "./types";
import type { InspectionPhoto } from "./types";

const BLUE = "#0073E3";
const GREY = "#64748b";
const LIGHT = "#f8fafc";
const LOGO_WHITE = path.join(process.cwd(), "public/logo/logo-inverse.png");
const LOGO_BLUE = path.join(process.cwd(), "public/logo/logo-blue-on-white.png");
const HERO_CAR = path.join(process.cwd(), "public/hero-car.png");

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontSize: 8.5,
    fontFamily: "Helvetica",
    color: "#1e293b",
    backgroundColor: "#ffffff",
  },
  header: {
    backgroundColor: BLUE,
    paddingHorizontal: 32,
    paddingVertical: 22,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  logoWhite: { width: 150, height: 32 },
  headerMeta: {
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255,255,255,0.35)",
    paddingLeft: 14,
    textAlign: "right",
    color: "#ffffff",
    fontSize: 7.5,
    lineHeight: 1.55,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
  },
  body: { paddingHorizontal: 32, paddingTop: 22, paddingBottom: 48 },
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
  statusImageWrap: { width: "42%", position: "relative" },
  statusImage: { width: "100%", height: "100%", objectFit: "cover" },
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
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    padding: 8,
    minHeight: 58,
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 4,
  },
  insightStatusRow: { flexDirection: "row", alignItems: "center", gap: 3, flex: 1 },
  insightStatus: { fontSize: 7.5, fontFamily: "Helvetica-Bold", flex: 1 },
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
  footerLogo: { width: 90, height: 18 },
  footerText: { fontSize: 7, color: GREY, textTransform: "uppercase" },
});

const money = (n: number) => `$${n.toLocaleString("en-AU")}`;

function toneStyle(tone: string) {
  if (tone === "clear") return styles.clear;
  if (tone === "warn") return styles.warn;
  if (tone === "info") return styles.info;
  return styles.neutral;
}

function ReportHeader({ report }: { report: VehicleReport }) {
  return (
    <View style={styles.header}>
      <View>
        <Image src={LOGO_WHITE} style={styles.logoWhite} />
        <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 6.5, marginTop: 3 }}>
          Past | Present | Future
        </Text>
      </View>
      <View style={styles.headerMeta}>
        <Text>Generated: {formatReportDate(report.createdAt)}</Text>
        <Text>Autoverifi.com.au</Text>
      </View>
    </View>
  );
}

function ReportFooter({ pageLabel }: { pageLabel: string }) {
  return (
    <View style={styles.footer} fixed>
      <Image src={LOGO_BLUE} style={styles.footerLogo} />
      <Text style={styles.footerText}>— Autoverifi.com.au | {pageLabel}</Text>
    </View>
  );
}

function CarInsightsPage({
  report,
  pageLabel,
  showUpgrade,
}: {
  report: VehicleReport;
  pageLabel: string;
  showUpgrade: boolean;
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
  const insights = buildKeyInsights(report);
  const vehicleTitle = `${vehicle.make} ${vehicle.model} ${vehicle.variant} ${vehicle.year}`.trim();

  return (
    <Page size="A4" style={styles.page}>
      <ReportHeader report={report} />
      <View style={styles.body}>
        <Text style={styles.title}>Auto Verifi – Car Insights Report</Text>
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
              <Text style={styles.specValue}>{s.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.statusPanel}>
          <View style={styles.statusLeft}>
            <Text style={styles.statusTitle}>Vehicle Status</Text>
            {statusChecks.map((item) => (
              <View key={item.label} style={styles.statusRow}>
                <PdfCheckIcon ok={item.ok} />
                <Text style={styles.statusText}>{item.label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.statusImageWrap}>
            <Image src={HERO_CAR} style={styles.statusImage} />
          </View>
        </View>

        <View style={styles.insightsHeader}>
          <Text style={styles.sectionLabel}>Key Insights</Text>
          <Text style={styles.sectionLabelAccent}>All the essentials. In one place.</Text>
        </View>
        <View style={styles.insightGrid}>
          {insights.map((insight) => (
            <View key={insight.id} style={styles.insightCard}>
              <View style={styles.insightTop}>
                <PdfInsightIcon insightId={insight.id} />
                <Text style={styles.insightTitle}>{insight.title}</Text>
              </View>
              <View style={styles.insightBottom}>
                <View style={styles.insightStatusRow}>
                  <PdfStatusBadge tone={insight.tone} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.insightStatus, toneStyle(insight.tone)]}>
                      {insight.status}
                    </Text>
                    {insight.statusSubtext ? (
                      <Text
                        style={[
                          styles.insightStatus,
                          insight.id === "registration"
                            ? toneStyle(insight.tone)
                            : { color: GREY, fontFamily: "Helvetica" },
                          { marginTop: 2, fontSize: 8 },
                        ]}
                      >
                        {insight.statusSubtext}
                      </Text>
                    ) : null}
                  </View>
                </View>
                <Text style={{ fontSize: 9, color: "#cbd5e1" }}>{">"}</Text>
              </View>
            </View>
          ))}
        </View>

        {showUpgrade ? (
          <View style={styles.upgradeBox}>
            <PdfInsightIcon insightId="ppsr" size={16} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: "#0f172a" }}>
                Upgrade to Auto Verifi Insights+ for AI powered damage detection and
                more insights.
              </Text>
              <Text style={{ marginTop: 3, fontSize: 7.5, color: GREY }}>
                Get detailed condition analysis, image-based damage detection, variant
                verification and market valuation.
              </Text>
            </View>
            <Text style={styles.upgradeButton}>View Upgrade Options  →</Text>
          </View>
        ) : null}
      </View>
      <ReportFooter pageLabel={pageLabel} />
    </Page>
  );
}

function DetailsPage({
  report,
  pageLabel,
}: {
  report: VehicleReport;
  pageLabel: string;
}) {
  const { market, ai, valuation } = report;
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
      <View style={styles.body}>
        <View style={styles.section}>
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

        <View style={styles.section}>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comparable Vehicles For Sale</Text>
          <View style={styles.tableHead}>
            <Text style={{ width: "42%" }}>Vehicle</Text>
            <Text style={{ width: "15%" }}>Price</Text>
            <Text style={{ width: "18%" }}>Odometer</Text>
            <Text style={{ width: "15%" }}>Location</Text>
            <Text style={{ width: "10%" }}>Listed</Text>
          </View>
          {market.comparableListings.map((l, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={{ width: "42%" }}>{l.title}</Text>
              <Text style={{ width: "15%" }}>{money(l.price)}</Text>
              <Text style={{ width: "18%" }}>{l.odometer.toLocaleString()} km</Text>
              <Text style={{ width: "15%" }}>{l.location}</Text>
              <Text style={{ width: "10%" }}>{l.daysListed}d</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            AI Risk Assessment — {ai.riskLabel} ({ai.riskScore}/100)
          </Text>
          <Text style={[styles.para, { marginBottom: 6 }]}>{ai.summary}</Text>
          {ai.riskFactors.map((f, i) => (
            <Text key={i} style={styles.para}>
              • {f}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendation</Text>
          <Text style={styles.para}>{ai.buyRecommendation}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.para, { fontSize: 7, color: GREY }]}>
            Disclaimer: This report is compiled from third-party data sources and AI
            models at the time of generation. Auto Verifi does not guarantee the
            accuracy or completeness of the information. Always conduct an
            independent inspection and official PPSR search before purchasing.
          </Text>
        </View>
      </View>
      <ReportFooter pageLabel={pageLabel} />
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
              {damage.findings.length > 0
                ? ` · Total estimated repair ${money(damage.totalRepairEstimate)}`
                : " · No visible damage detected"}
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
              {photos.slice(0, 9).map((photo) => {
                const url = getInspectionPhotoUrl(photo);
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
              {damage.findings.map((f, i) => (
                <View key={i} style={styles.damageCard}>
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
                  <Text style={{ marginTop: 3, fontSize: 8 }}>
                    Est. repair {money(f.repairEstimate)} ·{" "}
                    {Math.round(f.confidence * 100)}% confidence
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
      <ReportFooter pageLabel={pageLabel} />
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
  const totalPages = isPlus ? 3 : 2;

  return (
    <Document title={`Auto Verifi Report ${report.id}`}>
      <CarInsightsPage
        report={report}
        pageLabel={`1 / ${totalPages}`}
        showUpgrade={!isPlus}
      />
      <DetailsPage report={report} pageLabel={`2 / ${totalPages}`} />
      {isPlus && (
        <InsightsPlusPage
          report={report}
          photos={photos}
          pageLabel={`3 / ${totalPages}`}
        />
      )}
    </Document>
  );
}
