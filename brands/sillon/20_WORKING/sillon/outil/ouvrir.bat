@echo off
chcp 65001 >nul
title Sillon - le remplisseur
cd /d "%~dp0.."
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js n'est pas installé sur cet ordinateur : https://nodejs.org ^(version LTS^), puis relancer ouvrir.bat.
  pause
  exit /b 1
)
if not exist "node_modules\playwright-core" (
  echo Il manque le dossier node_modules du projet. Demander à KLYRA de le réinstaller.
  pause
  exit /b 1
)
echo Ouverture du remplisseur de Sillon...
echo Laisser cette fenêtre ouverte pendant le travail. La fermer pour arrêter l'outil.
echo.
node outil\serveur.mjs
if errorlevel 1 pause
