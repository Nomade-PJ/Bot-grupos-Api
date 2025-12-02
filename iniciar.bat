@echo off
echo.
echo ========================================
echo   INICIANDO VALZINHA VIP BOT
echo ========================================
echo.

cd /d "%~dp0"

echo Verificando .env...
if not exist ".env" (
    echo.
    echo ERRO: Arquivo .env nao encontrado!
    echo Por favor, configure o .env antes de iniciar.
    echo.
    pause
    exit /b 1
)

echo.
echo Iniciando bot...
echo.
call npm start

pause

