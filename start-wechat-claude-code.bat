@echo off
setlocal
cd /d "%~dp0"
if not exist "dist\main.js" (
  echo dist\main.js not found. Please run npm install first.
  exit /b 1
)
start "wechat-claude-code" /min cmd /c "node dist\main.js start >> "%USERPROFILE%\.wechat-claude-code\logs\windows-console.log" 2>&1"
