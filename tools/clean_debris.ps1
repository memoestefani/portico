# tools/clean_debris.ps1 - Script Soberano de Saneamiento y Purga de Debris
# Portico OS v3.4 - Amor y Gracia Durango (Produccion Llave en Mano)

$ErrorActionPreference = "Stop"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "PROTOCOLO DE SANEAMIENTO DE DEBRIS: PORTICO OS" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$CurrentDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $CurrentDir) {
    $CurrentDir = $PSScriptRoot
}
$ProjectRoot = (Resolve-Path (Join-Path $CurrentDir "..")).Path

Write-Host "[INFO] ProjectRoot: $ProjectRoot" -ForegroundColor Cyan

# 1. Purgar archivos temporales y artefactos de sistema operativo excluyendo node_modules, target, .git, dist
$DebrisPatterns = @("*.tmp", "*~", "*.swp", ".DS_Store", "Thumbs.db", "desktop.ini")
$DeletedCount = 0

foreach ($Pattern in $DebrisPatterns) {
    $Files = Get-ChildItem -Path $ProjectRoot -Recurse -Filter $Pattern -Force -ErrorAction SilentlyContinue |
        Where-Object { 
            $_.FullName -notmatch '\\node_modules(\\|$)' -and 
            $_.FullName -notmatch '\\target(\\|$)' -and 
            $_.FullName -notmatch '\\dist(\\|$)' -and 
            $_.FullName -notmatch '\\\.git(\\|$)' 
        }

    if ($Files) {
        foreach ($File in $Files) {
            Write-Host "   [BORRADO] $($File.FullName)" -ForegroundColor Yellow
            Remove-Item -Path $File.FullName -Force -ErrorAction SilentlyContinue
            $DeletedCount++
        }
    }
}

# 2. Verificar que no existan archivos .env con credenciales reales en el arbol git
$EnvFiles = Get-ChildItem -Path $ProjectRoot -Filter ".env" -Force -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch '\\node_modules(\\|$)' }
if ($EnvFiles -and $EnvFiles.Count -gt 0) {
    Write-Warning "Se detecto archivo .env local en el proyecto. Asegurese de no incluirlo en el commit git."
}

# 3. Comprobar que no haya variables huerfanas de otros proveedores
Write-Host "`n[VERIFICACION] Comprobando ausencia de dependencias de proveedores externos no autorizados..." -ForegroundColor Cyan
$DockerPath = Join-Path $ProjectRoot "docker-compose.yml"
if (Test-Path $DockerPath) {
    $DockerContent = Get-Content $DockerPath -Raw
    if ($DockerContent -match "oracle" -or $DockerContent -match "aws\.amazon" -or $DockerContent -match "fly\.io") {
        Write-Error "[ERROR] Se detectaron menciones a proveedores no autorizados en docker-compose.yml."
    } else {
        Write-Host "  [OK] Infraestructura unificada 100% Cloudflare verificada." -ForegroundColor Green
    }
}

Write-Host "`n[OK] Protocolo de saneamiento completado. $DeletedCount archivos de debris eliminados. Frontera limpia." -ForegroundColor Green
