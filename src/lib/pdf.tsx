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
  getInspectionPhotoUrl,
} from "./report-design";
import { hasDamageAnalysis } from "./pricing";
import { VehicleReport } from "./types";
import type { InspectionPhoto } from "./types";

const BLUE = "#0073E3";
const GREY = "#64748b";
const LIGHT = "#f8fafc";
const LOGO_WHITE = path.join(process.cwd(), "public/logo/logo-inverse.png");
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
    flexWrap: "wrap",
    backgroundColor: LIGHT,
    borderRadius: 6,
    padding: 10,
  },
  specItem: { width: "16.66%", paddingRight: 4, marginBottom: 4 },
  specLabel: {
    fontSize: 6.5,
    color: GREY,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
  },
  specValue: {
    marginTop: 2,
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  statusBox: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 14,
    backgroundColor: LIGHT,
  },
  statusTitle: {
    fontSize: 7,
    color: GREY,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
  },
  statusRow: { flexDirection: "row", marginBottom: 5, alignItems: "flex-start" },
  statusBullet: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#22c55e",
    marginRight: 6,
    marginTop: 1,
  },
  statusBulletMuted: { backgroundColor: "#cbd5e1" },
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
    minHeight: 52,
  },
  insightTitle: { fontSize: 7, color: GREY },
  insightStatus: { marginTop: 4, fontSize: 8, fontFamily: "Helvetica-Bold" },
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
        <Text>Report ID: {report.id}</Text>
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
}: {
  report: VehicleReport;
  pageLabel: string;
}) {
  const { vehicle, valuation } = report;
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
          {specs.map((s) => (
            <View key={s.label} style={styles.specItem}>
              <Text style={styles.specLabel}>{s.label}</Text>
              <Text style={styles.specValue}>{s.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.statusBox}>
          <Text style={styles.statusTitle}>Vehicle Status</Text>
          {statusChecks.map((item) => (
            <View key={item.label} style={styles.statusRow}>
              <View
                style={[
                  styles.statusBullet,
                  item.ok ? {} : styles.statusBulletMuted,
                ]}
              />
              <Text style={styles.statusText}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.insightsHeader}>
          <Text style={styles.sectionLabel}>Key Insights</Text>
          <Text style={styles.sectionLabelAccent}>All the essentials. In one place.</Text>
        </View>
        <View style={styles.insightGrid}>
          {insights.map((insight) => (
            <View key={insight.id} style={styles.insightCard}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={[styles.insightStatus, toneStyle(insight.tone)]}>
                {insight.status}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Market Valuation ({valuation.confidence} confidence)
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
  const { market, ai } = report;

  return (
    <Page size="A4" style={styles.page}>
      <ReportHeader report={report} />
      <View style={styles.body}>
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
      <CarInsightsPage report={report} pageLabel={`1 / ${totalPages}`} />
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
