# ==============================================================================
# tools/generar_dossier.ps1
# Pórtico OS v3.5 — Ciclo 11: Generador Nativo de Dossier Pastoral en PDF
# ==============================================================================
# Propósito: Compilar la plantilla editorial docs/dossier_pastoral.html a un
# PDF horizontal de alta resolución listo para enviar por WhatsApp a Pastor Josh.
# Cero dependencias externas (usa el motor oficial de Microsoft Edge en Windows).
# ==============================================================================

[CmdletBinding()]
param(
    [string]$InputHtml = "",
    [string]$OutputPdf = ""
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($InputHtml)) {
    $InputHtml = Join-Path $PSScriptRoot "..\docs\dossier_pastoral.html"
}

if ([string]::IsNullOrWhiteSpace($OutputPdf)) {
    $OutputPdf = Join-Path $PSScriptRoot "..\docs\Dossier_Pastoral_Portico_Amor_y_Gracia.pdf"
}

$resolvedInputHtml = [System.IO.Path]::GetFullPath($InputHtml)
$resolvedOutputPdf = [System.IO.Path]::GetFullPath($OutputPdf)

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " Portico OS - Generador de Dossier Pastoral Ejecutivo" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Validar que exista la plantilla HTML
if (-not (Test-Path $resolvedInputHtml)) {
    Write-Error "No se encontro la plantilla HTML en: $resolvedInputHtml"
    exit 1
}

# 2. Resolver ruta de Microsoft Edge
$edgePaths = @(
    "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    "$env:LOCALAPPDATA\Microsoft\Edge\Application\msedge.exe"
)

$edgeExe = $null
foreach ($p in $edgePaths) {
    if (Test-Path $p) {
        $edgeExe = $p
        break
    }
}

if (-not $edgeExe) {
    $cmd = Get-Command msedge -ErrorAction SilentlyContinue
    if ($cmd) {
        $edgeExe = $cmd.Source
    }
}

if (-not $edgeExe) {
    Write-Error "No se encontro el ejecutable de Microsoft Edge en el sistema."
    exit 1
}

Write-Host "[OK] Motor detectado: $edgeExe" -ForegroundColor Green
Write-Host "[OK] Plantilla origen: $resolvedInputHtml" -ForegroundColor Green
Write-Host "[OK] Archivo destino: $resolvedOutputPdf" -ForegroundColor Green

# 3. Asegurar directorio destino
$outputDir = Split-Path -Parent $resolvedOutputPdf
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
}

# 4. Formatear URL de archivo local para Edge
$inputUri = "file:///" + ($resolvedInputHtml -replace "\\", "/")

Write-Host ""
Write-Host "Compilando PDF editorial en modo Headless..." -ForegroundColor Yellow

$argsList = @(
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    "--print-to-pdf=$resolvedOutputPdf",
    $inputUri
)

$proc = Start-Process -FilePath $edgeExe -ArgumentList $argsList -Wait -PassThru -WindowStyle Hidden

if (Test-Path $resolvedOutputPdf) {
    $fileInfo = Get-Item $resolvedOutputPdf
    $sizeKb = [math]::Round($fileInfo.Length / 1KB, 1)
    $sizeMb = [math]::Round($fileInfo.Length / 1MB, 2)
    
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host " [EXITO] Dossier Pastoral generado correctamente!" -ForegroundColor Green
    Write-Host " Archivo: $resolvedOutputPdf" -ForegroundColor Green
    Write-Host " Peso: ${sizeKb} KB (${sizeMb} MB)" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host " Listo para adjuntar y enviar por WhatsApp a Pastor Josh." -ForegroundColor Cyan
} else {
    Write-Error "Fallo la generacion del archivo PDF."
    exit 1
}
