param([switch]$Rollback)
$ErrorActionPreference = 'Stop'
try {
  $key = Get-ItemProperty -LiteralPath 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\Ned' -ErrorAction SilentlyContinue
  $install = $key.InstallLocation
  if (-not $install) { $install = Join-Path $env:LOCALAPPDATA 'Programs\Ned' }
  $python = Join-Path $install 'resources\runtime\windows-x64\openviking\python\python.exe'
  if (!(Test-Path -LiteralPath $python)) { throw 'BUNDLED_PYTHON_NOT_FOUND' }
  $argsForFix = @('-I','-B',(Join-Path $PSScriptRoot 'apply-fix.py'),'--app',$install)
  if ($Rollback) { $argsForFix += '--rollback' }
  & $python @argsForFix
  exit $LASTEXITCODE
} catch {
  Write-Output 'PATCH_START_FAILED'
  exit 1
}
