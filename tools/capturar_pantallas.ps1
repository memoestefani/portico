# ==============================================================================
# tools/capturar_pantallas.ps1
# Pórtico OS v3.5 — Ciclo 11: Captura Automatizada de Pantallas para Dossier
# ==============================================================================

[CmdletBinding()]
param(
    [string]$BaseUrl = "http://127.0.0.1:3000",
    [string]$OutputDir = "",
    [int]$Width = 1080,
    [int]$Height = 1600
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($OutputDir)) {
    $OutputDir = Join-Path $PSScriptRoot "..\docs\assets\dossier"
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " Portico OS - Captura Automatizada de Vistas Pastorales (Vertical)" -ForegroundColor Cyan
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

# 3. Definicion de las 14 superficies y modales operativos vivos (Modo Claro Earthen Noble, Vertical)
$vistas = @(
    @{
        Nombre = "01_portico_publico.png"
        Url    = "$BaseUrl/?role=public&theme=light"
        Titulo = "01 Portico Publico (Catalogo Abierto y Mapa de Durango)"
        Height = 1950
    },
    @{
        Nombre = "02_mi_perfil_elena.png"
        Url    = "$BaseUrl/?role=member&dev=true&theme=light"
        Titulo = "02 Superficie Mi Perfil (Elena Ramos: Conmutador, Micro-RSVP y Vida de Iglesia)"
        Height = 1600
    },
    @{
        Nombre = "02b_silo_living_card.png"
        Url    = "$BaseUrl/?role=leader&dev=true&theme=light"
        Titulo = "02b Living Card del Lider (Carlos Mendoza: Triada Celular y Censo)"
        Height = 1600
    },
    @{
        Nombre = "03_modal_sedes_flexibles.png"
        Url    = "$BaseUrl/?role=leader&dev=true&theme=light&modal=venue"
        Titulo = "03 Modal Editor Logistico de Sedes (Hogar Alterno, Hospital, Creso)"
        Height = 1500
    },
    @{
        Nombre = "04_modal_asignar_roles.png"
        Url    = "$BaseUrl/?role=leader&dev=true&theme=light&modal=memberPicker"
        Titulo = "04 Modal Sabana Tactil de Asignacion de Roles (Anfitrion y Aprendiz)"
        Height = 1600
    },
    @{
        Nombre = "05_modal_fision_dunbar.png"
        Url    = "$BaseUrl/?role=leader&dev=true&theme=light&modal=fission"
        Titulo = "05 Modal Fision Celular Dunbar (Aprendiz Lider y Nucleo Semilla)"
        Height = 1500
    },
    @{
        Nombre = "06_modal_armonizador_liturgico.png"
        Url    = "$BaseUrl/?role=leader&dev=true&theme=light&modal=harmonizer"
        Titulo = "06 Modal Armonizador Liturgico y Convivios Inter-Celulares"
        Height = 1500
    },
    @{
        Nombre = "07_modal_salvaguarda_crisis.png"
        Url    = "$BaseUrl/?role=leader&dev=true&theme=light&modal=safeguard"
        Titulo = "07 Modal Salvaguarda Pastoral (Alerta y Primeros Auxilios)"
        Height = 1500
    },
    @{
        Nombre = "08_modal_pase_qr.png"
        Url    = "$BaseUrl/?role=member&dev=true&theme=light&modal=pass"
        Titulo = "08 Modal Mi Perfil: Pase Comunitario QR y Ficha Social"
        Height = 1500
    },
    @{
        Nombre = "09_mesa_diacono.png"
        Url    = "$BaseUrl/?role=deacon&dev=true&theme=light"
        Titulo = "09 Mesa Diaconal (Pases Fraternales y Sabatico in situ a Familias)"
        Height = 1500
    },
    @{
        Nombre = "10_pastor_hud_radar.png"
        Url    = "$BaseUrl/?role=pastor&dev=true&theme=light"
        Titulo = "10 Radar Pastoral de Cuidado (Semaforo de Fatiga de Josh)"
        Height = 1500
    },
    @{
        Nombre = "11_pastor_anti_collision.png"
        Url    = "$BaseUrl/?role=pastor&tab=elders&dev=true&theme=light"
        Titulo = "11 Consola Anti-Colision de Josh (Desanonimizacion y Veto)"
        Height = 1500
    },
    @{
        Nombre = "12_modal_disciplina_pastoral.png"
        Url    = "$BaseUrl/?role=pastor&modal=discipline&dev=true&theme=light"
        Titulo = "12 Modal Disciplina Pastoral Colegiada (Regla de los 4 Ojos)"
        Height = 1500
    },
    @{
        Nombre = "13_soberania_datos.png"
        Url    = "$BaseUrl/?role=pastor&view=sovereignty&dev=true&theme=light"
        Titulo = "13 Soberania de Datos (Garantia No Strings Attached y Descarga ZIP)"
        Height = 1500
    }
)

Write-Host ""
Write-Host "Iniciando captura vertical de vistas..." -ForegroundColor Yellow

$capturasGeneradas = 0

foreach ($v in $vistas) {
    $outPath = Join-Path $resolvedOutputDir $v.Nombre
    $titulo = $v.Titulo
    $w = if ($v.ContainsKey("Width")) { $v.Width } else { $Width }
    $h = if ($v.ContainsKey("Height")) { $v.Height } else { $Height }
    $Width = $w
    $Height = $h
    Write-Host " -> Capturando: $titulo (${Width}x${Height})..." -NoNewline

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
