$ErrorActionPreference = 'Stop'

function Assert-Directory($Folder) {
  $item = Get-Item -LiteralPath $Folder
  if (-not $item.PSIsContainer -or ($item.Attributes -band [IO.FileAttributes]::ReparsePoint)) {
    throw "Expected a local directory without a reparse point: $Folder"
  }
}

$manifest = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'pack.json') -Raw | ConvertFrom-Json
if ($manifest.id -ne 'reversing' -or $manifest.version -notmatch '^0\.3\.[0-9]+$') { throw 'Invalid reversing pack identity.' }
$registered = (Get-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\Ned').InstallLocation
$resources = Join-Path $registered 'resources\ned'
$installed = Get-Content -LiteralPath (Join-Path $resources 'build-info.json') -Raw | ConvertFrom-Json
if ($installed.version -ne $manifest.version) { throw 'Install the matching version of Ned before installing this pack.' }
$lock = Get-Content -LiteralPath (Join-Path $resources 'locks\release-runtime.json') -Raw | ConvertFrom-Json
$parent = $env:APPDATA
foreach ($part in @('Ned', 'packs', 'reversing')) {
  $parent = Join-Path $parent $part
  [IO.Directory]::CreateDirectory($parent) | Out-Null
  Assert-Directory $parent
}
$target = Join-Path $parent $manifest.version
if (Test-Path -LiteralPath $target) { throw 'This version is already installed. Remove its existing pack directory with Ned closed before reinstalling.' }
$stage = Join-Path $parent ('.stage-' + [guid]::NewGuid().ToString('N'))
[IO.Directory]::CreateDirectory($stage) | Out-Null
try {
  foreach ($component in @('rea', 'ghidra')) {
    $source = Join-Path $PSScriptRoot $component
    Assert-Directory $source
    $record = Join-Path $source 'manifest.json'
    $info = Get-Item -LiteralPath $record
    $pin = $lock.components.$component.manifestSha256
    if (($info.Attributes -band [IO.FileAttributes]::ReparsePoint) -or
        (Get-FileHash -Algorithm SHA256 -LiteralPath $record).Hash -ne $pin) { throw "Untrusted $component manifest." }
    $componentManifest = Get-Content -LiteralPath $record -Raw | ConvertFrom-Json
    $stagedComponent = Join-Path $stage $component
    [IO.Directory]::CreateDirectory($stagedComponent) | Out-Null
    Copy-Item -LiteralPath $record -Destination (Join-Path $stagedComponent 'manifest.json')
    foreach ($entry in $componentManifest.files) {
      if ($entry.path -notmatch '^[\x20-\x7e]+$' -or $entry.path -match '[\\:<>"|?*]') { throw 'Invalid pack path.' }
      $parts = $entry.path.Split('/')
      if ($parts | Where-Object { $_ -in @('', '.', '..') -or $_ -match '[. ]$' }) { throw 'Invalid pack path.' }
      $from = $source
      foreach ($part in $parts) {
        $from = Join-Path $from $part
        $file = Get-Item -LiteralPath $from
        if ($file.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Pack links are blocked.' }
      }
      if ($file.PSIsContainer) { throw 'Expected a regular pack file.' }
      $to = Join-Path $stagedComponent ($parts -join '\')
      [IO.Directory]::CreateDirectory((Split-Path $to)) | Out-Null
      Copy-Item -LiteralPath $from -Destination $to
      if ((Get-FileHash -Algorithm SHA256 -LiteralPath $to).Hash -ne $entry.sha256) { throw "Pack hash mismatch: $($entry.path)" }
    }
  }
  [IO.Directory]::Move($stage, $target)
  Write-Output "Ned reversing pack $($manifest.version) installed."
} finally {
  if (Test-Path -LiteralPath $stage) { Remove-Item -LiteralPath $stage -Recurse -Force }
}
