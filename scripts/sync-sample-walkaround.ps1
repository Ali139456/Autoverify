# Copy Denise's Mercedes C300 assets from ./images into public/sample walkaround.
# Run from repo root: powershell -File scripts/sync-sample-walkaround.ps1

$root = Split-Path $PSScriptRoot -Parent
$src = Join-Path $root "images"
$dst = Join-Path $root "public\sample\walkaround"
$hero = Join-Path $root "public\sample\c300-hero.jpg"
$damageDir = Join-Path $root "public\sample\damage"

if (-not (Test-Path $src)) {
  Write-Error "Missing folder: $src"
  exit 1
}
New-Item -ItemType Directory -Force -Path $dst | Out-Null

$map = @{
  "front.jpg"           = "image.png"
  "front-right.jpg"     = "image (1).png"
  "front-left.jpg"      = "image (2).png"
  "right-side.jpg"      = "image (9).png"
  "left-side.jpg"       = "image (5).png"
  "rear-right.jpg"      = "image (4).png"
  "rear.jpg"            = "image (3).png"
  "rear-left.jpg"       = "image (5).png"
  "wheel-right-front.jpg" = "image (6).png"
  "wheel-right-rear.jpg"  = "image (8).png"
  "wheel-left-front.jpg"  = "mercedes_front_left_wheel_small.jpg"
  "wheel-left-rear.jpg"   = "image (7).png"
  "interior-front.jpg"  = "mercedes_driver_interior_under_500kb.jpg"
  "interior-rear.jpg"   = "mercedes_c300_rear_interior_under_500kb.jpg"
  "odometer.jpg"        = "image (12).png"
  "keys.jpg"            = "image (13).png"
  "service-record.jpg"  = "image (11).png"
}

foreach ($dest in $map.Keys) {
  $from = Join-Path $src $map[$dest]
  if (-not (Test-Path $from)) {
    Write-Warning "Skip $dest — not found: $from"
    continue
  }
  Copy-Item $from (Join-Path $dst $dest) -Force
  Write-Host "OK $dest"
}

$heroSrc = Join-Path $src "image.png"
if (Test-Path $heroSrc) {
  Copy-Item $heroSrc $hero -Force
  Write-Host "OK c300-hero.jpg"
}

New-Item -ItemType Directory -Force -Path $damageDir | Out-Null
$damageMap = @{
  "front-bumper.jpg"    = "image (10).png"
  "rear-left-door.jpg"  = "image (9).png"
}
foreach ($dest in $damageMap.Keys) {
  $from = Join-Path $src $damageMap[$dest]
  if (Test-Path $from) {
    Copy-Item $from (Join-Path $damageDir $dest) -Force
    Write-Host "OK damage/$dest"
  }
}

Write-Host "Done."
