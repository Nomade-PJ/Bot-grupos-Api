@echo off
echo.
echo ========================================
echo   INSTALANDO DEPENDENCIAS DO BOT
echo ========================================
echo.

cd /d "%~dp0"

echo Instalando pacotes npm...
call npm install

if %errorlevel% == 0 (
    echo.
    echo ========================================
    echo   INSTALACAO CONCLUIDA COM SUCESSO!
    echo ========================================
    echo.
    echo Para iniciar o bot, execute:
    echo   npm start
    echo.
) else (
    echo.
    echo ========================================
    echo   ERRO NA INSTALACAO!
    echo ========================================
    echo.
)

pause

