@echo off
REM 🚀 AI Co-founder Platform Deployment Script for Windows
REM This script automates the deployment process to GitHub Pages

setlocal enabledelayedexpansion

echo 🚀 Starting AI Co-founder Platform deployment...

REM Check if we're in a git repository
if not exist ".git" (
    echo [ERROR] Not in a git repository. Please run this script from the project root.
    pause
    exit /b 1
)

REM Check if index.html exists
if not exist "index.html" (
    echo [ERROR] index.html not found. Please ensure you're in the correct directory.
    pause
    exit /b 1
)

echo [INFO] Validating project structure...

REM Validate essential files
if exist "index.html" (
    echo [SUCCESS] Found index.html
) else (
    echo [WARNING] index.html not found
)

if exist "README.md" (
    echo [SUCCESS] Found README.md
) else (
    echo [WARNING] README.md not found
)

if exist "package.json" (
    echo [SUCCESS] Found package.json
) else (
    echo [WARNING] package.json not found
)

REM Check if GitHub Actions are configured
if exist ".github\workflows" (
    echo [SUCCESS] GitHub Actions workflows found
) else (
    echo [WARNING] GitHub Actions workflows not found
)

REM Get current branch
for /f "tokens=*" %%i in ('git branch --show-current') do set current_branch=%%i
echo [INFO] Current branch: !current_branch!

REM Check if we're on main or master branch
if not "!current_branch!"=="main" if not "!current_branch!"=="master" (
    echo [WARNING] Not on main/master branch. Current branch: !current_branch!
    set /p continue="Do you want to continue? (y/N): "
    if /i not "!continue!"=="y" (
        echo [INFO] Deployment cancelled
        pause
        exit /b 0
    )
)

REM Check for uncommitted changes
git status --porcelain > temp_status.txt
set /a has_changes=0
for /f %%i in (temp_status.txt) do set /a has_changes=1
del temp_status.txt

if !has_changes! equ 1 (
    echo [WARNING] You have uncommitted changes:
    git status --short
    
    set /p commit_changes="Do you want to commit these changes? (y/N): "
    if /i "!commit_changes!"=="y" (
        echo [INFO] Committing changes...
        git add .
        git commit -m "🚀 Deploy AI Co-founder Platform - %date% %time%"
        echo [SUCCESS] Changes committed
    ) else (
        echo [WARNING] Deploying with uncommitted changes
    )
)

REM Push to remote
echo [INFO] Pushing to remote repository...
git push origin !current_branch!
if !errorlevel! equ 0 (
    echo [SUCCESS] Successfully pushed to remote
) else (
    echo [ERROR] Failed to push to remote
    pause
    exit /b 1
)

echo [SUCCESS] Deployment initiated!
echo.
echo 🎉 AI Co-founder Platform deployment process started!
echo.
echo 📋 Next steps:
echo 1. Go to your GitHub repository
echo 2. Check the Actions tab for deployment progress
echo 3. Once complete, your site will be available at:
echo    https://username.github.io/repository-name
echo.
echo 🔧 If you need to enable GitHub Pages manually:
echo 1. Go to repository Settings
echo 2. Scroll to Pages section
echo 3. Select 'GitHub Actions' as source
echo 4. Save the settings
echo.
echo 📊 Monitor deployment progress:
echo    https://github.com/username/repository-name/actions
echo.

REM Optional: Open GitHub Actions page
set /p open_actions="Do you want to open the GitHub Actions page? (y/N): "
if /i "!open_actions!"=="y" (
    start https://github.com/username/repository-name/actions
)

echo [SUCCESS] Deployment script completed!
pause
