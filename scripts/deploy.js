#!/usr/bin/env node

/**
 * 🚀 AI Co-founder Platform Deployment Script
 * Automated deployment to GitHub Pages using GitHub Actions
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, options = {}) {
    try {
        return execSync(command, { 
            encoding: 'utf8', 
            stdio: 'pipe',
            ...options 
        });
    } catch (error) {
        throw new Error(`Command failed: ${command}\n${error.message}`);
    }
}

function checkGitRepository() {
    log('🔍 Checking git repository...', 'blue');
    
    if (!fs.existsSync('.git')) {
        throw new Error('Not in a git repository. Please run this script from the project root.');
    }
    
    log('✅ Git repository found', 'green');
}

function checkRequiredFiles() {
    log('📋 Validating required files...', 'blue');
    
    const requiredFiles = ['index.html', 'README.md'];
    const optionalFiles = ['package.json', '.github/workflows/deploy.yml'];
    
    requiredFiles.forEach(file => {
        if (fs.existsSync(file)) {
            log(`✅ Found ${file}`, 'green');
        } else {
            throw new Error(`Required file not found: ${file}`);
        }
    });
    
    optionalFiles.forEach(file => {
        if (fs.existsSync(file)) {
            log(`✅ Found ${file}`, 'green');
        } else {
            log(`⚠️ Optional file not found: ${file}`, 'yellow');
        }
    });
}

function getCurrentBranch() {
    try {
        return execCommand('git branch --show-current').trim();
    } catch (error) {
        throw new Error('Failed to get current branch');
    }
}

function checkUncommittedChanges() {
    log('🔍 Checking for uncommitted changes...', 'blue');
    
    try {
        const status = execCommand('git status --porcelain');
        if (status.trim()) {
            log('⚠️ Uncommitted changes detected:', 'yellow');
            console.log(status);
            return true;
        } else {
            log('✅ No uncommitted changes', 'green');
            return false;
        }
    } catch (error) {
        throw new Error('Failed to check git status');
    }
}

function commitChanges() {
    log('📝 Committing changes...', 'blue');
    
    try {
        execCommand('git add .');
        const commitMessage = `🚀 Deploy AI Co-founder Platform - ${new Date().toISOString()}`;
        execCommand(`git commit -m "${commitMessage}"`);
        log('✅ Changes committed successfully', 'green');
    } catch (error) {
        throw new Error('Failed to commit changes');
    }
}

function pushToRemote(branch) {
    log(`📤 Pushing to remote repository (${branch})...`, 'blue');
    
    try {
        execCommand(`git push origin ${branch}`);
        log('✅ Successfully pushed to remote', 'green');
    } catch (error) {
        throw new Error('Failed to push to remote repository');
    }
}

function getRepositoryInfo() {
    try {
        const remoteUrl = execCommand('git config --get remote.origin.url').trim();
        const match = remoteUrl.match(/github\.com[:/]([^/]+)\/([^.]*)/);
        
        if (match) {
            return {
                owner: match[1],
                repo: match[2],
                url: `https://github.com/${match[1]}/${match[2]}`,
                pagesUrl: `https://${match[1]}.github.io/${match[2]}`,
                actionsUrl: `https://github.com/${match[1]}/${match[2]}/actions`
            };
        }
    } catch (error) {
        log('⚠️ Could not determine repository info', 'yellow');
    }
    
    return null;
}

function displayDeploymentInfo(repoInfo) {
    log('\n🎉 Deployment initiated successfully!', 'green');
    log('=====================================', 'cyan');
    
    if (repoInfo) {
        log(`\n📊 Repository Information:`, 'blue');
        log(`   Owner: ${repoInfo.owner}`, 'cyan');
        log(`   Repository: ${repoInfo.repo}`, 'cyan');
        log(`   GitHub URL: ${repoInfo.url}`, 'cyan');
        log(`   Pages URL: ${repoInfo.pagesUrl}`, 'cyan');
    }
    
    log('\n📋 Next Steps:', 'blue');
    log('1. Go to your GitHub repository', 'yellow');
    log('2. Check the Actions tab for deployment progress', 'yellow');
    log('3. Once complete, your site will be available at the Pages URL above', 'yellow');
    
    log('\n🔧 If you need to enable GitHub Pages manually:', 'blue');
    log('1. Go to repository Settings', 'yellow');
    log('2. Scroll to Pages section', 'yellow');
    log('3. Select "GitHub Actions" as source', 'yellow');
    log('4. Save the settings', 'yellow');
    
    if (repoInfo) {
        log(`\n📊 Monitor deployment progress:`, 'blue');
        log(`   ${repoInfo.actionsUrl}`, 'cyan');
    }
    
    log('\n✨ AI Co-founder Platform deployment completed!', 'magenta');
}

function main() {
    try {
        log('🚀 AI Co-founder Platform Deployment Script', 'bright');
        log('============================================', 'cyan');
        
        // Check prerequisites
        checkGitRepository();
        checkRequiredFiles();
        
        // Get current branch
        const currentBranch = getCurrentBranch();
        log(`📍 Current branch: ${currentBranch}`, 'blue');
        
        // Check if on main/master branch
        if (currentBranch !== 'main' && currentBranch !== 'master') {
            log(`⚠️ Not on main/master branch. Current: ${currentBranch}`, 'yellow');
            log('Continuing with deployment...', 'yellow');
        }
        
        // Check for uncommitted changes
        const hasUncommittedChanges = checkUncommittedChanges();
        
        if (hasUncommittedChanges) {
            log('📝 Uncommitted changes detected. Committing them...', 'blue');
            commitChanges();
        }
        
        // Push to remote
        pushToRemote(currentBranch);
        
        // Get repository info
        const repoInfo = getRepositoryInfo();
        
        // Display deployment information
        displayDeploymentInfo(repoInfo);
        
    } catch (error) {
        log(`❌ Deployment failed: ${error.message}`, 'red');
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { main };
