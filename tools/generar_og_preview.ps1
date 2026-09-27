# ==============================================================================
# tools/generar_og_preview.ps1
# Pórtico OS v3.7 — Generador de Tarjeta Gráfica de Previsualización Social (Open Graph)
# ==============================================================================
# Propósito: Generar la tarjeta canónica docs/og.png de 1200x630 px.
# Estética: Ultra-elegante, minimalista, noble, tipografía clásica, pocas palabras.
# Cero URLs personales o de dominio en la imagen.
# ==============================================================================

Add-Type -AssemblyName System.Drawing

$width = 1200
$height = 630

$bmp = New-Object System.Drawing.Bitmap($width, $height)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# 1. Fondo pergamino cálido noble (#FAF8F5)
$bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(250, 248, 245))
$g.FillRectangle($bgBrush, 0, 0, $width, $height)
$bgBrush.Dispose()

# 2. Marco editorial doble clásico, sutil y fino
$outerBorderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(226, 219, 209), 1.2)
$g.DrawRectangle($outerBorderPen, 20, 20, $width - 40, $height - 40)
$outerBorderPen.Dispose()

$innerBorderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(240, 236, 230), 1.0)
$g.DrawRectangle($innerBorderPen, 26, 26, $width - 52, $height - 52)
$innerBorderPen.Dispose()

# 3. Panel derecho: Captura de la interfaz de Pórtico Público en tarjeta flotante
$croppedImgPath = Join-Path $PSScriptRoot "..\docs\assets\dossier\portico_publico_catalogo_recortado.png"
if (Test-Path $croppedImgPath) {
    $rawImg = [System.Drawing.Image]::FromFile((Resolve-Path $croppedImgPath).Path)
    
    # Destino: x: 550 a 1130, y: 55 a 575
    $panelX = 550
    $panelY = 55
    $panelW = 585
    $panelH = 520
    
    # Sombra suave de elevación
    $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(14, 0, 0, 0))
    $g.FillRectangle($shadowBrush, ($panelX + 4), ($panelY + 4), $panelW, $panelH)
    $shadowBrush.Dispose()

    # Lienzo blanco de la tarjeta
    $panelCardBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.FillRectangle($panelCardBrush, $panelX, $panelY, $panelW, $panelH)
    $panelCardBrush.Dispose()

    # Borde exterior fino
    $panelBorderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(218, 210, 200), 1.0)
    $g.DrawRectangle($panelBorderPen, $panelX, $panelY, $panelW, $panelH)
    $panelBorderPen.Dispose()

    # Inset para la imagen
    $insetX = $panelX + 6
    $insetY = $panelY + 6
    $insetW = $panelW - 12
    $insetH = $panelH - 12

    $srcRect = New-Object System.Drawing.Rectangle(0, 0, $rawImg.Width, [math]::Min($rawImg.Height, 630))
    $destRect = New-Object System.Drawing.Rectangle($insetX, $insetY, $insetW, $insetH)
    $g.DrawImage($rawImg, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

    $innerCardPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(235, 230, 222), 1.0)
    $g.DrawRectangle($innerCardPen, $insetX, $insetY, $insetW, $insetH)
    $innerCardPen.Dispose()

    $rawImg.Dispose()
}

# 4. Textos esenciales, sobrios y sin sobrecarga
$cAcuteO = [char]0x00F3 # ó
$cAcuteA = [char]0x00E1 # á
$cAcuteI = [char]0x00ED # í
$cDot    = [char]0x00B7 # ·
$cStar   = [char]0x2726 # ✦

# 4.1 Marca superior refinada (sin caja pesada)
$fontLabel = New-Object System.Drawing.Font("Georgia", 10.5, [System.Drawing.FontStyle]::Regular)
$labelBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(147, 67, 47))
$g.DrawString("P ${cAcuteO} R T I C O", $fontLabel, $labelBrush, 75, 95)
$labelBrush.Dispose()
$fontLabel.Dispose()

# 4.2 Título noble, clásico y sereno
$fontTitle = New-Object System.Drawing.Font("Georgia", 38, [System.Drawing.FontStyle]::Bold)
$titleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(35, 31, 29))
$g.DrawString("Casas abiertas", $fontTitle, $titleBrush, 70, 135)
$g.DrawString("para la ciudad", $fontTitle, $titleBrush, 70, 192)
$titleBrush.Dispose()
$fontTitle.Dispose()

# 4.3 Fina línea terracota
$linePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(147, 67, 47), 2.0)
$g.DrawLine($linePen, 75, 268, 145, 268)
$linePen.Dispose()

# 4.4 Una sola frase esencial y humilde
$fontPhrase = New-Object System.Drawing.Font("Georgia", 16.0, [System.Drawing.FontStyle]::Italic)
$phraseBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(83, 92, 110))
$g.DrawString("Hospitalidad y vida comunitaria", $fontPhrase, $phraseBrush, 72, 295)
$g.DrawString("en los hogares de tu vecindario.", $fontPhrase, $phraseBrush, 72, 328)
$phraseBrush.Dispose()
$fontPhrase.Dispose()

# 4.5 Descripción breve en prosa clara
$fontBody = New-Object System.Drawing.Font("Arial", 12.0, [System.Drawing.FontStyle]::Regular)
$bodyBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(120, 115, 108))
$g.DrawString("Reuniones semanales en casas, cuidando", $fontBody, $bodyBrush, 75, 390)
$g.DrawString("el descanso de las familias anfitrionas.", $fontBody, $bodyBrush, 75, 416)
$bodyBrush.Dispose()
$fontBody.Dispose()

# 4.6 Fila sutil al pie (valores esenciales)
$fontFoot = New-Object System.Drawing.Font("Georgia", 11.5, [System.Drawing.FontStyle]::Regular)
$footBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(147, 67, 47))
$footStr = "Cercan${cAcuteI}a   $cDot   Descanso   $cDot   Comunidad"
$g.DrawString($footStr, $fontFoot, $footBrush, 75, 510)
$footBrush.Dispose()
$fontFoot.Dispose()

$g.Dispose()

# 5. Guardar en docs/og.png y docs/assets/og.png
$outPath = Join-Path $PSScriptRoot "..\docs\og.png"
$outAssetPath = Join-Path $PSScriptRoot "..\docs\assets\og.png"

$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save($outAssetPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

$item = Get-Item $outPath
$sizeKb = [math]::Round($item.Length / 1KB, 1)
Write-Host "============================================================" -ForegroundColor Green
Write-Host " [EXITO] Tarjeta Grafica Open Graph generada correctamente!" -ForegroundColor Green
Write-Host " Archivo Canonico: $outPath" -ForegroundColor Green
Write-Host " Dimensiones:      ${width} x ${height} px" -ForegroundColor Green
Write-Host " Peso:             ${sizeKb} KB (Optimo para WhatsApp <300 KB)" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
