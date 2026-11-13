$ErrorActionPreference = 'Stop'
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public sealed class NedProbeJob : IDisposable {
 [DllImport("kernel32.dll", CharSet=CharSet.Unicode)] static extern IntPtr CreateJobObject(IntPtr a, string n);
 [DllImport("kernel32.dll")] static extern bool SetInformationJobObject(IntPtr h, int c, ref Extended v, int s);
 [DllImport("kernel32.dll")] static extern bool AssignProcessToJobObject(IntPtr h, IntPtr p);
 [DllImport("kernel32.dll")] static extern bool CloseHandle(IntPtr h);
 [StructLayout(LayoutKind.Sequential)] struct Basic { public long a,b; public uint flags; public UIntPtr min,max; public uint active; public UIntPtr affinity; public uint priority,scheduling; }
 [StructLayout(LayoutKind.Sequential)] struct Io { public ulong a,b,c,d,e,f; }
 [StructLayout(LayoutKind.Sequential)] struct Extended { public Basic basic; public Io io; public UIntPtr a,b,c,d; }
 IntPtr job;
 public NedProbeJob() { job=CreateJobObject(IntPtr.Zero,null); var v=new Extended();v.basic.flags=0x2000;if(job==IntPtr.Zero||!SetInformationJobObject(job,9,ref v,Marshal.SizeOf(v)))throw new Exception("JOB_INIT_FAILED"); }
 public void Own(IntPtr p) { if(!AssignProcessToJobObject(job,p))throw new Exception("JOB_ASSIGN_FAILED"); }
 public void Dispose() { if(job!=IntPtr.Zero){CloseHandle(job);job=IntPtr.Zero;} }
}
'@
$install = Join-Path $env:LOCALAPPDATA 'Programs\Ned'
$registered = Get-ItemProperty -LiteralPath 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\Ned' -ErrorAction SilentlyContinue
if ($registered.InstallLocation) { $install = $registered.InstallLocation }
$resources = Join-Path $install 'resources'
$runtime = Join-Path $resources 'runtime\windows-x64\openviking'
$native = Join-Path $resources 'runtime\windows-x64\agent-desktop\agent-desktop.exe'
$root = Join-Path $env:APPDATA 'Ned\diagnostics'
New-Item -ItemType Directory -Path $root -Force | Out-Null
$homeDir = Join-Path $root ('desktop-probe-' + [Guid]::NewGuid().ToString('N'))
foreach ($d in @('AppData\Local','AppData\Roaming','AppData\LocalLow','state','tmp')) { New-Item -ItemType Directory -Path (Join-Path $homeDir $d) -Force | Out-Null }
$report = [ordered]@{schemaVersion=2;probe='Ned desktop without Python';modelsPrompted=$false;desktopActions=0;runtimeFiles=@();results=@()}
$manifest = Get-Content -LiteralPath (Join-Path $runtime 'manifest.json') -Raw | ConvertFrom-Json
foreach ($relative in @('python/python.exe','python/Lib/urllib/__init__.py','python/Lib/urllib/parse.py','python/Lib/site-packages/win32/lib/pywin32_bootstrap.py','sidecar-supervisor.py')) {
 $file=Join-Path $runtime $relative
 $expected=@($manifest.files | Where-Object {$_.path -eq $relative})
 $ok=Test-Path -LiteralPath $file -PathType Leaf
 $report.runtimeFiles+=@{file=$relative;exists=$ok;hashMatches=($ok -and $expected.Count -eq 1 -and (Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash.ToLowerInvariant() -eq $expected[0].sha256)}
}
function Start-Native([string]$arguments) {
 $info=New-Object System.Diagnostics.ProcessStartInfo
 $info.FileName=$native;$info.Arguments=$arguments;$info.WorkingDirectory=$homeDir
 $info.UseShellExecute=$false;$info.CreateNoWindow=$true
 $info.RedirectStandardInput=$true;$info.RedirectStandardOutput=$true;$info.RedirectStandardError=$true
 $info.EnvironmentVariables.Clear()
 foreach ($key in @('SystemRoot','WINDIR','SystemDrive','ProgramFiles','ProgramFiles(x86)','ProgramW6432','ProgramData')) { $value=[Environment]::GetEnvironmentVariable($key);if($value){$info.EnvironmentVariables[$key]=$value} }
 foreach ($entry in @{HOME=$homeDir;USERPROFILE=$homeDir;APPDATA=(Join-Path $homeDir 'AppData\Roaming');LOCALAPPDATA=(Join-Path $homeDir 'AppData\Local');AGENT_DESKTOP_HOME=(Join-Path $homeDir 'state');TEMP=(Join-Path $homeDir 'tmp');TMP=(Join-Path $homeDir 'tmp');PATH=(Join-Path $env:SystemRoot 'System32')}.GetEnumerator()) { $info.EnvironmentVariables[$entry.Key]=$entry.Value }
 $job=New-Object NedProbeJob
 $process=New-Object System.Diagnostics.Process;$process.StartInfo=$info
 try { [void]$process.Start();$job.Own($process.Handle);return @{process=$process;job=$job;stderr=$process.StandardError.ReadToEndAsync()} }
 catch { if(!$process.HasExited){$process.Kill()};$job.Dispose();throw }
}
function Safe-Envelope($reply) {
 if($reply.structuredContent){$reply=$reply.structuredContent}
 if($null -eq $reply.ok -and $reply.content){foreach($c in $reply.content){if($c.type -eq 'text'){try{$reply=$c.text|ConvertFrom-Json;break}catch{}}}}
 $result=@{ok=($reply.ok -eq $true)}
 if($reply.error.code -match '^[A-Z0-9_]{1,80}$'){$result.errorCode=$reply.error.code}
 if($reply.data.version -match '^[0-9.]{1,32}$'){$result.version=$reply.data.version}
 if($reply.data.windows){$result.windowCount=@($reply.data.windows).Count}
 return $result
}
try {
 foreach($command in @('status','list-windows --timeout-ms 5000','mcp')) {
  $child=$null;$result=[ordered]@{command=$command;response=$false}
  try {
   $child=Start-Native $command;$p=$child.process
   if($command -eq 'mcp') {
    $messages=@(@{jsonrpc='2.0';id=1;method='initialize';params=@{protocolVersion='2025-06-18';capabilities=@{};clientInfo=@{name='Ned read-only probe';version='2'}}},@{jsonrpc='2.0';id=2;method='tools/call';params=@{name='desktop_status';arguments=@{}}})
    foreach($message in $messages) {
     $p.StandardInput.WriteLine(($message|ConvertTo-Json -Depth 8 -Compress));$p.StandardInput.Flush()
     $line=$p.StandardOutput.ReadLineAsync()
     if(!$line.Wait(25000)){$result.stage=$message.method;$result.timedOut=$true;break}
     if(!$line.Result){$result.stage=$message.method;break}
     $reply=$line.Result|ConvertFrom-Json
     if($message.id -eq 1){$result.initialized=($null -ne $reply.result.serverInfo)}else{$result.response=$true;$result.envelope=Safe-Envelope $reply.result}
    }
   } else {
    $output=$p.StandardOutput.ReadToEndAsync()
    if($p.WaitForExit(25000) -and $output.Wait(2000)){$result.response=$true;try{$result.envelope=Safe-Envelope ($output.Result|ConvertFrom-Json)}catch{$result.invalidEnvelope=$true}}else{$result.timedOut=$true}
   }
   if($p.HasExited){$result.exitCode=$p.ExitCode}
  } catch { $result.probeFailure=$true }
  finally { if($child){$child.job.Dispose();[void]$child.process.WaitForExit(3000);$child.process.Dispose()} }
  $report.results+=$result
 }
} finally { Remove-Item -LiteralPath $homeDir -Recurse -Force -ErrorAction SilentlyContinue }
$json=$report|ConvertTo-Json -Depth 12
[IO.File]::WriteAllText((Join-Path $root 'desktop-probe-status.json'),$json,(New-Object Text.UTF8Encoding($false)))
$json
