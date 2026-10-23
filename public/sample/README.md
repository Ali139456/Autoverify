# Sample walkaround photos



`c300-hero.jpg` — black **Mercedes C300** (from `images/sample-sources/front-passenger.jpg`, matches **Front passenger side**).



`walkaround/*.jpg` — Mercedes C300 demo set. **Detail angles** (roof, windscreen, mirrors, boot open, registration papers) come from `images/sample-sources/` (Denise’s reference photos). **Exterior walkaround** uses `sample-sources` front/rear plus `images/image (6–15).png` for sides, wheels, dash, interior, keys.



Re-sync after image updates:



`powershell -File scripts/sync-sample-walkaround.ps1`



Do **not** point `image.png` or `image (1–5).png` at front angles in the sync script — those names are reserved for Denise’s detail-shot exports when placed in `sample-sources/`.



`damage/*.jpg` — AI damage evidence for the sample report (**front bumper** scuff, **rear left door** dent). Sources: `images/image (10).png`, `images/image (9).png`.



Live Insights+ reports use owner-captured photos, not these files.



# Sample PPSR certificate



Place the **redacted** AFSA “Serial Number Search Certificate” here so sample reports show a real certificate instead of the auto-generated placeholder.



**Filename (first match wins):**



- `ppsr-certificate.pdf`

- `ppsr-serial-number-search-certificate.pdf`

- `ppsr-certificate.png` (converted to a one-page PDF at runtime)



Use a copy with sensitive numbers redacted if you publish the repo. Paid reports still use live certificates from AutoGrab.


