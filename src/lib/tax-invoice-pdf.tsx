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
import { getCompanyDetails } from "./company";
import { getReportTierConfig, resolveReportTier } from "./pricing";
import type { VehicleReport } from "./types";

const BLUE = "#0073E3";
const NAVY = "#0f172a";
const GREY = "#64748b";
const BORDER = "#e2e8f0";
const HEADER_BG = "#f1f5f9";
const LOGO = path.join(process.cwd(), "public/logo/logo-blue-on-white.png");

export type TaxInvoicePdfProps = {
  report: VehicleReport;
  invoiceNumber: string;
  invoiceDate: Date;
  amountPaidCents: number;
  currency?: string;
};

function formatLongAuDate(date: Date): string {
  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatAbnDisplay(abn: string): string {
  const digits = abn.replace(/\D/g, "");
  if (digits.length !== 11) return abn.trim() || "—";
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 11)}`;
}

function formatMoney(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function splitGstInclusive(totalCents: number): {
  exGstCents: number;
  gstCents: number;
} {
  const exGstCents = Math.round(totalCents / 1.1);
  const gstCents = totalCents - exGstCents;
  return { exGstCents, gstCents };
}

function amountLineLabel(tierName: string): string {
  if (/insights\+/i.test(tierName)) {
    return "Auto Verifi Vehicle Insights+ Report";
  }
  return "Auto Verifi Vehicle Insights Report";
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: NAVY,
    backgroundColor: "#ffffff",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  logo: { width: 156, height: 28, objectFit: "contain" },
  tagline: {
    marginTop: 6,
    fontSize: 6.5,
    color: BLUE,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  taxTitle: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    letterSpacing: 0.5,
  },
  twoCol: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 22,
  },
  box: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
  },
  boxHeader: {
    backgroundColor: HEADER_BG,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  boxHeaderText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
  },
  boxBody: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    lineHeight: 1.55,
    fontSize: 9,
  },
  boxLineBold: { fontFamily: "Helvetica-Bold" },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    color: NAVY,
  },
  kvTable: {
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 22,
  },
  kvRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  kvLabel: {
    width: "32%",
    backgroundColor: HEADER_BG,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  kvValue: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 8.5,
  },
  amountTable: {
    borderWidth: 1,
    borderColor: BORDER,
  },
  amountHead: {
    flexDirection: "row",
    backgroundColor: NAVY,
    paddingVertical: 9,
    paddingHorizontal: 10,
  },
  amountHeadText: {
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
  },
  amountRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingVertical: 9,
    paddingHorizontal: 10,
  },
  amountTotalRow: {
    flexDirection: "row",
    borderTopWidth: 2,
    borderTopColor: NAVY,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: HEADER_BG,
  },
  colDesc: { flex: 1 },
  colAmt: { width: 100, textAlign: "right" },
  totalLabel: { fontFamily: "Helvetica-Bold", fontSize: 9 },
  totalAmt: { fontFamily: "Helvetica-Bold", fontSize: 10 },
  pageFooter: {
    position: "absolute",
    bottom: 32,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 10,
  },
  footerLogo: { width: 88, height: 18, objectFit: "contain" },
  footerMeta: { fontSize: 8, color: GREY },
});

function KeyValueTable({
  rows,
}: {
  rows: { label: string; value: string }[];
}) {
  return (
    <View style={styles.kvTable}>
      {rows.map((row, i) => (
        <View
          key={row.label}
          style={[
            styles.kvRow,
            i === rows.length - 1 ? { borderBottomWidth: 0 } : {},
          ]}
        >
          <Text style={styles.kvLabel}>{row.label}</Text>
          <Text style={styles.kvValue}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
}

export function TaxInvoicePdf({
  report,
  invoiceNumber,
  invoiceDate,
  amountPaidCents,
  currency = "aud",
}: TaxInvoicePdfProps) {
  const company = getCompanyDetails();
  const tier = resolveReportTier(report.tier);
  const tierConfig = getReportTierConfig(tier);
  const vehicleLabel = `${report.vehicle.year} ${report.vehicle.make} ${report.vehicle.model}`.trim();
  const regoLine = report.vehicle.rego
    ? `${report.vehicle.rego} (${report.vehicle.state})`
    : "—";
  const vinLine = report.vehicle.vin?.trim() || "—";
  const reportGenerated = formatLongAuDate(new Date(report.createdAt));
  const { exGstCents, gstCents } = splitGstInclusive(amountPaidCents);
  const lineLabel = amountLineLabel(tierConfig.name);

  return (
    <Document title={`Tax Invoice ${invoiceNumber}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.topRow}>
          <View>
            <Image src={LOGO} style={styles.logo} />
            <Text style={styles.tagline}>
              Past | Present | Future vehicle insights
            </Text>
          </View>
          <Text style={styles.taxTitle}>TAX INVOICE</Text>
        </View>

        <View style={styles.twoCol}>
          <View style={styles.box}>
            <View style={styles.boxHeader}>
              <Text style={styles.boxHeaderText}>Supplier</Text>
            </View>
            <View style={styles.boxBody}>
              <Text>Auto Verifi</Text>
              <Text style={styles.boxLineBold}>{company.legalName}</Text>
              <Text>ABN: {formatAbnDisplay(company.abn || "76692062061")}</Text>
              <Text>{company.address}</Text>
              <Text>{company.website}</Text>
            </View>
          </View>
          <View style={styles.box}>
            <View style={styles.boxHeader}>
              <Text style={styles.boxHeaderText}>Invoice details</Text>
            </View>
            <View style={styles.boxBody}>
              <Text>Invoice no: {invoiceNumber}</Text>
              <Text>Invoice date: {formatLongAuDate(invoiceDate)}</Text>
              <Text style={styles.boxLineBold}>Payment status: PAID</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Supply details</Text>
        <KeyValueTable
          rows={[
            { label: "Description", value: "Vehicle Insights Report" },
            { label: "Vehicle", value: vehicleLabel },
            { label: "Registration", value: regoLine },
            { label: "VIN", value: vinLine },
            { label: "Report generated", value: reportGenerated },
          ]}
        />

        <Text style={styles.sectionTitle}>Amount</Text>
        <View style={styles.amountTable}>
          <View style={styles.amountHead}>
            <Text style={[styles.amountHeadText, styles.colDesc]}>
              Description
            </Text>
            <Text style={[styles.amountHeadText, styles.colAmt]}>Amount</Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.colDesc}>{lineLabel}</Text>
            <Text style={styles.colAmt}>
              {formatMoney(exGstCents, currency)}
            </Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.colDesc}>GST (10%)</Text>
            <Text style={styles.colAmt}>{formatMoney(gstCents, currency)}</Text>
          </View>
          <View style={styles.amountTotalRow}>
            <Text style={[styles.colDesc, styles.totalLabel]}>
              TOTAL PAID (INC. GST)
            </Text>
            <Text style={[styles.colAmt, styles.totalAmt]}>
              {formatMoney(amountPaidCents, currency)}
            </Text>
          </View>
        </View>

        <View style={styles.pageFooter} fixed>
          <Image src={LOGO} style={styles.footerLogo} />
          <Text style={styles.footerMeta}>{company.website}</Text>
        </View>
      </Page>
    </Document>
  );
}
