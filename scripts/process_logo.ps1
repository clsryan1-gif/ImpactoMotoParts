Add-Type -AssemblyName System.Drawing

$inputPath = "c:\Users\carlos\Desktop\IMPACTO MOTO PARTS\public\logo.png"
$outputPathBase = "c:\Users\carlos\Desktop\IMPACTO MOTO PARTS\public\"

Write-Host "Lendo logo original..."
$img = [System.Drawing.Bitmap]::FromFile($inputPath)
$width = $img.Width
$height = $img.Height

# Acelerar: Amostra rápida das bordas
Write-Host "Calculando bordas..."
$minX = $width; $minY = $height; $maxX = 0; $maxY = 0
for ($x = 0; $x -lt $width; $x += 4) {
    for ($y = 0; $y -lt $height; $y += 4) {
        $pix = $img.GetPixel($x, $y)
        if ($pix.R -lt 250 -or $pix.G -lt 250 -or $pix.B -lt 250) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

# Crop com margem pequena
$logoWidth = $maxX - $minX + 1
$logoHeight = $maxY - $minY + 1
$cropped = New-Object System.Drawing.Bitmap($logoWidth, $logoHeight)
$g = [System.Drawing.Graphics]::FromImage($cropped)
$g.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, $logoWidth, $logoHeight)), $minX, $minY, $logoWidth, $logoHeight, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()

# Zoom 35% (Escala 1.35)
$scale = 1.35
$newW = [int]($logoWidth * $scale)
$newH = [int]($logoHeight * $scale)

Write-Host "Processando transparencia..."
function Get-Transparent {
    param($src)
    $dest = New-Object System.Drawing.Bitmap($src.Width, $src.Height)
    for ($x = 0; $x -lt $src.Width; $x++) {
        for ($y = 0; $y -lt $src.Height; $y++) {
            $p = $src.GetPixel($x, $y)
            # Qualquer pixel muito claro vira transparente
            if ($p.R -gt 245 -and $p.G -gt 245 -and $p.B -gt 245) {
                $dest.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            } else {
                $dest.SetPixel($x, $y, $p)
            }
        }
    }
    return $dest
}

$logoScaled = New-Object System.Drawing.Bitmap($newW, $newH)
$gs = [System.Drawing.Graphics]::FromImage($logoScaled)
$gs.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gs.DrawImage($cropped, 0, 0, $newW, $newH)
$gs.Dispose()

Write-Host "Salvando arquivos temporários..."
$transparent = Get-Transparent -src $logoScaled
$transparent.Save($outputPathBase + "logo-temp.png", [System.Drawing.Imaging.ImageFormat]::Png)

function Save-Icon {
    param($size, $name)
    $icon = New-Object System.Drawing.Bitmap($size, $size)
    $gi = [System.Drawing.Graphics]::FromImage($icon)
    $gi.Clear([System.Drawing.Color]::Transparent)
    $ratio = [Math]::Min($size / $newW, $size / $newH)
    $fitW = [int]($newW * $ratio)
    $fitH = [int]($newH * $ratio)
    $gi.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    # Ativar suavização para qualidade elite
    $gi.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $gi.DrawImage($transparent, [int]((( $size - $fitW ) / 2)), [int]((( $size - $fitH ) / 2)), $fitW, $fitH)
    $gi.Dispose()
    $icon.Save($outputPathBase + $name.Replace(".png", "-temp.png"), [System.Drawing.Imaging.ImageFormat]::Png)
}

Save-Icon -size 192 -name "icon-pwa-192.png"
Save-Icon -size 512 -name "icon-pwa-512.png"

$img.Dispose(); $cropped.Dispose(); $logoScaled.Dispose(); $transparent.Dispose()
Write-Host "Processamento concluído!"
