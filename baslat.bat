@echo off
title NutriMedAI Baslatici
echo ==========================================
echo   NutriMedAI Sistemi Baslatiliyor...
echo ==========================================
echo.

echo [1/2] Backend API (Python) baslatiliyor...
start "NutriMedAI Backend API" cmd /k "python api_server.py"

echo.
echo [2/2] Frontend (Mobil Uygulama) baslatiliyor...
cd /d "c:\Users\Emre\Desktop\NutriMedAI mobil uygulama tasarımı (1)"
start "NutriMedAI Mobile App" cmd /k "npm run dev"

echo.
echo ==========================================
echo   Sistemler acildi!
echo   Lutfen acilan pencereleri KAPATMAYIN.
echo   Simdi tarayicinizdan linke tiklayabilirsiniz.
echo ==========================================
pause
