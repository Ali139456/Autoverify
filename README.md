# Auto Verifi

Car history, market valuation and AI future-insight reports for Australian vehicles.
Users enter a registration plate, pay via Stripe, and instantly receive a full
online report with a downloadable PDF.

Built with **Next.js (App Router) + TypeScript + Tailwind CSS**.

## Features

- **Rego lookup** — instant vehicle identification from plate + state (Autograb API)
- **History checks** — registration status, PPSR/finance owing, write-off and stolen records
- **Live valuation** — trade-in, private sale and dealer retail ranges + market comparables
- **AI future insights** — risk score, risk factors, 5-year depreciation forecast, 3-year residual value
- **AI photo damage analysis** — upload photos, Ravin.ai detects panel damage with repair estimates
- **Stripe payments** — secure one-off checkout, webhook + on-return payment verification
- **PDF reports** — professionally designed 2-page PDF generated server-side
- **SEO ready** — metadata, Open Graph, sitemap.xml, robots.txt, targets "car history", "PPSR", "car facts", "history checks"
- **Fully mobile optimized**

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your keys
npm run dev
```

Open http://localhost:3000.

### Demo mode

The app runs fully **without any API keys**:

- No `STRIPE_SECRET_KEY` → payment is skipped and reports unlock immediately.
- No `AUTOGRAB_API_KEY` → deterministic demo vehicle data is generated per plate.
- No `RAVIN_API_KEY` → demo damage findings are generated for uploaded photos.

This lets you exercise the whole journey (search → preview → checkout → report → PDF)
before any provider accounts are set up.

### Going live

1. **Stripe** — set `STRIPE_SECRET_KEY`, then add a webhook endpoint pointing to
   `https://yourdomain.com/api/webhooks/stripe` for the `checkout.session.completed`
   event and set `STRIPE_WEBHOOK_SECRET`. (Payment is also verified on the success
   redirect, so reports unlock even if the webhook is delayed.)
2. **Autograb** — set `AUTOGRAB_API_KEY` (and `AUTOGRAB_BASE_URL` if your account
   uses a different endpoint). Adjust the response mapping in `src/lib/autograb.ts`
   to your subscribed Autograb products if field names differ.
3. **Ravin.ai** — set `RAVIN_API_KEY` and confirm the inspection endpoints in
   `src/lib/ravin.ts` against your Ravin.ai contract.
4. **Base URL** — set `NEXT_PUBLIC_BASE_URL=https://yourdomain.com`.

### Deployment (SiteGround or any Node host)

```bash
npm run build
npm run start   # serves on port 3000 (set PORT to change)
```

On SiteGround, use a Node.js-capable plan (Cloud) or reverse-proxy to the Node
process. Reports are stored as JSON files under `data/reports/` — make sure that
directory is writable and persisted. For higher volume, swap `src/lib/store.ts`
for a database (the store is 4 small functions).

## Project structure

```
src/
  app/
    page.tsx                    # Homepage (hero, features, how it works, FAQ)
    pricing/page.tsx            # Pricing page
    check/page.tsx              # Free vehicle preview + pay CTA
    report/[id]/page.tsx        # Full report (post-payment)
    checkout/success/page.tsx   # Stripe return URL, verifies payment
    api/
      checkout/route.ts         # Creates Stripe Checkout session
      webhooks/stripe/route.ts  # Stripe webhook (checkout.session.completed)
      damage/analyze/route.ts   # Photo upload -> Ravin.ai analysis
      report/[id]/pdf/route.ts  # PDF generation & download
    sitemap.ts / robots.ts      # SEO
  components/                   # Header, Footer, search form, pay button, uploader
  lib/
    autograb.ts                 # Autograb client + demo fallback + AI insights
    ravin.ts                    # Ravin.ai client + demo fallback
    stripe.ts                   # Stripe helpers & pricing config
    pdf.tsx                     # PDF report layout (@react-pdf/renderer)
    store.ts                    # File-based report store (swap for DB later)
    types.ts                    # Shared types
```

## Future expansion (NZ / UK / US)

`lookupVehicle()` in `src/lib/autograb.ts` is the single entry point for vehicle
data. To add a new country, add a country/provider switch there and extend the
state selector in `src/components/RegoSearchForm.tsx`.
