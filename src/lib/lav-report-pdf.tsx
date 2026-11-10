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
import { formatLavInspectionPhotoEvidenceLines } from "./inspection-photo-evidence";
import { buildLavReportViewModel } from "./lav/lav-report-view";
import {
  formatLavValuationRange,
  lavValuationHasData,
  lavValuationRows,
} from "./lav/lav-valuation";
import {
  LAV_REPORT_DISCLAIMER_FOOTER,
  LAV_REPORT_DISCLAIMER_SECTIONS,
  LAV_REPORT_DISCLAIMER_TITLE,
} from "./lav/lav-disclaimer";
import { formatReportReference, getInspectionPhotoUrl } from "./report-design";
import { REPORT_LOGO_PNG_PATH } from "./report-logo-size";
import { publicPdfImage, type PdfImageSource } from "./pdf-local-image";
import { PDF_SANS, registerReportPdfFonts } from "./pdf-fonts";
import type { InspectionPhoto, VehicleReport } from "./types";

Font.registerHyphenationCallback((word) => [word]);
registerReportPdfFonts();

const BLUE = "#0073E3";
const NAVY = "#0f172a";
const GREY = "#64748b";
const LOGO = publicPdfImage(REPORT_LOGO_PNG_PATH);

const styles = StyleSheet.create({
  page: { padding: 32, fontFamily: PDF_SANS, fontSize: 9, color: NAVY },
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
    letterSpacing: 0.8,
    marginTop: 10,
    marginBottom: 6,
    paddingBottom: 4,
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
  photoRowId: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
  photoBox: {
    width: "23%",
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
    padding: 4,
    minHeight: 70,
  },
  photoBoxId: {
    width: "31%",
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
    padding: 5,
    minHeight: 118,
  },
  photoTitle: {
    fontSize: 7,
    fontWeight: 700,
    marginBottom: 3,
    lineHeight: 1.35,
  },
  photoMeta: { fontSize: 6, color: GREY, lineHeight: 1.35 },
  valuationRow: { flexDirection: "row", gap: 6, marginTop: 6 },
  valuationBox: {
    width: "32%",
    padding: 8,
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
  },
  valuationAmount: { fontSize: 9, fontWeight: 700, color: BLUE, marginTop: 3 },
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
        {ref} | {pageLabel}
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

function lavPdfPhotoSrc(photo: InspectionPhoto): PdfImageSource | string | null {
  const url = getInspectionPhotoUrl(photo);
  if (!url) return null;
  if (url.startsWith("/")) return publicPdfImage(url);
  return url;
}

function PdfPhotoSlot({
  title,
  photo,
  boxStyle,
  imageHeight = 48,
  odometerDisplay,
}: {
  title: string;
  photo: InspectionPhoto | null;
  boxStyle: typeof styles.photoBox;
  imageHeight?: number;
  odometerDisplay?: string | null;
}) {
  const src = photo ? lavPdfPhotoSrc(photo) : null;
  const meta = photo
    ? formatLavInspectionPhotoEvidenceLines(photo, odometerDisplay)
    : [];
  return (
    <View style={boxStyle}>
      <Text style={styles.photoTitle}>{title}</Text>
      {src ? (
        <Image
          src={src}
          style={{
            width: "100%",
            height: imageHeight,
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
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
  const vm = buildLavReportViewModel(report, photos, null);
  const condition = vm.conditionGrade;
  const allPhotoSlots = [...vm.walkaround, ...vm.identification];
  const valuationRows = lavValuationHasData(report.valuation)
    ? lavValuationRows(report.valuation)
    : [];

  return (
    <Document title={`Lender Asset Verification ${vm.reportRef}`}>
      <Page size="A4" style={styles.page}>
        <LavPdfHeader report={report} />
        <Text style={styles.title}>{vm.title}</Text>
        {vm.bookingRef ? (
          <Text style={{ fontSize: 8, color: GREY, marginBottom: 6 }}>
            Booking {vm.bookingRef}
          </Text>
        ) : null}
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
                : "To be confirmed from image capture"}
        </Text>
        <LavPdfFooter report={report} pageLabel="1 / 3" />
      </Page>

      <Page size="A4" style={styles.page}>
        <LavPdfHeader report={report} />
        <Text style={styles.section}>Verification photos</Text>
        <Text style={{ fontSize: 7, color: GREY, marginBottom: 4 }}>
          Date, time stamped and geo tagged images from digital self inspection.
        </Text>
        <View style={styles.photoRow}>
          {allPhotoSlots.map((slot) => (
            <PdfPhotoSlot
              key={slot.angleId}
              title={slot.title}
              photo={slot.photo}
              boxStyle={styles.photoBox}
              imageHeight={52}
              odometerDisplay={vm.odometer}
            />
          ))}
        </View>
        {valuationRows.length > 0 ? (
          <>
            <Text style={[styles.section, { marginTop: 12 }]}>Valuation</Text>
            <Text style={styles.label}>Present value — market valuation</Text>
            <View style={styles.valuationRow}>
              {valuationRows.map((row) => (
                <View key={row.label} style={styles.valuationBox}>
                  <Text style={styles.label}>{row.label}</Text>
                  <Text style={styles.valuationAmount}>
                    {formatLavValuationRange(row.low, row.high)}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : null}
        <LavPdfFooter report={report} pageLabel="2 / 3" />
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
        <LavPdfFooter report={report} pageLabel="3 / 3" />
      </Page>
    </Document>
  );
}
