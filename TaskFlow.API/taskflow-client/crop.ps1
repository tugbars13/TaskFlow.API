Add-Type -AssemblyName System.Drawing
$imgPath = "C:\Users\tugba.bars\source\repos\TaskFlow.API\TaskFlow.API\taskflow-client\public\taskflow-logo.png"
$outPath = "C:\Users\tugba.bars\source\repos\TaskFlow.API\TaskFlow.API\taskflow-client\public\taskflow-logo-symbol.png"

$img = [System.Drawing.Image]::FromFile($imgPath)
$bmp = new-object System.Drawing.Bitmap($img)

$minX = $bmp.Width
$minY = $bmp.Height
$maxX = 0
$maxY = 0

for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
        $pixel = $bmp.GetPixel($x, $y)
        if ($pixel.A -gt 10) { # a threshold just in case
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

if ($minX -le $maxX -and $minY -le $maxY) {
    $width = $maxX - $minX + 1
    $height = $maxY - $minY + 1
    
    $cropRect = New-Object System.Drawing.Rectangle($minX, $minY, $width, $height)
    $target = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($target)
    $g.DrawImage($bmp, (New-Object System.Drawing.Rectangle(0, 0, $width, $height)), $cropRect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    
    $target.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $target.Dispose()
    Write-Output "Successfully cropped image to $width x $height"
} else {
    Write-Output "Image seems completely transparent"
}
$bmp.Dispose()
$img.Dispose()
