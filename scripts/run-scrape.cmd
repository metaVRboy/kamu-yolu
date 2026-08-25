@echo off
setlocal
rem Windows Gorev Zamanlayicisi tarafindan periyodik olarak calistirilir.
rem Kariyer Kapisi taramasini yapar, ciktisini logs\scrape.log dosyasina ekler.

set "PROJECT_DIR=%~dp0.."
set "LOG_DIR=%PROJECT_DIR%\logs"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

set "LOG_FILE=%LOG_DIR%\scrape.log"

cd /d "%PROJECT_DIR%"

echo. >> "%LOG_FILE%"
echo ===== %date% %time% - tarama basladi ===== >> "%LOG_FILE%"
call "C:\Program Files\nodejs\npm.cmd" run scrape:kariyerkapisi >> "%LOG_FILE%" 2>&1
if %ERRORLEVEL% EQU 0 (
  echo ===== %date% %time% - basarili ===== >> "%LOG_FILE%"
) else (
  echo ===== %date% %time% - HATA kodu %ERRORLEVEL% ===== >> "%LOG_FILE%"
)
