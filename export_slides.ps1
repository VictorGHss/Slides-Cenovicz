param(
    [string]$PresentationPath = "$PSScriptRoot\slides cenovicz.pptx",
    [string]$OutputDir = "$PSScriptRoot\slides"
)

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$resolvedPptx = (Resolve-Path $PresentationPath).Path
$resolvedOut = (Resolve-Path $OutputDir).Path

Write-Host "Opening PowerPoint..."
$ppt = New-Object -ComObject PowerPoint.Application

try {
    # Open presentation in hidden/read-only mode: ReadOnly = -1 (msoTrue), Untitled = 0 (msoFalse), WithWindow = 0 (msoFalse)
    $pres = $ppt.Presentations.Open($resolvedPptx, -1, 0, 0)
    $slideCount = $pres.Slides.Count
    Write-Host "Total slides found: $slideCount"
    
    # Export all slides as PNG (1920x1080 resolution)
    # SaveAs with 17 = ppSaveAsPNG
    # Or export slide by slide for explicit resolution control
    for ($i = 1; $i -le $slideCount; $i++) {
        $slide = $pres.Slides.Item($i)
        $slideFile = Join-Path $resolvedOut ("slide_{0:D2}.png" -f $i)
        $slide.Export($slideFile, "PNG", 1920, 1080)
        Write-Host "Exported slide $i of $slideCount -> $slideFile"
    }

    $pres.Close()
    Write-Host "Export completed successfully!"
} catch {
    Write-Host "Error during export: $_"
} finally {
    $ppt.Quit()
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
}
