import React from "react";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { VehicleReport } from "./types";

const NAVY = "#0a0f1e";
const ACCENT = "#3b82f6";
const GREY = "#64748b";
const LIGHT = "#f1f5f9";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 9, fontFamily: "Helvetica", color: "#1e293b" },
  header: {
    backgroundColor: NAVY,
    margin: -36,
    marginBottom: 18,
    padding: 36,
    paddingBottom: 20,
    paddingTop: 28,
  },
  brand: { color: "#ffffff", fontSize: 20, fontFamily: "Helvetica-Bold" },
  brandAccent: { color: ACCENT },
  headerSub: { color: "#94a3b8", fontSize: 9, marginTop: 4 },
  vehicleTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginTop: 14,
  },
  section: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    borderBottomWidth: 2,
    borderBottomColor: ACCENT,
    paddingBottom: 3,
    marginBottom: 8,
  },
  row: { flexDirection: "row", marginBottom: 3 },
  label: { width: "38%", color: GREY },
  value: { width: "62%", fontFamily: "Helvetica-Bold" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  gridItem: { width: "50%", flexDirection: "row", marginBottom: 3 },
  badgeOk: { color: "#15803d", fontFamily: "Helvetica-Bold" },
  badgeWarn: { color: "#b91c1c", fontFamily: "Helvetica-Bold" },
  valBox: {
    width: "31%",
    backgroundColor: LIGHT,
    borderRadius: 4,
    padding: 8,
    marginRight: "2.3%",
  },
  valLabel: { color: GREY, fontSize: 8 },
  valAmount: { fontSize: 12, fontFamily: "Helvetica-Bold", color: NAVY, marginTop: 2 },
  tableHead: {
    flexDirection: "row",
    backgroundColor: NAVY,
    color: "#ffffff",
    padding: 5,
    fontFamily: "Helvetica-Bold",
  },
  tableRow: {
    flexDirection: "row",
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  para: { lineHeight: 1.5, color: "#334155" },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    color: GREY,
    fontSize: 7,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 6,
  },
});

const money = (n: number) => `$${n.toLocaleString("en-AU")}`;

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function CheckRow({ label, ok, okText, warnText }: { label: string; ok: boolean; okText: string; warnText: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={ok ? styles.badgeOk : styles.badgeWarn}>
        {ok ? okText : warnText}
      </Text>
    </View>
  );
}

export function ReportPdf({ report }: { report: VehicleReport }) {
  const { vehicle, registration, valuation, market, ai, damage } = report;
  const footer = (
    <View style={styles.footer} fixed>
      <Text>Auto Verifi — Vehicle History & AI Valuation Report</Text>
      <Text>
        Report {report.id} · Generated{" "}
        {new Date(report.createdAt).toLocaleDateString("en-AU")}
      </Text>
    </View>
  );

  return (
    <Document title={`Auto Verifi Report ${report.id}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>
            AUTO <Text style={styles.brandAccent}>VERIFI</Text>
          </Text>
          <Text style={styles.headerSub}>
            Vehicle History · Market Valuation · AI Future Insights
          </Text>
          <Text style={styles.vehicleTitle}>
            {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.variant}
          </Text>
          <Text style={styles.headerSub}>
            {vehicle.rego} ({vehicle.state}) · VIN {vehicle.vin}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Details</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}><Text style={styles.label}>Make</Text><Text style={styles.value}>{vehicle.make}</Text></View>
            <View style={styles.gridItem}><Text style={styles.label}>Model</Text><Text style={styles.value}>{vehicle.model}</Text></View>
            <View style={styles.gridItem}><Text style={styles.label}>Variant</Text><Text style={styles.value}>{vehicle.variant || "—"}</Text></View>
            <View style={styles.gridItem}><Text style={styles.label}>Year</Text><Text style={styles.value}>{String(vehicle.year)}</Text></View>
            <View style={styles.gridItem}><Text style={styles.label}>Body</Text><Text style={styles.value}>{vehicle.bodyType || "—"}</Text></View>
            <View style={styles.gridItem}><Text style={styles.label}>Engine</Text><Text style={styles.value}>{vehicle.engine || "—"}</Text></View>
            <View style={styles.gridItem}><Text style={styles.label}>Fuel</Text><Text style={styles.value}>{vehicle.fuelType || "—"}</Text></View>
            <View style={styles.gridItem}><Text style={styles.label}>Transmission</Text><Text style={styles.value}>{vehicle.transmission || "—"}</Text></View>
            <View style={styles.gridItem}><Text style={styles.label}>Colour</Text><Text style={styles.value}>{vehicle.colour || "—"}</Text></View>
            <View style={styles.gridItem}><Text style={styles.label}>Odometer</Text><Text style={styles.value}>{vehicle.odometer ? `${vehicle.odometer.toLocaleString()} km` : "—"}</Text></View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Registration & PPSR Checks</Text>
          <Row label="Registration status" value={registration.status} />
          <Row label="Registration expiry" value={registration.expiryDate ?? "—"} />
          <CheckRow label="Stolen check" ok={!registration.stolen} okText="No stolen record found" warnText="STOLEN RECORD FOUND" />
          <CheckRow label="Write-off check" ok={!registration.writtenOff} okText="No write-off record found" warnText={registration.writeOffDetails ?? "WRITE-OFF RECORDED"} />
          <CheckRow label="Finance / PPSR" ok={!registration.financeOwing} okText="No security interests found" warnText={registration.financeDetails ?? "FINANCE OWING"} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Current Market Valuation ({valuation.confidence} confidence)
          </Text>
          <View style={{ flexDirection: "row" }}>
            <View style={styles.valBox}>
              <Text style={styles.valLabel}>Trade-in range</Text>
              <Text style={styles.valAmount}>{money(valuation.tradeLow)} – {money(valuation.tradeHigh)}</Text>
            </View>
            <View style={styles.valBox}>
              <Text style={styles.valLabel}>Private sale range</Text>
              <Text style={styles.valAmount}>{money(valuation.privateLow)} – {money(valuation.privateHigh)}</Text>
            </View>
            <View style={styles.valBox}>
              <Text style={styles.valLabel}>Dealer retail range</Text>
              <Text style={styles.valAmount}>{money(valuation.retailLow)} – {money(valuation.retailHigh)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Market Snapshot</Text>
          <Row label="Average listed price" value={money(market.averagePrice)} />
          <Row label="Median listed price" value={money(market.medianPrice)} />
          <Row label="Active comparable listings" value={String(market.activeListings)} />
          <Row label="Average days on market" value={`${market.averageDaysOnMarket} days`} />
        </View>
        {footer}
      </Page>

      <Page size="A4" style={styles.page}>
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
            AI Future Insights — {ai.riskLabel} (score {ai.riskScore}/100)
          </Text>
          <Text style={[styles.para, { marginBottom: 6 }]}>{ai.summary}</Text>
          {ai.riskFactors.map((f, i) => (
            <Text key={i} style={styles.para}>• {f}</Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5-Year Depreciation Forecast</Text>
          <View style={styles.tableHead}>
            <Text style={{ width: "50%" }}>Year</Text>
            <Text style={{ width: "50%" }}>Predicted value</Text>
          </View>
          {ai.depreciationForecast.map((d) => (
            <View key={d.year} style={styles.tableRow}>
              <Text style={{ width: "50%" }}>{d.year}</Text>
              <Text style={{ width: "50%" }}>{money(d.predictedValue)}</Text>
            </View>
          ))}
          <Text style={[styles.para, { marginTop: 6 }]}>
            Projected 3-year residual value: {money(ai.residualValue3yr)}
          </Text>
        </View>

        {damage && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              AI Photo Damage Analysis — Overall condition: {damage.overallCondition}
            </Text>
            {damage.findings.length === 0 ? (
              <Text style={styles.badgeOk}>
                No visible damage detected across {damage.analyzedPhotos} photo(s).
              </Text>
            ) : (
              <>
                <View style={styles.tableHead}>
                  <Text style={{ width: "30%" }}>Panel</Text>
                  <Text style={{ width: "22%" }}>Type</Text>
                  <Text style={{ width: "18%" }}>Severity</Text>
                  <Text style={{ width: "15%" }}>Confidence</Text>
                  <Text style={{ width: "15%" }}>Est. repair</Text>
                </View>
                {damage.findings.map((f, i) => (
                  <View key={i} style={styles.tableRow}>
                    <Text style={{ width: "30%" }}>{f.panel}</Text>
                    <Text style={{ width: "22%" }}>{f.type}</Text>
                    <Text style={{ width: "18%" }}>{f.severity}</Text>
                    <Text style={{ width: "15%" }}>{Math.round(f.confidence * 100)}%</Text>
                    <Text style={{ width: "15%" }}>{money(f.repairEstimate)}</Text>
                  </View>
                ))}
                <Text style={[styles.para, { marginTop: 6 }]}>
                  Total estimated repair cost: {money(damage.totalRepairEstimate)}
                </Text>
              </>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendation</Text>
          <Text style={styles.para}>{ai.buyRecommendation}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.para, { fontSize: 7, color: GREY }]}>
            Disclaimer: This report is compiled from third-party data sources and
            AI models at the time of generation. Auto Verifi does not guarantee
            the accuracy or completeness of the information and it should not be
            the sole basis of a purchase decision. Always conduct an independent
            inspection and official PPSR search before purchasing a vehicle.
          </Text>
        </View>
        {footer}
      </Page>
    </Document>
  );
}
