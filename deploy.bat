@echo off
cd /d "%~dp0"
echo.
echo Publicando el sitio de Patagonia Seaweeds...
echo.
for /r ".git" %%f in (*.lock) do del /f /q "%%f" 2>nul
git add .
git commit -m "Actualiza sitio %date% %time%"
git pull --rebase origin main
git push origin HEAD:main
echo.
echo Listo. Los cambios se veran en www.patagoniaseaweeds.com en uno o dos minutos.
echo.
pause
