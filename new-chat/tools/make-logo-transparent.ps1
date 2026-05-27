param(
  [Parameter(Mandatory = $true)][string]$Source,
  [Parameter(Mandatory = $true)][string]$Out
)

Add-Type -AssemblyName System.Drawing

$orig = [System.Drawing.Bitmap]::FromFile($Source)
$w = $orig.Width
$h = $orig.Height
$bmp = [System.Drawing.Bitmap]::new($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($bmp)
$graphics.DrawImage($orig, 0, 0, $w, $h)
$graphics.Dispose()
$orig.Dispose()

$visited = New-Object 'bool[,]' $w, $h
$queue = [System.Collections.Generic.Queue[object]]::new()

function Test-Background([System.Drawing.Color]$pixel) {
  $max = [Math]::Max($pixel.R, [Math]::Max($pixel.G, $pixel.B))
  $min = [Math]::Min($pixel.R, [Math]::Min($pixel.G, $pixel.B))
  return (($pixel.R -gt 216) -and ($pixel.G -gt 216) -and ($pixel.B -gt 216) -and (($max - $min) -lt 42))
}

for ($x = 0; $x -lt $w; $x++) {
  foreach ($y in 0, ($h - 1)) {
    if (-not $visited[$x, $y] -and (Test-Background $bmp.GetPixel($x, $y))) {
      $visited[$x, $y] = $true
      $queue.Enqueue(@($x, $y))
    }
  }
}

for ($y = 0; $y -lt $h; $y++) {
  foreach ($x in 0, ($w - 1)) {
    if (-not $visited[$x, $y] -and (Test-Background $bmp.GetPixel($x, $y))) {
      $visited[$x, $y] = $true
      $queue.Enqueue(@($x, $y))
    }
  }
}

$dirs = @(@(1, 0), @(-1, 0), @(0, 1), @(0, -1))
while ($queue.Count -gt 0) {
  $point = $queue.Dequeue()
  $x = [int]$point[0]
  $y = [int]$point[1]

  foreach ($dir in $dirs) {
    $nx = $x + [int]$dir[0]
    $ny = $y + [int]$dir[1]
    if ($nx -ge 0 -and $nx -lt $w -and $ny -ge 0 -and $ny -lt $h -and -not $visited[$nx, $ny]) {
      if (Test-Background $bmp.GetPixel($nx, $ny)) {
        $visited[$nx, $ny] = $true
        $queue.Enqueue(@($nx, $ny))
      }
    }
  }
}

for ($x = 0; $x -lt $w; $x++) {
  for ($y = 0; $y -lt $h; $y++) {
    if ($visited[$x, $y]) {
      $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 255, 255, 255))
    }
  }
}

$bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

$check = [System.Drawing.Bitmap]::FromFile($Out)
$corner = $check.GetPixel(0, 0)
$bottom = $check.GetPixel([int]($check.Width / 2), $check.Height - 5)
Write-Output "corner_alpha=$($corner.A)"
Write-Output "bottom_alpha=$($bottom.A)"
$check.Dispose()
