"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bike,
  Car,
  Caravan,
  LayoutGrid,
  Ship,
  Tractor,
  Truck,
} from "lucide-react";
import { useRef } from "react";
import {
  LenderBookingForm,
  type LenderBookingFormHandle,
} from "./LenderBookingForm";
import { LavVerificationSummaryTable } from "./LavVerificationSummaryTable";
import "./lender-asset-verification.css";

const SAMPLE_PDF = "/samples/lender-asset-verification-car-sample.pdf";
const HERO_INSPECTION_IMAGE =
  "/lender-asset-verification/hero-digital-inspection.png";

const SECURED_ASSET_TYPES = [
  { label: "Cars", Icon: Car },
  { label: "Bikes", Icon: Bike },
  { label: "Boats", Icon: Ship },
  { label: "Heavy vehicles", Icon: Truck },
  { label: "Equipment", Icon: Tractor },
  { label: "Caravans", Icon: Caravan },
  { label: "Other assets", Icon: LayoutGrid },
] as const;

export function LenderAssetVerificationSite() {
  const bookingRef = useRef<LenderBookingFormHandle>(null);

  return (
    <div className="lav w-full min-w-0 max-w-full overflow-x-clip">
      <section className="hero">
        <div className="av-site-container lav-hero-stack">
          <div className="hero-grid lg:grid-cols-2">
          <div className="lav-hero-left flex w-full min-w-0 flex-col items-center">
            <figure className="lav-hero-photo relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#06080f] shadow-lg shadow-black/40">
              <Image
                src={HERO_INSPECTION_IMAGE}
                alt="Auto Verifi inspector capturing a vehicle VIN with a phone"
                fill
                priority
                className="object-cover object-[48%_42%]"
                sizes="(max-width: 1024px) 100vw, 27.5rem"
              />
            </figure>
          </div>
          <div className="lav-hero-right relative flex min-w-0 flex-col text-left">
            <div className="lav-hero-body relative min-w-0">
            <span className="eyebrow">For lenders, brokers &amp; introducers</span>
            <h1 className="lav-hero-title">
              <span className="line">Lender asset verification.</span>
              <span className="line">Verified in minutes.</span>
              <span className="line">Australia wide</span>
            </h1>
            <p className="lead mt-4 max-w-xl text-sm text-slate-400 sm:mt-5 sm:text-base">
              We verify asset existence, vehicle identifiers and confirm current
              condition.
            </p>
            <div className="lav-hero-ctas mt-6 grid w-full max-w-xl grid-cols-1 gap-2 sm:mt-8 sm:grid-cols-2 sm:gap-2">
              <a
                href="#options"
                className="btn-shine group flex h-10 min-w-0 items-center justify-center gap-1 rounded-lg bg-accent-500 px-2.5 text-xs font-bold leading-tight text-white transition hover:bg-accent-600 sm:px-4 sm:text-sm"
              >
                Book an inspection
                <ArrowRight
                  className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 sm:h-4 sm:w-4"
                  aria-hidden
                />
              </a>
              <Link
                href={SAMPLE_PDF}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-10 min-w-0 items-center justify-center gap-1 rounded-lg border-2 border-accent-500 bg-transparent px-2.5 text-center text-xs font-bold leading-tight text-accent-500 transition hover:bg-accent-500/10 sm:gap-1.5 sm:px-4 sm:text-sm"
              >
                <span className="min-w-0">View sample report</span>
                <ArrowRight
                  className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 sm:h-4 sm:w-4"
                  aria-hidden
                />
              </Link>
            </div>
            </div>
          </div>
          </div>
          <div className="lav-hero-summary-row">
            <LavVerificationSummaryTable />
          </div>
        </div>
      </section>

      <section className="secured-assets" aria-labelledby="secured-assets-heading">
        <div className="av-site-container">
          <div className="sec-head lav-secured-assets-head">
            <h2 id="secured-assets-heading">We verify all secured assets</h2>
          </div>
          <ul className="secured-assets-grid">
            {SECURED_ASSET_TYPES.map(({ label, Icon }) => (
              <li key={label} className="secured-asset-card">
                <span className="secured-asset-icon" aria-hidden>
                  <Icon className="h-[22px] w-[22px]" strokeWidth={1.75} />
                </span>
                <span className="secured-asset-label">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="how" className="alt">
        <div className="av-site-container">
          <div className="sec-head">
            <span className="eyebrow">How it works</span>
            <h2>Three simple steps</h2>
          </div>
          <div className="grid g3 steps">
            <div className="card step">
              <h3>Book online</h3>
              <p>Enter the asset, vendor and lender details.</p>
            </div>
            <div className="card step">
              <h3>Vehicle owner, buyer or vendor completes it</h3>
              <p>
                We text them a secure link to complete the inspection on their
                phone, or send an inspector.
              </p>
            </div>
            <div className="card step">
              <h3>Get your report</h3>
              <p>
                Lender-ready report emailed to you and your nominated
                recipients.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="options">
        <div className="av-site-container">
          <div className="sec-head">
            <span className="eyebrow">Pricing</span>
            <h2>Choose your inspection</h2>
            <p>Check which method your lender accepts before booking.</p>
          </div>
          <div className="grid lav-pricing-grid">
            <div className="card opt featured">
              <span className="pill tag">Australia-wide</span>
              <h3>Digital Self Inspection</h3>
              <p>
                The vehicle owner, buyer or vendor completes a guided inspection
                on their phone.
              </p>
              <ul>
                <li>Secure SMS Link – No App Download Required</li>
                <li>
                  Photos confirming odometer, identifiers and condition
                </li>
                <li>
                  Vehicle make, model, badge, colour, build / compliance date
                  verified
                </li>
                <li>
                  Location geo tagged and inspection images date/time stamped
                </li>
              </ul>
              <div className="price">
                <b>$35</b> + GST per asset
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => bookingRef.current?.pickInspection("digital")}
              >
                Book Digital Self Inspection
              </button>
            </div>
            <div className="card opt featured">
              <span className="pill tag">Metro &amp; regional</span>
              <h3>Physical inspection</h3>
              <p>An Auto Verifi inspector verifies the asset in person.</p>
              <ul>
                <li>Inspector attends the asset</li>
                <li>Identifiers sighted &amp; photographed</li>
                <li>General condition verified</li>
              </ul>
              <div className="price">
                <b>$160</b> + GST per asset
              </div>
              <button
                type="button"
                className="btn btn-light"
                onClick={() => bookingRef.current?.pickInspection("physical")}
              >
                Book Physical Inspection
              </button>
            </div>
          </div>
          <p className="sec-head lav-sample-pdf-cta">
            <Link
              href={SAMPLE_PDF}
              className="btn btn-ghost"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download sample car report (PDF)
            </Link>
          </p>
        </div>
      </section>

      <section id="book">
        <div className="av-site-container booking">
          <div className="sec-head">
            <span className="eyebrow">Book now</span>
            <h2>Book an asset verification</h2>
          </div>
          <LenderBookingForm ref={bookingRef} />
        </div>
      </section>

      <section id="faq">
        <div className="av-site-container">
          <div className="sec-head">
            <h2>FAQs</h2>
          </div>
          <div className="faq">
            <details>
              <summary>
                Should I book a Digital Self Inspection or a physical inspection?
              </summary>
              <p>
                That depends on your lender&apos;s credit policy. A Digital Self
                Inspection is faster and works anywhere with mobile coverage,
                but some lenders require a physical inspection for certain
                asset types, ages or loan amounts. Please confirm before
                booking.
              </p>
            </details>
            <details>
              <summary>How does a Digital Self Inspection work?</summary>
              <p>
                We text the vendor a secure link. It opens in their phone&apos;s
                browser, with no app to download, and guides them through
                photographing the asset, its identifiers, odometer or hours,
                registration papers and their photo ID.
              </p>
            </details>
            <details>
              <summary>How many assets should I list?</summary>
              <p>
                List every part that carries its own identifier. A boat package
                is typically hull, motor(s) and trailer; a truck with a body or
                attachment that has its own serial is two assets. Incorrect
                listings can cause delays and additional charges.
              </p>
            </details>
            <details>
              <summary>How quickly will I get the report?</summary>
              <p>
                Reports are emailed on completion. Turnaround depends on when the
                inspection is completed.
              </p>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
}
