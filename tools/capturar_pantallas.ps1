# ==============================================================================
# tools/capturar_pantallas.ps1
# Pórtico OS v3.5 — Ciclo 11: Captura Automatizada de Pantallas para Dossier
# ==============================================================================

[CmdletBinding()]
param(
    [string]$BaseUrl = "http://127.0.0.1:3000",
    [string]$OutputDir = "",
    [int]$Width = 1280,
    [int]$Height = 780
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($OutputDir)) {
    $OutputDir = Join-Path $PSScriptRoot "..\docs\assets\dossier"
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " Portico OS - Captura Automatizada de Vistas Pastorales" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Resolver ruta de Microsoft Edge
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

# 2. Asegurar directorio de salida
$resolvedOutputDir = [System.IO.Path]::GetFullPath($OutputDir)
if (-not (Test-Path $resolvedOutputDir)) {
    New-Item -ItemType Directory -Path $resolvedOutputDir -Force | Out-Null
}
Write-Host "[OK] Directorio de salida: $resolvedOutputDir" -ForegroundColor Green

# 3. Definicion de las 6 superficies del Dossier (Modo Claro Earthen Noble / Decision 1-B y 3-B)
$vistas = @(
    @{
        Nombre = "01_portico_publico.png"
        Url    = "$BaseUrl/?role=public&theme=light"
        Titulo = "01 El Portico Publico (Catalogo Abierto)"
    },
    @{
        Nombre = "02_privacidad_hogar.png"
        Url    = "$BaseUrl/?role=public&dev=true&theme=light"
        Titulo = "02 Privacidad del Hogar (Ficha Protegida)"
    },
    @{
        Nombre = "03_silo_miembro.png"
        Url    = "$BaseUrl/?role=member&dev=true&theme=light"
        Titulo = "03 El Silo del Miembro y Facilitador"
    },
    @{
        Nombre = "04_mesa_diacono.png"
        Url    = "$BaseUrl/?role=deacon&dev=true&theme=light"
        Titulo = "04 La Mesa Diaconal (Pases Fraternales)"
    },
    @{
        Nombre = "05_pastor_hud.png"
        Url    = "$BaseUrl/?role=pastor&dev=true&theme=light"
        Titulo = "05 El Radar Pastoral de Pastor Josh Gayosso"
    },
    @{
        Nombre = "06_soberania_datos.png"
        Url    = "$BaseUrl/?role=pastor&view=sovereignty&dev=true&theme=light"
        Titulo = "06 Soberania de Datos (Descarga 1-Clic)"
    }
)

Write-Host ""
Write-Host "Iniciando captura de vistas..." -ForegroundColor Yellow

$capturasGeneradas = 0

foreach ($v in $vistas) {
    $outPath = Join-Path $resolvedOutputDir $v.Nombre
    $titulo = $v.Titulo
    Write-Host " -> Capturando: $titulo..." -NoNewline

    $argsList = @(
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--force-prefers-color-scheme=light",
        "--window-size=$Width,$Height",
        "--virtual-time-budget=2500",
        "--screenshot=$outPath",
        $v.Url
    )

    $process = Start-Process -FilePath $edgeExe -ArgumentList $argsList -Wait -PassThru -WindowStyle Hidden

    if (Test-Path $outPath) {
        $fileInfo = Get-Item $outPath
        $sizeKb = [math]::Round($fileInfo.Length / 1KB, 1)
        Write-Host " [OK: $sizeKb KB]" -ForegroundColor Green
        $capturasGeneradas++
    } else {
        Write-Host " [FALLO]" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " Resumen: $capturasGeneradas/$($vistas.Count) capturas completadas." -ForegroundColor Cyan
Write-Host " Destino: $resolvedOutputDir" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
