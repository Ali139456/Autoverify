# Google Ads — Sydney pre-purchase inspections

Use after the sample PDF and `/sydneyprepurchase` are live on production.

## Campaign

| Setting | Value |
|--------|--------|
| **Campaign name** | AV \| Sydney \| Pre-purchase inspection |
| **Goal** | Leads / website bookings |
| **Networks** | Search only (no Display, no Search Partners initially) |
| **Location** | Sydney NSW + 30–50 km radius (or postcodes 2000–2234 + key outer Sydney) |
| **Language** | English |
| **Bid strategy** | Maximize conversions (after 15–20 bookings) or Maximize clicks with CPC cap while learning |
| **Daily budget (starter)** | $30–50/day — adjust with Denise |
| **Final URL** | `https://www.autoverifi.com.au/sydneyprepurchase` |
| **Path 1 / 2** | `pre-purchase` / `sydney` |

## Conversions to track

1. **Primary:** Stripe booking completed — success URL  
   `https://www.autoverifi.com.au/inspections/pre-purchase/booking/success`
2. **Secondary:** Click-to-call `1300 001 273`
3. **Secondary:** Scroll to `#book` or “Book inspection” button click (optional GTM event)

## Ad groups (Search)

### 1. Pre-purchase inspection (core)

**Keywords (phrase + exact):**

- "pre purchase car inspection sydney"
- "pre purchase inspection sydney"
- "mobile pre purchase inspection sydney"
- "used car inspection sydney"
- "car inspection before buying sydney"
- "ppi car inspection sydney"

**Negatives (campaign):** free, job, course, become inspector, RACQ, NRMA mechanic jobs, DIY

**Responsive search ad — headlines (pick 10–15):**

- Pre-Purchase Car Inspection Sydney
- Mobile Inspection At The Seller
- Book Online — Same-Day Report
- From $290 Incl. GST
- Photo-Backed Digital Report
- Independent Auto Verifi Inspectors
- Sydney-Wide Mobile Service
- Check Before You Buy
- Utes, SUVs, EVs & Caravans
- Road Test Where Permitted

**Descriptions:**

- Qualified inspector attends the vehicle. Mechanical, body and interior checked. Digital report with photos.
- Book online in minutes. We inspect at the seller's address across Sydney. Transparent pricing from $290 incl. GST.
- Download a sample report on our site. Buy with confidence before you commit.

### 2. Used car / private sale

**Keywords:**

- "inspect used car before purchase sydney"
- "private sale car inspection sydney"
- "second hand car check sydney"

Reuse core RSA with headline tweaks: “Private Sale & Dealer Inspections”.

### 3. Brand

**Keywords (exact):**

- auto verifi
- autoverifi
- auto verifi inspection

**Headlines:** Auto Verifi \| Official Site, Pre-Purchase Inspections Sydney

## Assets (account level)

**Call extension:** 1300 001 273  
**Sitelinks:**

| Text | URL |
|------|-----|
| Book inspection | `https://www.autoverifi.com.au/sydneyprepurchase#book` |
| Sample report (PDF) | `https://www.autoverifi.com.au/samples/pre-purchase-inspection-sample.pdf` |
| What we check | `https://www.autoverifi.com.au/sydneyprepurchase` (FAQ section) |
| General pre-purchase page | `https://www.autoverifi.com.au/inspections/pre-purchase` |

**Callouts:** Same-day digital report · Mobile at seller · Independent inspectors · Sydney-wide  
**Structured snippets:** Types: Passenger, Ute, EV, Caravan, Motorcycle

## Launch checklist

- [ ] Landing page loads without Coming Soon (or use preview only for QA)
- [ ] Sample PDF URL returns 200
- [ ] Booking form + Stripe test payment
- [ ] Conversion tag on success page
- [ ] GA4 linked to Google Ads

## Notes for Denise

- Sample PPI report is **not** the online Insights report — it's the mobile inspection PDF (`pre-purchase-inspection-sample.pdf`).
- Insights sample remains at `/sample-report` for the digital rego-check product.