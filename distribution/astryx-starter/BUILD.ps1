$ErrorActionPreference = 'Stop'
try {
  $p = Get-ItemProperty -LiteralPath 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\Ned' -ErrorAction SilentlyContinue
  $exe = if ($p.InstallLocation) { Join-Path $p.InstallLocation 'Ned.exe' } else { Join-Path $env:LOCALAPPDATA 'Programs\Ned\Ned.exe' }
  if (-not (Test-Path -LiteralPath $exe -PathType Leaf)) { throw 'Ned executable not found. Use a locally installed Node 22.13+ to run build.mjs.' }
  $prior = $env:ELECTRON_RUN_AS_NODE
  try {
    $env:ELECTRON_RUN_AS_NODE = '1'
    $process = Start-Process -FilePath $exe -ArgumentList ('"' + (Join-Path $PSScriptRoot 'build.mjs') + '"') -WorkingDirectory $PSScriptRoot -NoNewWindow -Wait -PassThru
    exit $process.ExitCode
  } finally { $env:ELECTRON_RUN_AS_NODE = $prior }
} catch { Write-Error $_; exit 1 }
