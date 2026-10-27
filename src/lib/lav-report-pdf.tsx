/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { formatInspectionPhotoEvidenceLines } from "./inspection-photo-evidence";
import {
  buildLavReportViewModel,
  lavDamageLabelForAngle,
} from "./lav/lav-report-view";
import {
  LAV_REPORT_DISCLAIMER_FOOTER,
  LAV_REPORT_DISCLAIMER_SECTIONS,
  LAV_REPORT_DISCLAIMER_TITLE,
} from "./lav/lav-disclaimer";
import { formatReportReference, getInspectionPhotoUrl } from "./report-design";
import { REPORT_LOGO_PNG_PATH } from "./report-logo-size";
import { publicPdfImage } from "./pdf-local-image";
import type { InspectionPhoto, VehicleReport } from "./types";

Font.registerHyphenationCallback((word) => [word]);

const BLUE = "#0073E3";
const NAVY = "#0f172a";
const GREY = "#64748b";
const LOGO = publicPdfImage(REPORT_LOGO_PNG_PATH);

const styles = StyleSheet.create({
  page: { padding: 32, fontFamily: "Helvetica", fontSize: 9, color: NAVY },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: BLUE,
    paddingBottom: 10,
  },
  headerMeta: { fontSize: 7, color: GREY, textAlign: "right" },
  title: { fontSize: 14, fontWeight: 700, marginBottom: 8 },
  section: {
    fontSize: 8,
    fontWeight: 700,
    color: BLUE,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 10,
    marginBottom: 6,
  },
  grid2: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  field: { width: "48%", marginBottom: 6 },
  label: { fontSize: 6.5, color: GREY, textTransform: "uppercase", marginBottom: 2 },
  value: { fontSize: 9, fontWeight: 700 },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 32,
    right: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
  },
  footerText: { fontSize: 7, color: GREY },
  photoRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  photoBox: {
    width: "23%",
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
    padding: 4,
    minHeight: 70,
  },
  photoTitle: { fontSize: 7, fontWeight: 700, marginBottom: 3 },
  photoMeta: { fontSize: 6, color: GREY, lineHeight: 1.35 },
  damageBox: {
    width: "23%",
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    padding: 5,
    marginTop: 4,
  },
  disclaimerHeading: { fontSize: 10, fontWeight: 700, marginBottom: 6 },
  disclaimerSub: { fontSize: 8, fontWeight: 700, marginBottom: 2 },
  disclaimerBody: { fontSize: 7, color: GREY, lineHeight: 1.45, marginBottom: 6 },
});

function LavPdfFooter({
  report,
  pageLabel,
}: {
  report: VehicleReport;
  pageLabel: string;
}) {
  const ref = formatReportReference(report.vehicle);
  return (
    <View style={styles.footer} fixed>
      <Image src={LOGO} style={{ width: 72, height: 22, objectFit: "contain" }} />
      <Text style={styles.footerText}>
        {ref} · Autoverifi.com.au | {pageLabel}
      </Text>
    </View>
  );
}

function LavPdfHeader({ report }: { report: VehicleReport }) {
  const ref = formatReportReference(report.vehicle);
  return (
    <View style={styles.headerRow}>
      <Image src={LOGO} style={{ width: 120, height: 36, objectFit: "contain" }} />
      <View>
        <Text style={styles.headerMeta}>Report ref: {ref}</Text>
        <Text style={styles.headerMeta}>Autoverifi.com.au</Text>
      </View>
    </View>
  );
}

function PdfPhotoSlot({
  title,
  photo,
}: {
  title: string;
  photo: InspectionPhoto | null;
}) {
  const url = photo ? getInspectionPhotoUrl(photo) : null;
  const meta = photo ? formatInspectionPhotoEvidenceLines(photo) : [];
  return (
    <View style={styles.photoBox}>
      <Text style={styles.photoTitle}>{title}</Text>
      {url ? (
        <Image src={url} style={{ width: "100%", height: 48, objectFit: "contain" }} />
      ) : (
        <Text style={styles.photoMeta}>Awaiting capture</Text>
      )}
      {meta.map((line) => (
        <Text key={line} style={styles.photoMeta}>
          {line}
        </Text>
      ))}
    </View>
  );
}

export function LavReportPdf({
  report,
  photos = [],
}: {
  report: VehicleReport;
  photos?: InspectionPhoto[];
}) {
  const vm = buildLavReportViewModel(report, photos, report.damage);
  const condition = vm.conditionGrade;

  return (
    <Document title={`Lender Asset Verification ${vm.reportRef}`}>
      <Page size="A4" style={styles.page}>
        <LavPdfHeader report={report} />
        <Text style={styles.title}>{vm.title}</Text>
        <Text style={{ fontSize: 8, color: GREY, marginBottom: 6 }}>
          Asset type: {vm.assetType}
          {vm.bookingRef ? ` · Booking ${vm.bookingRef}` : ""}
        </Text>
        <Text style={styles.section}>Vehicle details</Text>
        <View style={styles.grid2}>
          {[
            ["Make", vm.make],
            ["Model", vm.model],
            ["Badge", vm.badge],
            ["Year", vm.year],
            ["VIN", vm.vin],
            ["Registration plate", vm.regoDisplay],
            ["Registration expiry", vm.registrationExpiry],
            ["Odometer", vm.odometer],
            ["Body", vm.body],
            ["Colour", vm.colour],
          ].map(([label, value]) => (
            <View key={label} style={styles.field}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.value}>{value}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.section}>Inspection summary</Text>
        <Text style={styles.label}>Overall condition of vehicle</Text>
        <Text style={styles.value}>
          {condition === "good"
            ? "✓ Good"
            : condition === "fair"
              ? "✓ Fair"
              : condition === "poor"
                ? "✓ Poor"
                : "Pending inspection / AI scan"}
        </Text>
        <Text style={[styles.label, { marginTop: 6 }]}>
          Additional inspector comments
        </Text>
        <Text style={{ fontSize: 8, color: GREY }}>{vm.inspectorComments}</Text>
        <LavPdfFooter report={report} pageLabel="1 / 4" />
      </Page>

      <Page size="A4" style={styles.page}>
        <LavPdfHeader report={report} />
        <Text style={styles.section}>Vehicle photos</Text>
        <View style={styles.photoRow}>
          {vm.walkaround.map((slot) => (
            <PdfPhotoSlot key={slot.angleId} title={slot.title} photo={slot.photo} />
          ))}
        </View>
        <Text style={[styles.section, { marginTop: 10 }]}>AI damage scan</Text>
        <Text style={{ fontSize: 8, fontWeight: 700 }}>{vm.aiScanSummary}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
          {vm.walkaround.map((slot) => (
            <View key={slot.angleId} style={styles.damageBox}>
              <Text style={styles.photoTitle}>{slot.title}</Text>
              <Text style={styles.photoMeta}>
                {lavDamageLabelForAngle(slot.angleId, report.damage)}
              </Text>
            </View>
          ))}
        </View>
        <LavPdfFooter report={report} pageLabel="2 / 4" />
      </Page>

      <Page size="A4" style={styles.page}>
        <LavPdfHeader report={report} />
        <Text style={styles.section}>Identification photos</Text>
        <View style={styles.photoRow}>
          {vm.identification.map((slot) => (
            <PdfPhotoSlot key={slot.angleId} title={slot.title} photo={slot.photo} />
          ))}
        </View>
        <LavPdfFooter report={report} pageLabel="3 / 4" />
      </Page>

      <Page size="A4" style={styles.page}>
        <LavPdfHeader report={report} />
        <Text style={styles.disclaimerHeading}>{LAV_REPORT_DISCLAIMER_TITLE}</Text>
        {LAV_REPORT_DISCLAIMER_SECTIONS.map((section) => (
          <View key={section.heading}>
            <Text style={styles.disclaimerSub}>{section.heading}</Text>
            <Text style={styles.disclaimerBody}>{section.body}</Text>
          </View>
        ))}
        <Text style={[styles.disclaimerBody, { marginTop: 8 }]}>
          {LAV_REPORT_DISCLAIMER_FOOTER}
        </Text>
        <LavPdfFooter report={report} pageLabel="4 / 4" />
      </Page>
    </Document>
  );
}
