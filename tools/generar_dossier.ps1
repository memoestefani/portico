# ==============================================================================
# tools/generar_dossier.ps1
# Pórtico OS v3.7 — Generador Nativo de Cuaderno Público y Dossier Pastoral en PDF
# ==============================================================================
# Propósito: Compilar la plantilla editorial pública (docs/dossier_publico.html)
# o el expediente técnico interno (docs/dossier_pastoral.html) a PDF de alta resolución.
# Cero dependencias externas (usa el motor oficial de Microsoft Edge en Windows).
# ==============================================================================

[CmdletBinding()]
param(
    [string]$InputHtml = "",
    [string]$OutputPdf = "",
    [ValidateSet("Public", "Pastoral", "All")]
    [string]$Type = "Public"
)

$ErrorActionPreference = "Stop"

$dossiersDir = Join-Path $PSScriptRoot "..\docs\dossiers"
if (-not (Test-Path $dossiersDir)) {
    New-Item -ItemType Directory -Path $dossiersDir -Force | Out-Null
}

$canonicalPdfPath = Join-Path $PSScriptRoot "..\docs\Dossier_Pastoral_Portico_Amor_y_Gracia.pdf"
$canonicalUniversalPdfPath = Join-Path $PSScriptRoot "..\docs\Dossier_Pastoral_Portico.pdf"
$canonicalPublicPdfPath = Join-Path $PSScriptRoot "..\docs\Dossier_Portico_Publico.pdf"

# 1. Resolver ejecutable de Microsoft Edge
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

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " Portico OS - Generador Editorial de Documentos PDF" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "[OK] Motor detectado: $edgeExe" -ForegroundColor Green

function Invoke-EdgePdfCompile {
    param(
        [string]$HtmlSource,
        [string]$PdfTarget
    )

    $resolvedSource = [System.IO.Path]::GetFullPath($HtmlSource)
    $resolvedTarget = [System.IO.Path]::GetFullPath($PdfTarget)

    if (-not (Test-Path $resolvedSource)) {
        Write-Error "No se encontro la plantilla HTML en: $resolvedSource"
        return $false
    }

    $targetDir = Split-Path -Parent $resolvedTarget
    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }

    $inputUri = "file:///" + ($resolvedSource -replace "\\", "/")
    $tempProfile = Join-Path $env:TEMP ("edge_pdf_" + [Guid]::NewGuid().ToString("N"))
    $argsList = @(
        "--headless=new",
        "--disable-gpu",
        "--user-data-dir=$tempProfile",
        "--no-pdf-header-footer",
        "--print-to-pdf=$resolvedTarget",
        $inputUri
    )

    Start-Process -FilePath $edgeExe -ArgumentList $argsList -Wait -WindowStyle Hidden

    if (Test-Path $tempProfile) {
        Remove-Item -Recurse -Force $tempProfile -ErrorAction SilentlyContinue
    }

    if (Test-Path $resolvedTarget) {
        $fileInfo = Get-Item $resolvedTarget
        $sizeKb = [math]::Round($fileInfo.Length / 1KB, 1)
        Write-Host "[OK] Compilado con exito: $resolvedTarget (${sizeKb} KB)" -ForegroundColor Green
        return $true
    } else {
        Write-Error "Fallo la generacion de $resolvedTarget"
        return $false
    }
}

$todayStr = (Get-Date).ToString("yyyy-MM-dd")

if ($Type -eq "Pastoral" -or $Type -eq "All") {
    $existingToday = Get-ChildItem -Path $dossiersDir -Filter "${todayStr}_v-*_Dossier_Pastoral_Josh_Gayosso.pdf" -ErrorAction SilentlyContinue
    $nextVersion = 1
    if ($existingToday) {
        $versions = @()
        foreach ($f in $existingToday) {
            if ($f.Name -match "${todayStr}_v-(\d+)_") {
                $versions += [int]$matches[1]
            }
        }
        if ($versions.Count -gt 0) {
            $nextVersion = ($versions | Measure-Object -Maximum).Maximum + 1
        }
    }
    $versionedFileName = "${todayStr}_v-${nextVersion}_Dossier_Pastoral_Josh_Gayosso.pdf"
    $pastoralOutputPdf = if (-not [string]::IsNullOrWhiteSpace($OutputPdf) -and $Type -eq "Pastoral") { $OutputPdf } else { Join-Path $dossiersDir $versionedFileName }
    $pastoralInputHtml = if (-not [string]::IsNullOrWhiteSpace($InputHtml) -and $Type -eq "Pastoral") { $InputHtml } else { Join-Path $PSScriptRoot "..\docs\dossier_pastoral.html" }

    Write-Host ""
    Write-Host "Compilando Dossier Pastoral Interno (15 Paginas)..." -ForegroundColor Yellow
    $success = Invoke-EdgePdfCompile -HtmlSource $pastoralInputHtml -PdfTarget $pastoralOutputPdf
    if ($success) {
        $resolvedOutputPdf = [System.IO.Path]::GetFullPath($pastoralOutputPdf)
        Copy-Item -Path $resolvedOutputPdf -Destination $canonicalPdfPath -Force
        Copy-Item -Path $resolvedOutputPdf -Destination $canonicalUniversalPdfPath -Force
        Write-Host "Copia Pastoral Canonica actualizada en: $canonicalUniversalPdfPath" -ForegroundColor Green
        Write-Host " Listo para adjuntar y enviar por WhatsApp a Pastor Josh Gayosso." -ForegroundColor Cyan
    }
}

if ($Type -eq "Public" -or $Type -eq "All") {
    $existingPublicToday = Get-ChildItem -Path $dossiersDir -Filter "${todayStr}_v-*_Dossier_Portico_Publico.pdf" -ErrorAction SilentlyContinue
    $nextPubVersion = 1
    if ($existingPublicToday) {
        $pubVersions = @()
        foreach ($f in $existingPublicToday) {
            if ($f.Name -match "${todayStr}_v-(\d+)_") {
                $pubVersions += [int]$matches[1]
            }
        }
        if ($pubVersions.Count -gt 0) {
            $nextPubVersion = ($pubVersions | Measure-Object -Maximum).Maximum + 1
        }
    }
    $versionedPublicFileName = "${todayStr}_v-${nextPubVersion}_Dossier_Portico_Publico.pdf"
    $publicOutputPdf = if (-not [string]::IsNullOrWhiteSpace($OutputPdf) -and $Type -eq "Public") { $OutputPdf } else { Join-Path $dossiersDir $versionedPublicFileName }
    $publicInputHtml = if (-not [string]::IsNullOrWhiteSpace($InputHtml) -and $Type -eq "Public") { $InputHtml } else { Join-Path $PSScriptRoot "..\docs\dossier_publico.html" }

    Write-Host ""
    Write-Host "Compilando Cuaderno Editorial Publico (3 Paginas)..." -ForegroundColor Yellow
    $successPub = Invoke-EdgePdfCompile -HtmlSource $publicInputHtml -PdfTarget $publicOutputPdf
    if ($successPub) {
        $resolvedPubPdf = [System.IO.Path]::GetFullPath($publicOutputPdf)
        Copy-Item -Path $resolvedPubPdf -Destination $canonicalPublicPdfPath -Force
        Write-Host "Copia Publica Canonica actualizada en: $canonicalPublicPdfPath" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " Proceso editorial finalizado con exito." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
