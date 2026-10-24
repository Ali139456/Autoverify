"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { AUTOVERIFI_CONTACT_EMAIL } from "@/lib/site-contact";

const PRICE_DIGITAL = 35;
const PRICE_PHYSICAL = 120;
const GST_RATE = 0.1;

const ASSET_TYPES = [
  "Car / 4WD",
  "Motorcycle",
  "Truck / prime mover",
  "Trailer",
  "Caravan / camper",
  "Motorhome",
  "Boat hull",
  "Outboard / inboard motor",
  "Boat trailer",
  "Jet ski / PWC",
  "Yellow goods (excavator, loader…)",
  "Agricultural (tractor, harvester…)",
  "Plant & equipment",
  "Other",
] as const;

type AssetRow = {
  id: string;
  type: string;
  year: string;
  make: string;
  model: string;
  identifier: string;
  rego: string;
  description: string;
};

function newAsset(): AssetRow {
  return {
    id: crypto.randomUUID(),
    type: "",
    year: "",
    make: "",
    model: "",
    identifier: "",
    rego: "",
    description: "",
  };
}

function money(n: number) {
  return `$${n.toLocaleString("en-AU", {
    minimumFractionDigits: n % 1 ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

function esc(s: string) {
  return String(s || "—")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type LenderBookingFormHandle = {
  pickInspection: (kind: "digital" | "physical") => void;
};

export const LenderBookingForm = forwardRef<
  LenderBookingFormHandle,
  object
>(function LenderBookingForm(_props, ref) {
  const [step, setStep] = useState(1);
  const [inspectionType, setInspectionType] = useState(
    "Digital Self Inspection",
  );
  const [assets, setAssets] = useState<AssetRow[]>(() => [newAsset()]);
  const [vendorType, setVendorType] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [vendorPhone, setVendorPhone] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");
  const [address, setAddress] = useState("");
  const [suburb, setSuburb] = useState("");
  const [state, setState] = useState("");
  const [postcode, setPostcode] = useState("");
  const [accessNotes, setAccessNotes] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [lender, setLender] = useState("");
  const [borrower, setBorrower] = useState("");
  const [reference, setReference] = useState("");
  const [ccEmails, setCcEmails] = useState("");
  const [billing, setBilling] = useState("Invoice my account");
  const [confirmLender, setConfirmLender] = useState(false);
  const [confirmTerms, setConfirmTerms] = useState(false);
  const [doneRef, setDoneRef] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const lastStep = 5;
  const unit =
    inspectionType.startsWith("Digital") ? PRICE_DIGITAL : PRICE_PHYSICAL;
  const totals = useMemo(() => {
    const subtotal = unit * assets.length;
    const gst = Math.round(subtotal * GST_RATE * 100) / 100;
    return { subtotal, gst, estimate: subtotal + gst };
  }, [assets.length, unit]);

  const scrollBook = () => {
    document.getElementById("book")?.scrollIntoView({ behavior: "smooth" });
  };

  const goTo = (n: number) => {
    setStep(n);
    scrollBook();
  };

  const updateAsset = (id: string, patch: Partial<AssetRow>) => {
    setAssets((rows) =>
      rows.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    );
  };

  const addAsset = () => setAssets((rows) => [...rows, newAsset()]);
  const removeAsset = (id: string) => {
    setAssets((rows) =>
      rows.length <= 1 ? rows : rows.filter((r) => r.id !== id),
    );
  };

  const pickInspection = useCallback((kind: "digital" | "physical") => {
    setInspectionType(
      kind === "digital" ? "Digital Self Inspection" : "Physical inspection",
    );
    setStep(1);
    document.getElementById("book")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useImperativeHandle(ref, () => ({ pickInspection }), [pickInspection]);

  const validateStep = (n: number): boolean => {
    if (n === 2) {
      return assets.every((a) => a.type && a.make.trim() && a.model.trim());
    }
    if (n === 3) {
      return Boolean(
        vendorType &&
          vendorName.trim() &&
          vendorPhone.trim() &&
          address.trim() &&
          suburb.trim() &&
          state &&
          /^\d{4}$/.test(postcode),
      );
    }
    if (n === 4) {
      return Boolean(
        role &&
          company.trim() &&
          contactName.trim() &&
          contactPhone.trim() &&
          /^\S+@\S+\.\S+$/.test(contactEmail) &&
          lender.trim() &&
          borrower.trim(),
      );
    }
    if (n === 5) {
      return confirmLender && confirmTerms;
    }
    return true;
  };

  const buildPayload = (bookingRef: string) => ({
    bookingRef,
    submittedAt: new Date().toISOString(),
    inspectionType,
    assets: assets.map((a) => ({
      type: a.type,
      year: a.year,
      make: a.make,
      model: a.model,
      identifier: a.identifier.toUpperCase(),
      rego: a.rego,
      description: a.description,
    })),
    vendorType,
    vendorName,
    vendorPhone,
    vendorEmail,
    address,
    suburb,
    state,
    postcode,
    accessNotes,
    role,
    company,
    contactName,
    contactPhone,
    contactEmail,
    lender,
    borrower,
    reference,
    ccEmails,
    billing,
    ...totals,
  });

  const submit = async () => {
    if (!validateStep(5)) return;
    const bookingRef = `AV-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const payload = buildPayload(bookingRef);
    setSubmitting(true);
    try {
      const res = await fetch(
        "/api/inspections/lender-asset-verification/booking",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) throw new Error("submit failed");
      setDoneRef(bookingRef);
      setStep(6);
    } catch {
      const lines = [
        `Booking ref: ${bookingRef}`,
        `Inspection: ${inspectionType}`,
        `Total: ${money(totals.subtotal)} + GST ${money(totals.gst)} = ${money(totals.estimate)} inc GST`,
        "",
        ...payload.assets.map(
          (a, i) =>
            `Asset ${i + 1}: ${a.type} | ${a.year} ${a.make} ${a.model} | ID ${a.identifier || "-"} | Rego ${a.rego || "-"}`,
        ),
      ];
      window.location.href = `mailto:${AUTOVERIFI_CONTACT_EMAIL}?subject=${encodeURIComponent(`Asset verification booking ${bookingRef}`)}&body=${encodeURIComponent(lines.join("\n"))}`;
      setDoneRef(bookingRef);
      setStep(6);
    } finally {
      setSubmitting(false);
    }
  };

  const summaryHtml = useMemo(() => {
    const dl = (rows: [string, string][]) =>
      `<dl>${rows.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join("")}</dl>`;
    const assetBlocks = assets
      .map((a, i) =>
        dl([
          [
            `Asset ${i + 1}`,
            [a.year, a.make, a.model].filter(Boolean).join(" ") +
              " · " +
              a.type,
          ],
          ["Identifier", a.identifier],
          ["Rego", a.rego],
        ]),
      )
      .join("");
    return `
    <h4>Inspection</h4>${dl([["Type", inspectionType]])}
    <h4>Assets (${assets.length})</h4>${assetBlocks}
    <h4>Vendor</h4>${dl([
      ["Vendor", `${vendorName} (${vendorType})`],
      ["Phone", vendorPhone],
      ["Location", `${address}, ${suburb} ${state} ${postcode}`],
    ])}
    <h4>Ordered by</h4>${dl([
      ["Contact", `${contactName}, ${company} (${role})`],
      ["Email", contactEmail],
      ["Lender", lender],
      ["Borrower", borrower],
      ["Reference", reference],
      ["Billing", billing],
    ])}
    <div class="total" style="font-weight:500;color:var(--muted)"><span>${assets.length} × ${inspectionType} @ ${money(unit)} + GST</span><span>${money(totals.subtotal)}</span></div>
    <div style="display:flex;justify-content:space-between;color:var(--muted);padding-top:6px"><span>GST</span><span>${money(totals.gst)}</span></div>
    <div class="total"><span>Total (inc. GST)</span><span>${money(totals.estimate)}</span></div>`;
  }, [
    address,
    assets,
    billing,
    borrower,
    company,
    contactEmail,
    contactName,
    inspectionType,
    lender,
    postcode,
    reference,
    role,
    state,
    suburb,
    totals.estimate,
    totals.gst,
    totals.subtotal,
    unit,
    vendorName,
    vendorPhone,
    vendorType,
  ]);

  return (
    <div id="bookingForm">
      <div className="progress" id="progress">
        {[1, 2, 3, 4, 5].map((n, i) => (
          <div key={n} className={step > i ? "on" : ""}>
            {n}
            <span>
              {" "}
              ·{" "}
              {["Inspection", "Assets", "Vendor", "Your details", "Review"][i]}
            </span>
          </div>
        ))}
      </div>

      <div id="bookingForm">
        {step === 1 && (
          <div className="panel active" data-step="1">
            <h3>Inspection type</h3>
            <p className="sub">
              Confirm with your lender that the method you choose is acceptable
              for this deal.
            </p>
            <div className="choice-grid">
              <label
                className={`choice ${inspectionType.startsWith("Digital") ? "sel" : ""}`}
              >
                <input
                  type="radio"
                  name="inspectionType"
                  checked={inspectionType.startsWith("Digital")}
                  onChange={() => setInspectionType("Digital Self Inspection")}
                />
                <strong>Digital Self Inspection</strong>
                <small>
                  $35 + GST per asset · owner, buyer or vendor completes on
                  their phone
                </small>
              </label>
              <label
                className={`choice ${inspectionType.startsWith("Physical") ? "sel" : ""}`}
              >
                <input
                  type="radio"
                  name="inspectionType"
                  checked={inspectionType.startsWith("Physical")}
                  onChange={() => setInspectionType("Physical inspection")}
                />
                <strong>Physical inspection</strong>
                <small>
                  $120 + GST per asset · inspector attends the asset
                </small>
              </label>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="panel active" data-step="2">
            <h3>Assets to inspect</h3>
            <p className="sub">
              Add each part with its own identifier as a separate asset (e.g.
              hull, motor and trailer).
            </p>
            <div id="assets">
              {assets.map((a, i) => (
                <div key={a.id} className="asset-block">
                  <div className="hd">
                    <b>Asset {i + 1}</b>
                    {assets.length > 1 ? (
                      <button
                        type="button"
                        className="rm"
                        onClick={() => removeAsset(a.id)}
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                  <div className="fields">
                    <div>
                      <label>
                        Asset type <span className="req">*</span>
                      </label>
                      <select
                        required
                        value={a.type}
                        onChange={(e) =>
                          updateAsset(a.id, { type: e.target.value })
                        }
                      >
                        <option value="">Select…</option>
                        {ASSET_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label>Year</label>
                      <input
                        value={a.year}
                        inputMode="numeric"
                        maxLength={4}
                        onChange={(e) =>
                          updateAsset(a.id, { year: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label>
                        Make <span className="req">*</span>
                      </label>
                      <input
                        required
                        value={a.make}
                        onChange={(e) =>
                          updateAsset(a.id, { make: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label>
                        Model <span className="req">*</span>
                      </label>
                      <input
                        required
                        value={a.model}
                        onChange={(e) =>
                          updateAsset(a.id, { model: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label>VIN / chassis / HIN / serial</label>
                      <input
                        value={a.identifier}
                        style={{ textTransform: "uppercase" }}
                        onChange={(e) =>
                          updateAsset(a.id, { identifier: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label>Registration & state</label>
                      <input
                        value={a.rego}
                        placeholder="e.g. ABC123 NSW"
                        onChange={(e) =>
                          updateAsset(a.id, { rego: e.target.value })
                        }
                      />
                    </div>
                    <div className="full">
                      <label>Description / identifying features</label>
                      <input
                        value={a.description}
                        placeholder="Colour, body type, attachments…"
                        onChange={(e) =>
                          updateAsset(a.id, { description: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-light no-arrow"
              onClick={addAsset}
            >
              + Add another asset
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="panel active" data-step="3">
            <h3>Vendor & asset location</h3>
            <p className="sub">
              We&apos;ll contact the vendor directly to arrange the inspection.
            </p>
            <div className="fields">
              <div>
                <label htmlFor="vendorType">
                  Vendor type <span className="req">*</span>
                </label>
                <select
                  id="vendorType"
                  required
                  value={vendorType}
                  onChange={(e) => setVendorType(e.target.value)}
                >
                  <option value="">Select…</option>
                  <option>Private seller</option>
                  <option>Dealer</option>
                  <option>Borrower (sale & leaseback / refinance)</option>
                  <option>Auction house</option>
                </select>
              </div>
              <div>
                <label htmlFor="vendorName">
                  Vendor name / business <span className="req">*</span>
                </label>
                <input
                  id="vendorName"
                  required
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="vendorPhone">
                  Vendor mobile <span className="req">*</span>
                </label>
                <input
                  id="vendorPhone"
                  type="tel"
                  required
                  placeholder="04xx xxx xxx"
                  value={vendorPhone}
                  onChange={(e) => setVendorPhone(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="vendorEmail">Vendor email</label>
                <input
                  id="vendorEmail"
                  type="email"
                  value={vendorEmail}
                  onChange={(e) => setVendorEmail(e.target.value)}
                />
              </div>
              <div className="full">
                <label htmlFor="address">
                  Asset street address <span className="req">*</span>
                </label>
                <input
                  id="address"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="suburb">
                  Suburb <span className="req">*</span>
                </label>
                <input
                  id="suburb"
                  required
                  value={suburb}
                  onChange={(e) => setSuburb(e.target.value)}
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label htmlFor="state">
                    State <span className="req">*</span>
                  </label>
                  <select
                    id="state"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  >
                    <option value="">—</option>
                    {["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"].map(
                      (s) => (
                        <option key={s}>{s}</option>
                      ),
                    )}
                  </select>
                </div>
                <div>
                  <label htmlFor="postcode">
                    Postcode <span className="req">*</span>
                  </label>
                  <input
                    id="postcode"
                    inputMode="numeric"
                    maxLength={4}
                    required
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                  />
                </div>
              </div>
              <div className="full">
                <label htmlFor="accessNotes">Access notes</label>
                <textarea
                  id="accessNotes"
                  placeholder="Gate codes, best times, site contact, parking…"
                  value={accessNotes}
                  onChange={(e) => setAccessNotes(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="panel active" data-step="4">
            <h3>Your details</h3>
            <p className="sub">Who&apos;s ordering, and who should receive the report.</p>
            <div className="fields">
              <div>
                <label htmlFor="role">
                  I am a… <span className="req">*</span>
                </label>
                <select
                  id="role"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="">Select…</option>
                  <option>Broker</option>
                  <option>Lender / credit team</option>
                  <option>Introducer / aggregator</option>
                  <option>Borrower</option>
                </select>
              </div>
              <div>
                <label htmlFor="company">
                  Company <span className="req">*</span>
                </label>
                <input
                  id="company"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="contactName">
                  Your name <span className="req">*</span>
                </label>
                <input
                  id="contactName"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="contactPhone">
                  Your phone <span className="req">*</span>
                </label>
                <input
                  id="contactPhone"
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="contactEmail">
                  Your email <span className="req">*</span>
                </label>
                <input
                  id="contactEmail"
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="lender">
                  Lender <span className="req">*</span>
                </label>
                <input
                  id="lender"
                  required
                  placeholder="Financier name"
                  value={lender}
                  onChange={(e) => setLender(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="borrower">
                  Borrower / applicant name <span className="req">*</span>
                </label>
                <input
                  id="borrower"
                  required
                  value={borrower}
                  onChange={(e) => setBorrower(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="reference">Loan / deal reference</label>
                <input
                  id="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>
              <div className="full">
                <label htmlFor="ccEmails">
                  Also send report to (comma separated)
                </label>
                <input
                  id="ccEmails"
                  placeholder="credit@lender.com.au, settlements@broker.com.au"
                  value={ccEmails}
                  onChange={(e) => setCcEmails(e.target.value)}
                />
              </div>
              <div className="full">
                <label htmlFor="billing">Billing</label>
                <select
                  id="billing"
                  value={billing}
                  onChange={(e) => setBilling(e.target.value)}
                >
                  <option>Invoice my account</option>
                  <option>Pay by card (we&apos;ll send a payment link)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="panel active" data-step="5">
            <h3>Review & submit</h3>
            <p className="sub">Check everything looks right before sending.</p>
            <div
              className="summary"
              dangerouslySetInnerHTML={{ __html: summaryHtml }}
            />
            <div style={{ marginTop: 18 }}>
              <label className="check">
                <input
                  type="checkbox"
                  checked={confirmLender}
                  onChange={(e) => setConfirmLender(e.target.checked)}
                />
                I confirm the lender accepts the selected inspection method and
                the asset details are correct.
              </label>
              <label className="check" style={{ marginTop: 10 }}>
                <input
                  type="checkbox"
                  checked={confirmTerms}
                  onChange={(e) => setConfirmTerms(e.target.checked)}
                />
                I agree to the Auto Verifi terms of service and privacy policy.
              </label>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="panel active" data-step="6">
            <div className="done">
              <div className="big">✓</div>
              <h3>Booking received</h3>
              <p style={{ color: "var(--muted)" }}>
                Reference <b>{doneRef}</b>. We&apos;ll contact the vendor
                shortly and email you a confirmation.
              </p>
              <button
                type="button"
                className="btn btn-light"
                onClick={() => {
                  setStep(1);
                  setConfirmLender(false);
                  setConfirmTerms(false);
                  setAssets([newAsset()]);
                }}
              >
                Make another booking
              </button>
            </div>
          </div>
        )}

        {step <= lastStep && (
          <div className="form-nav" id="formNav">
            <button
              type="button"
              className="btn btn-light btn-back"
              style={{ visibility: step > 1 ? "visible" : "hidden" }}
              onClick={() => goTo(step - 1)}
            >
              ← Back
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={submitting}
              onClick={() => {
                if (!validateStep(step)) return;
                if (step < lastStep) goTo(step + 1);
                else void submit();
              }}
            >
              {submitting
                ? "Sending…"
                : step === lastStep
                  ? "Submit booking"
                  : "Continue"}
            </button>
          </div>
        )}
      </div>

    </div>
  );
});
