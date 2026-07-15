@echo off
cd /d "%~dp0"
echo Trenutna mapa: %cd%
echo.

if not exist "node_modules\expo" (
    echo NAPAKA: mapa node_modules\expo ne obstaja tukaj!
    echo Preveri, ali je ta bat datoteka v mapi cinema-mobile.
    pause
    exit /b 1
)

echo Building KinoPlex APK...
call npx expo prebuild --platform android --clean
if errorlevel 1 (
    echo NAPAKA pri prebuild koraku!
    pause
    exit /b 1
)

cd android
call gradlew assembleRelease
if errorlevel 1 (
    echo NAPAKA pri gradlew build koraku!
    pause
    exit /b 1
)

echo.
echo Done! APK is at: android\app\build\outputs\apk\release\app-release.apk
pause