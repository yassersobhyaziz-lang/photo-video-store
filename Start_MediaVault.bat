@echo off
echo Starting MediaVault...
echo This will open the application in your default browser.
cd /d "%~dp0"
call npm run dev -- --port 5184 --open --force
pause
