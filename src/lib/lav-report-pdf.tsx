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
import {
  REPORT_GENERAL_DISCLAIMER_PARAGRAPHS,
  REPORT_GENERAL_DISCLAIMER_TITLE,
  REPORT_TERMS_URL,
} from "./report-disclaimer";
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
const LAV_TOTAL_PAGES = 2;

const styles = StyleSheet.create({
  page: { padding: 32, fontFamily: PDF_SANS, fontSize: 9, color: NAVY },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: BLUE,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: NAVY,
    marginTop: 4,
    maxWidth: 340,
    lineHeight: 1.35,
  },
  headerMeta: { fontSize: 7, color: GREY, textAlign: "right" },
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
  grid3: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  field: { width: "31%", marginBottom: 6 },
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
  photoRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
  photoRowId: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  photoBoxWalkaround: {
    width: "48%",
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
    padding: 5,
    minHeight: 120,
  },
  photoBoxId: {
    width: "31%",
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
    padding: 5,
    minHeight: 115,
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

function LavPdfFooter({ pageLabel }: { pageLabel: string }) {
  return (
    <View style={styles.footer} fixed>
      <Image src={LOGO} style={{ width: 72, height: 22, objectFit: "contain" }} />
      <Text style={styles.footerText}>{pageLabel}</Text>
    </View>
  );
}

function LavPdfHeader({
  report,
  title,
}: {
  report: VehicleReport;
  title: string;
}) {
  const ref = formatReportReference(report.vehicle);
  return (
    <View style={styles.headerRow}>
      <View style={{ flex: 1 }}>
        <Image
          src={LOGO}
          style={{ width: 120, height: 36, objectFit: "contain" }}
        />
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
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
  boxStyle: typeof styles.photoBoxWalkaround;
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
  const valuationRows = lavValuationHasData(report.valuation)
    ? lavValuationRows(report.valuation)
    : [];

  const detailRows: [string, string][] = [
    ["Make", vm.make],
    ["Model", vm.model],
    ["Badge", vm.badge],
    ["Year", vm.year],
    ["VIN", vm.vin],
    ["Registration plate", vm.regoDisplay],
    ["State", vm.registrationState],
    ["Registration expiry", vm.registrationExpiry],
    ["Odometer", vm.odometer],
    ["Body", vm.body],
    ["Colour", vm.colour],
  ];

  const [generalTerms, ...generalRest] = REPORT_GENERAL_DISCLAIMER_PARAGRAPHS;

  return (
    <Document title={vm.title}>
      <Page size="A4" style={styles.page}>
        <LavPdfHeader report={report} title={vm.title} />
        <Text style={styles.section}>Vehicle details</Text>
        <View style={styles.grid3}>
          {detailRows.map(([label, value]) => (
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
        <Text style={[styles.section, { marginTop: 8 }]}>Verification photos</Text>
        <Text style={{ fontSize: 7, color: GREY, marginBottom: 4 }}>
          Date, time stamped and geo tagged images from digital self inspection.
        </Text>
        <View style={styles.photoRow}>
          {vm.walkaround.map((slot) => (
            <PdfPhotoSlot
              key={slot.angleId}
              title={slot.title}
              photo={slot.photo}
              boxStyle={styles.photoBoxWalkaround}
              imageHeight={108}
              odometerDisplay={vm.odometer}
            />
          ))}
        </View>
        <View style={styles.photoRowId}>
          {vm.identification.map((slot) => (
            <PdfPhotoSlot
              key={slot.angleId}
              title={slot.title}
              photo={slot.photo}
              boxStyle={styles.photoBoxId}
              imageHeight={82}
              odometerDisplay={vm.odometer}
            />
          ))}
        </View>
        <LavPdfFooter pageLabel={`1 / ${LAV_TOTAL_PAGES}`} />
      </Page>

      <Page size="A4" style={styles.page}>
        <LavPdfHeader report={report} title={vm.title} />
        {valuationRows.length > 0 ? (
          <>
            <Text style={styles.section}>Valuation</Text>
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
        <Text
          style={[
            styles.disclaimerHeading,
            { marginTop: valuationRows.length > 0 ? 12 : 0 },
          ]}
        >
          {LAV_REPORT_DISCLAIMER_TITLE}
        </Text>
        {LAV_REPORT_DISCLAIMER_SECTIONS.map((section) => (
          <View key={section.heading}>
            <Text style={styles.disclaimerSub}>{section.heading}</Text>
            <Text style={styles.disclaimerBody}>{section.body}</Text>
          </View>
        ))}
        <Text style={[styles.disclaimerBody, { marginTop: 8 }]}>
          {LAV_REPORT_DISCLAIMER_FOOTER}
        </Text>
        <Text style={[styles.disclaimerHeading, { marginTop: 10, fontSize: 9 }]}>
          {REPORT_GENERAL_DISCLAIMER_TITLE}
        </Text>
        <Text style={styles.disclaimerBody}>
          {generalTerms} ({REPORT_TERMS_URL}).
        </Text>
        {generalRest.map((paragraph) => (
          <Text key={paragraph} style={styles.disclaimerBody}>
            {paragraph}
          </Text>
        ))}
        <LavPdfFooter pageLabel={`2 / ${LAV_TOTAL_PAGES}`} />
      </Page>
    </Document>
  );
}