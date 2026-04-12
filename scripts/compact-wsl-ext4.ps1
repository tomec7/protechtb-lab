param(
  [Parameter(Mandatory = $false)]
  [string]$Distro = "Ubuntu",

  [Parameter(Mandatory = $false)]
  [switch]$SkipTrim
)

$ErrorActionPreference = "Stop"

function Get-Ext4VhdxPath {
  param([string]$DistroName)

  $candidates = Get-ChildItem "$env:LOCALAPPDATA\Packages" -Directory -ErrorAction SilentlyContinue |
    ForEach-Object {
      $vhdx = Join-Path $_.FullName "LocalState\ext4.vhdx"
      if (Test-Path $vhdx) {
        [PSCustomObject]@{ Package = $_.Name; Vhdx = $vhdx }
      }
    }

  if (-not $candidates) { return $null }

  $match = $candidates | Where-Object { $_.Package -match [Regex]::Escape($DistroName) } | Select-Object -First 1
  if ($match) { return $match.Vhdx }
  if ($candidates.Count -eq 1) { return $candidates[0].Vhdx }

  Write-Host "Nenasiel som jednoznacny ext4.vhdx pre distro '$DistroName'." -ForegroundColor Yellow
  $candidates | ForEach-Object { Write-Host " - $($_.Vhdx)" }
  return $null
}

function Supports-ManageArg {
  param([string]$Arg)
  $help = (& wsl --manage --help 2>&1 | Out-String)
  return $help -match [Regex]::Escape($Arg)
}

function Restart-OpenClaw {
  param([string]$DistroName)
  Write-Host "\n[restart] Startujem OpenClaw gateway vo WSL..." -ForegroundColor Green
  wsl -d $DistroName -- bash -lc "openclaw gateway start >/dev/null 2>&1 || true"
  wsl -d $DistroName -- bash -lc "openclaw gateway status | sed -n '1,18p'"
}

function Compact-VhdxWithDiskpart {
  param([string]$Vhdx)

  if (-not (Test-Path $Vhdx)) {
    Write-Host "Diskpart fallback: ext4.vhdx sa nenasiel: $Vhdx" -ForegroundColor Yellow
    return $false
  }

  $tmp = Join-Path $env:TEMP ("diskpart-compact-{0}.txt" -f ([guid]::NewGuid().ToString("N")))
  @(
    "select vdisk file=\"$Vhdx\"",
    "compact vdisk"
  ) | Set-Content -Path $tmp -Encoding ASCII

  Write-Host "\n[4b/5] Compact cez diskpart fallback..." -ForegroundColor Green
  $out = & diskpart /s $tmp 2>&1 | Out-String
  Remove-Item $tmp -Force -ErrorAction SilentlyContinue

  if ($LASTEXITCODE -ne 0) {
    Write-Host $out
    return $false
  }

  Write-Host $out
  return $true
}

Write-Host "=== WSL ext4.vhdx compact ===" -ForegroundColor Cyan
Write-Host "Distro: $Distro"

$vhdxPath = Get-Ext4VhdxPath -DistroName $Distro
if ($vhdxPath) {
  $before = (Get-Item $vhdxPath).Length
  Write-Host "Pred compact: $([math]::Round($before / 1GB, 2)) GB"
}

if (-not $SkipTrim) {
  Write-Host "\n[1/5] fstrim v distro (moze pytat sudo heslo)..." -ForegroundColor Green
  wsl -d $Distro -- bash -lc "sudo fstrim -av && sync"
}

Write-Host "\n[2/5] WSL shutdown..." -ForegroundColor Green
wsl --shutdown

$didCompact = $false

if (Supports-ManageArg "--set-sparse") {
  Write-Host "\n[3/5] Zapinam sparse rezim..." -ForegroundColor Green
  wsl --manage $Distro --set-sparse true
} else {
  Write-Host "\n[3/5] --set-sparse nepodporovany v tvojej verzii WSL (preskakujem)." -ForegroundColor Yellow
}

if (Supports-ManageArg "--compact") {
  Write-Host "\n[4/5] Compact ext4.vhdx cez wsl --manage --compact..." -ForegroundColor Green
  wsl --manage $Distro --compact
  $didCompact = $true
} else {
  Write-Host "\n[4/5] --compact nepodporovany v tvojej verzii WSL, skusam diskpart fallback..." -ForegroundColor Yellow
  $didCompact = Compact-VhdxWithDiskpart -Vhdx $vhdxPath
  if (-not $didCompact) {
    Write-Host "Diskpart fallback zlyhal. Odporucam aktualizovat WSL: wsl --update" -ForegroundColor Yellow
  }
}

if ($vhdxPath -and (Test-Path $vhdxPath)) {
  $after = (Get-Item $vhdxPath).Length
  $saved = $before - $after
  Write-Host "\nPo krokoch: $([math]::Round($after / 1GB, 2)) GB"
  Write-Host "Usetrene:   $([math]::Round($saved / 1GB, 2)) GB" -ForegroundColor Cyan
}

Write-Host "\n[5/5] Obnova OpenClaw po WSL shutdown..." -ForegroundColor Green
Restart-OpenClaw -DistroName $Distro

if (-not $didCompact) {
  Write-Host "\nPoznamka: realny compact sa neprebehol (nepodporovany argument vo WSL)." -ForegroundColor Yellow
}

Write-Host "\nHotovo." -ForegroundColor Cyan
