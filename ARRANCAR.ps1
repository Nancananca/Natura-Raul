param([switch]$SinNavegador,[switch]$Comprobar)
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$taskPython = $null
$taskLaunchArgs=@((Join-Path $PSScriptRoot 'iniciar_local.py'))
if($SinNavegador){$taskLaunchArgs+='--sin-navegador'}
if($Comprobar){$taskLaunchArgs+='--comprobar'}
$taskCandidates = @(
    "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
)
try {
    Get-AppxPackage -Name 'OpenAI.CodexPrimaryRuntime*' | ForEach-Object {
        $taskCandidates += Join-Path $_.InstallLocation 'dependencies\python\python.exe'
    }
} catch {}
foreach ($taskCandidate in $taskCandidates) { if (Test-Path -LiteralPath $taskCandidate) { $taskPython = $taskCandidate; break } }
if ($taskPython) { & $taskPython @taskLaunchArgs; exit $LASTEXITCODE }
if (Get-Command py -ErrorAction SilentlyContinue) { & py -3 @taskLaunchArgs; exit $LASTEXITCODE }
if (Get-Command python -ErrorAction SilentlyContinue) { & python @taskLaunchArgs; exit $LASTEXITCODE }
Write-Host 'Instala Python 3 para revisar en local. GitHub Pages no necesita instalar nada.'

exit 1
