"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import {
  LenderBookingForm,
  type LenderBookingFormHandle,
} from "./LenderBookingForm";
import "./lender-asset-verification.css";

const SAMPLE_PDF = "/samples/lender-asset-verification-car-sample.pdf";

export function LenderAssetVerificationSite() {
  const bookingRef = useRef<LenderBookingFormHandle>(null);

  return (
    <div className="lav w-full min-w-0 max-w-full overflow-x-clip">
      <section className="hero">
        <div className="av-site-container hero-grid lg:grid-cols-2">
          <div className="relative min-w-0 text-center lg:text-left">
            <span className="eyebrow">For lenders, brokers &amp; introducers</span>
            <h1 className="text-3xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-[2.65rem] lg:leading-[1.06]">
              Lender asset verification{" "}
              <span className="text-accent-500">
                verified in minutes Australia-wide
              </span>
            </h1>
            <p className="lead mx-auto mt-4 max-w-xl text-base text-slate-400 sm:mt-5 sm:text-lg lg:mx-0">
              We verify asset existence, vehicle identifiers and confirm current
              condition.
            </p>
            <div className="lav-hero-ctas mx-auto mt-6 grid w-full max-w-xl grid-cols-1 gap-2 sm:mt-8 sm:grid-cols-2 sm:gap-2 lg:mx-0">
              <a
                href="#book"
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
          <div className="hero-visual relative mx-auto w-full min-w-0 max-w-[320px] sm:max-w-[420px] lg:mx-0 lg:max-w-[500px]">
            <div className="frame" aria-hidden="true">
              <span className="c tl" />
              <span className="c tr" />
              <span className="c bl" />
              <span className="c br" />
              <div className="ring" />
              <div className="floor" />
              <div className="mini-report">
                <div className="t">
                  Verification summary – Digital Self Inspection
                </div>
                <div className="row">
                  <span>Vehicle verification</span>
                  <span className="pill">Key identifiers matched</span>
                </div>
                <div className="row">
                  <span>Odometer captured</span>
                  <span className="pill">Yes</span>
                </div>
                <div className="row">
                  <span>Photos</span>
                  <span className="v">Date &amp; time stamped images</span>
                </div>
                <div className="row">
                  <span>Condition</span>
                  <span className="v">Verified using AI damage detection</span>
                </div>
                <div className="row">
                  <span>Report delivered</span>
                  <span className="v">Real time</span>
                </div>
              </div>
            </div>
          </div>
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
          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
              maxWidth: 900,
              margin: "0 auto",
            }}
          >
            <div className="card opt featured">
              <span className="pill tag">Australia-wide</span>
              <h3>Digital Self Inspection</h3>
              <p>
                The vehicle owner, buyer or vendor completes a guided inspection
                on their phone.
              </p>
              <ul>
                <li>Completed on their phone — no app download</li>
                <li>Photos, identifiers, odometer &amp; ID</li>
                <li>Reviewed by Auto Verifi</li>
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
            <div className="card opt">
              <span className="pill tag">Metro &amp; regional</span>
              <h3>Physical inspection</h3>
              <p>An Auto Verifi inspector verifies the asset in person.</p>
              <ul>
                <li>Inspector attends the asset</li>
                <li>Identifiers sighted &amp; photographed</li>
                <li>General condition verified</li>
              </ul>
              <div className="price">
                <b>$120</b> + GST per asset
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
            <p>
              Takes about three minutes. Fields marked{" "}
              <span style={{ color: "var(--blue-h)" }}>*</span> are required.
            </p>
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
                Inspection ($35 + GST) is faster and works anywhere with mobile
                coverage, but some lenders require a physical inspection ($120 +
                GST) for certain asset types, ages or loan amounts. Please
                confirm before booking.
              </p>
            </details>
            <details>
              <summary>How does a Digital Self Inspection work?</summary>
              <p>
                We text the vendor a secure link. It opens in their phone&apos;s
                browser, with no app to download, and guides them through
                photographing the asset, its identifiers, odometer or hour meter,
                and their photo ID. Our team reviews the submission, follows up
                if anything is missing, then issues the report.
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
                Reports are emailed on completion, typically within hours of the
                inspection. Turnaround depends on when the inspection is
                completed.
              </p>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
}
