#!/bin/bash

# 🚀 AI Co-founder Platform Deployment Script
# This script automates the deployment process to GitHub Pages

set -e  # Exit on any error

echo "🚀 Starting AI Co-founder Platform deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "Not in a git repository. Please run this script from the project root."
    exit 1
fi

# Check if index.html exists
if [ ! -f "index.html" ]; then
    print_error "index.html not found. Please ensure you're in the correct directory."
    exit 1
fi

print_status "Validating project structure..."

# Validate essential files
required_files=("index.html" "README.md" "package.json")
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "Found $file"
    else
        print_warning "$file not found"
    fi
done

# Check if GitHub Actions are configured
if [ -d ".github/workflows" ]; then
    print_success "GitHub Actions workflows found"
else
    print_warning "GitHub Actions workflows not found"
fi

# Get current branch
current_branch=$(git branch --show-current)
print_status "Current branch: $current_branch"

# Check if we're on main or master branch
if [[ "$current_branch" != "main" && "$current_branch" != "master" ]]; then
    print_warning "Not on main/master branch. Current branch: $current_branch"
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deployment cancelled"
        exit 0
    fi
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes:"
    git status --short
    
    read -p "Do you want to commit these changes? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Committing changes..."
        git add .
        git commit -m "🚀 Deploy AI Co-founder Platform - $(date)"
        print_success "Changes committed"
    else
        print_warning "Deploying with uncommitted changes"
    fi
fi

# Push to remote
print_status "Pushing to remote repository..."
if git push origin "$current_branch"; then
    print_success "Successfully pushed to remote"
else
    print_error "Failed to push to remote"
    exit 1
fi

# Check if GitHub Pages is enabled
print_status "Checking GitHub Pages configuration..."

# Wait a moment for GitHub to process
sleep 5

print_success "Deployment initiated!"
echo ""
echo "🎉 AI Co-founder Platform deployment process started!"
echo ""
echo "📋 Next steps:"
echo "1. Go to your GitHub repository"
echo "2. Check the Actions tab for deployment progress"
echo "3. Once complete, your site will be available at:"
echo "   https://$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\)\/\([^.]*\).*/\1.github.io\/\2/')"
echo ""
echo "🔧 If you need to enable GitHub Pages manually:"
echo "1. Go to repository Settings"
echo "2. Scroll to Pages section"
echo "3. Select 'GitHub Actions' as source"
echo "4. Save the settings"
echo ""
echo "📊 Monitor deployment progress:"
echo "   https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\)\/\([^.]*\).*/\1\/\2/')/actions"
echo ""

# Optional: Open GitHub Actions page
if command -v open &> /dev/null; then
    read -p "Do you want to open the GitHub Actions page? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\)\/\([^.]*\).*/\1\/\2/')/actions"
    fi
elif command -v xdg-open &> /dev/null; then
    read -p "Do you want to open the GitHub Actions page? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        xdg-open "https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\)\/\([^.]*\).*/\1\/\2/')/actions"
    fi
fi

print_success "Deployment script completed!"
