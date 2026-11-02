@echo off
title GuruG — Personal AI Tutor
cd /d "%~dp0"

echo ===================================================
echo    GuruG: Multilingual AI-Powered Personal Tutor
echo    Your Personal AI Tutor. Your Language. Your Pace.
echo ===================================================
echo.
echo Starting GuruG Web Server at http://127.0.0.1:8000 ...
echo.

:: Open default browser to GuruG web interface
start "" "http://127.0.0.1:8000"

:: Check if python command is available
where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    python run.py
    goto end
)

:: Fallback to py launcher if python alias is not on path
where py >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    py run.py
    goto end
)

echo [ERROR] Python was not found in your system PATH.
echo Please install Python 3.10+ or add Python to your PATH environment variable.
echo.

:end
pause
