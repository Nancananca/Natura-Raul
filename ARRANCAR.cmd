@echo off
cd /d "%~dp0"
if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" (
  "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" iniciar_local.py
  goto fin
)
where py >nul 2>nul
if not errorlevel 1 (
  py -3 iniciar_local.py
  goto fin
)
where python >nul 2>nul
if not errorlevel 1 (
  python iniciar_local.py
  goto fin
)
echo Para la vista local instala Python 3. En GitHub Pages no necesitas instalar nada.
:fin
pause
