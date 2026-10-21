# Copy Mercedes C300 sample assets into public/sample/walkaround.

# Run from repo root: powershell -File scripts/sync-sample-walkaround.ps1

#

# Denise detail shots (roof, windscreen, mirrors, boot, registration) live in

# images/sample-sources/ — do NOT reuse images/image.png or image (1–5).png for

# front angles; those filenames were repurposed for detail photos.



$root = Split-Path $PSScriptRoot -Parent

$src = Join-Path $root "images"

$detailSrc = Join-Path $src "sample-sources"

$dst = Join-Path $root "public\sample\walkaround"

$hero = Join-Path $root "public\sample\c300-hero.jpg"

$damageDir = Join-Path $root "public\sample\damage"



if (-not (Test-Path $src)) {

  Write-Error "Missing folder: $src"

  exit 1

}

New-Item -ItemType Directory -Force -Path $dst | Out-Null



function Copy-WalkaroundFile {

  param(

    [string]$DestName,

    [string[]]$SourceCandidates

  )

  foreach ($rel in $SourceCandidates) {

    $from = if ($rel -match "^sample-sources\\") {

      Join-Path $detailSrc ($rel -replace "^sample-sources\\", "")

    } elseif ($rel -match "^sample-sources/") {

      Join-Path $detailSrc ($rel -replace "^sample-sources/", "")

    } else {

      Join-Path $src $rel

    }

    if (Test-Path $from) {

      Copy-Item $from (Join-Path $dst $DestName) -Force

      Write-Host "OK $DestName <= $rel"

      return $true

    }

  }

  Write-Warning "Skip $DestName - none found: $($SourceCandidates -join ', ')"

  return $false

}



$map = @(

  @{ Dest = "front.jpg"; Sources = @("image (10).png", "sample-sources\front-centre.jpg") },

  @{ Dest = "front-left.jpg"; Sources = @("image (2).png", "sample-sources\front-passenger.jpg") },

  @{ Dest = "front-right.jpg"; Sources = @("image (1).png", "sample-sources\front-driver.jpg") },

  @{ Dest = "roof.jpg"; Sources = @("sample-sources\roof.png") },

  @{ Dest = "windscreen.jpg"; Sources = @("sample-sources\windscreen.png") },

  @{ Dest = "mirror-passenger.jpg"; Sources = @("sample-sources\mirror-passenger.png") },

  @{ Dest = "mirror-driver.jpg"; Sources = @("sample-sources\mirror-driver.png") },

  @{ Dest = "right-side.jpg"; Sources = @("image (15).png") },

  @{ Dest = "left-side.jpg"; Sources = @("image (14).png") },

  @{ Dest = "rear-right.jpg"; Sources = @("sample-sources\rear-right.jpg") },

  @{ Dest = "rear.jpg"; Sources = @("image (3).png", "sample-sources\rear-centre.jpg") },

  @{ Dest = "boot-open.jpg"; Sources = @("sample-sources\boot-open.png") },

  @{ Dest = "rear-left.jpg"; Sources = @("sample-sources\rear-left.jpg") },

  @{ Dest = "wheel-right-front.jpg"; Sources = @("image (6).png") },

  @{ Dest = "wheel-right-rear.jpg"; Sources = @("image (7).png") },

  @{ Dest = "wheel-left-front.jpg"; Sources = @("mercedes_front_left_wheel_small.jpg") },

  @{ Dest = "wheel-left-rear.jpg"; Sources = @("image (8).png") },

  @{ Dest = "interior-front.jpg"; Sources = @("mercedes_driver_interior_under_500kb.jpg") },

  @{ Dest = "interior-rear.jpg"; Sources = @("mercedes_c300_rear_interior_under_500kb.jpg") },

  @{ Dest = "odometer.jpg"; Sources = @("image (12).png") },

  @{ Dest = "keys.jpg"; Sources = @("image (13).png") },

  @{ Dest = "registration-papers.jpg"; Sources = @("sample-sources\registration-papers.png", "image (11).png") }

)



foreach ($entry in $map) {

  Copy-WalkaroundFile -DestName $entry.Dest -SourceCandidates $entry.Sources | Out-Null

}



$heroSrc = Join-Path $detailSrc "front-passenger.jpg"

if (Test-Path $heroSrc) {

  Copy-Item $heroSrc $hero -Force

  Write-Host "OK c300-hero.jpg"

}



New-Item -ItemType Directory -Force -Path $damageDir | Out-Null

$damageMap = @{

  "front-bumper.jpg"   = "image (10).png"

  "rear-left-door.jpg" = "image (9).png"

}

foreach ($dest in $damageMap.Keys) {

  $from = Join-Path $src $damageMap[$dest]

  if (Test-Path $from) {

    Copy-Item $from (Join-Path $damageDir $dest) -Force

    Write-Host "OK damage/$dest"

  }

}



Write-Host "Done."


