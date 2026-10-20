# Sample walkaround photos

`c300-hero.jpg` — black **Mercedes C300** (from repo `images/`, matches `front-left.jpg`).

`walkaround/*.jpg` — same **C300 photo set** as `autoverifi-app/images/` (Denise’s sample shoot: front / sides / rear / wheels / dash / interior). **Side body** tiles use full-car shots (`image (4).png` right, `image (2).png` left); `image (9).png` is only for damage evidence. Re-sync after image updates:

`powershell -File scripts/sync-sample-walkaround.ps1`

`walkaround/roof.jpg`, `windscreen.jpg`, `mirror-passenger.jpg`, `mirror-driver.jpg`, `boot-open.jpg` — Denise C300 detail shots (also under `images/` when synced).

`walkaround/keys.jpg`, `walkaround/registration-papers.jpg` — **# Keys** and **Registration papers** (sources: `image (13).png`, `image (11).png`).

`damage/*.jpg` — AI damage evidence for the sample report (**front bumper** scuff, **rear left door** dent). Sources: `images/image (10).png`, `images/image (9).png`.

Live Insights+ reports use owner-captured photos, not these files.

# Sample PPSR certificate

Place the **redacted** AFSA “Serial Number Search Certificate” here so sample reports show a real certificate instead of the auto-generated placeholder.

**Filename (first match wins):**

- `ppsr-certificate.pdf`
- `ppsr-serial-number-search-certificate.pdf`
- `ppsr-certificate.png` (converted to a one-page PDF at runtime)

Use a copy with sensitive numbers redacted if you publish the repo. Paid reports still use live certificates from AutoGrab.
