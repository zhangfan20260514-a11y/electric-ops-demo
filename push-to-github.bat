@echo off
chcp 65001 >nul
title Push to GitHub
echo ============================================
echo  Push this project to your GitHub repository
echo ============================================
echo.
set /p REPO=Repository URL (https://github.com/USER/REPO.git): 
if "%REPO%"=="" goto empty

git init -b main >nul 2>&1
git add -A
git commit -m "chore: electric-ops demo" >nul 2>&1
git branch -M main
git remote remove origin >nul 2>&1
git remote add origin %REPO%
echo.
echo Pushing to %REPO% ...
git push -u origin main
echo.
echo Done. If you saw "Authentication failed", sign in with a Personal Access Token
echo instead of your account password: GitHub - Settings - Developer settings - Tokens.
pause
exit /b

:empty
echo.
echo No repository URL given. Exit.
pause
