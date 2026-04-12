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
        [PSCustomObject]@{
          Package = $_.Name
          Vhdx    = $vhdx
        }
      }
    }

  if (-not $candidates) { return $null }

  $match = $candidates | Where-Object { $_.Package -match [Regex]::Escape($DistroName) } | Select-Object -First 1
  if ($match) { return $match.Vhdx }

  if ($candidates.Count -eq 1) { return $candidates[0].Vhdx }

  Write-Host "Nenašiel som jednoznačný ext4.vhdx pre distro '$DistroName'." -ForegroundColor Yellow
  Write-Host "Dostupné kandidáty:" -ForegroundColor Yellow
  $candidates | ForEach-Object { Write-Host " - $($_.Vhdx)" }
  return $null
}

Write-Host "=== WSL ext4.vhdx compact ===" -ForegroundColor Cyan
Write-Host "Distro: $Distro"

$vhdxPath = Get-Ext4VhdxPath -DistroName $Distro
if ($vhdxPath) {
  $before = (Get-Item $vhdxPath).Length
  Write-Host "Pred compact: $([math]::Round($before / 1GB, 2)) GB"
}

if (-not $SkipTrim) {
  Write-Host "\n[1/4] fstrim v distro (môže pýtať sudo heslo)..." -ForegroundColor Green
  wsl -d $Distro -- bash -lc "sudo fstrim -av && sync"
}

Write-Host "\n[2/4] WSL shutdown..." -ForegroundColor Green
wsl --shutdown

Write-Host "\n[3/4] Zapínam sparse režim..." -ForegroundColor Green
wsl --manage $Distro --set-sparse true

Write-Host "\n[4/4] Compact ext4.vhdx..." -ForegroundColor Green
wsl --manage $Distro --compact

if ($vhdxPath -and (Test-Path $vhdxPath)) {
  $after = (Get-Item $vhdxPath).Length
  $saved = $before - $after
  Write-Host "\nPo compact: $([math]::Round($after / 1GB, 2)) GB"
  Write-Host "Ušetrené:   $([math]::Round($saved / 1GB, 2)) GB" -ForegroundColor Cyan
}

Write-Host "\nHotovo."
