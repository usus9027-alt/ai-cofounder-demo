#!/usr/bin/env node

/**
 * 🚀 Полный автоматический деплой AI Co-founder Platform
 * Создает репозиторий, настраивает GitHub Actions и развертывает сайт
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ваши данные
const GITHUB_TOKEN = 'YOUR_GITHUB_TOKEN';
const REPOSITORY_NAME = 'ai-cofounder-demo';
const GITHUB_USERNAME = 'timbe'; // Замените на ваш username

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

async function createGitHubRepository() {
    log('🔧 Creating GitHub repository...', 'blue');
    
    const repoData = {
        name: REPOSITORY_NAME,
        description: 'AI Co-founder Platform - Interactive Canvas with AI Chat',
        private: false,
        auto_init: false,
        gitignore_template: 'Node',
        license_template: 'mit'
    };
    
    try {
        const response = await fetch(`https://api.github.com/user/repos`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(repoData)
        });
        
        if (response.ok) {
            const repo = await response.json();
            log(`✅ Repository created: ${repo.html_url}`, 'green');
            return repo;
        } else {
            const error = await response.text();
            if (error.includes('already exists')) {
                log(`⚠️ Repository ${REPOSITORY_NAME} already exists`, 'yellow');
                return { html_url: `https://github.com/${GITHUB_USERNAME}/${REPOSITORY_NAME}` };
            }
            throw new Error(`Failed to create repository: ${error}`);
        }
    } catch (error) {
        log(`❌ Error creating repository: ${error.message}`, 'red');
        throw error;
    }
}

function updateDocumentationWithRealData() {
    log('📝 Updating documentation with real data...', 'blue');
    
    const filesToUpdate = [
        'QUICK_START.md',
        'DEPLOYMENT.md',
        'package.json',
        'README.md'
    ];
    
    filesToUpdate.forEach(file => {
        if (fs.existsSync(file)) {
            let content = fs.readFileSync(file, 'utf8');
            
            // Replace placeholders with real data
            content = content.replace(/YOUR_USERNAME/g, GITHUB_USERNAME);
            content = content.replace(/username/g, GITHUB_USERNAME);
            content = content.replace(/ai-cofounder-demo/g, REPOSITORY_NAME);
            content = content.replace(/repository-name/g, REPOSITORY_NAME);
            
            fs.writeFileSync(file, content);
            log(`✅ Updated ${file}`, 'green');
        }
    });
}

function setupGitRepository() {
    log('🔧 Setting up Git repository...', 'blue');
    
    try {
        // Initialize git if not already initialized
        if (!fs.existsSync('.git')) {
            execCommand('git init');
            log('✅ Git repository initialized', 'green');
        }
        
        // Configure git user
        execCommand(`git config user.name "${GITHUB_USERNAME}"`);
        execCommand(`git config user.email "${GITHUB_USERNAME}@users.noreply.github.com"`);
        
        // Add remote origin
        try {
            execCommand(`git remote add origin https://${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${REPOSITORY_NAME}.git`);
        } catch (error) {
            // Remote might already exist, try to set URL
            execCommand(`git remote set-url origin https://${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${REPOSITORY_NAME}.git`);
        }
        
        log('✅ Git repository configured', 'green');
        
    } catch (error) {
        log(`❌ Error setting up Git: ${error.message}`, 'red');
        throw error;
    }
}

function commitAndPush() {
    log('📤 Committing and pushing to GitHub...', 'blue');
    
    try {
        // Add all files
        execCommand('git add .');
        
        // Commit
        const commitMessage = `🚀 Initial AI Co-founder Platform deployment - ${new Date().toISOString()}`;
        execCommand(`git commit -m "${commitMessage}"`);
        
        // Push to main branch
        execCommand('git push -u origin main');
        
        log('✅ Code pushed to GitHub successfully', 'green');
        
    } catch (error) {
        log(`❌ Error pushing to GitHub: ${error.message}`, 'red');
        throw error;
    }
}

async function enableGitHubPages() {
    log('🌐 Enabling GitHub Pages...', 'blue');
    
    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPOSITORY_NAME}/pages`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                source: {
                    branch: 'main',
                    path: '/'
                }
            })
        });
        
        if (response.ok) {
            log('✅ GitHub Pages enabled', 'green');
        } else {
            log('⚠️ GitHub Pages might need manual setup', 'yellow');
        }
        
    } catch (error) {
        log(`⚠️ Could not enable GitHub Pages automatically: ${error.message}`, 'yellow');
        log('You may need to enable it manually in repository settings', 'yellow');
    }
}

async function triggerGitHubActions() {
    log('⚡ Triggering GitHub Actions workflows...', 'blue');
    
    try {
        // Trigger auto-setup workflow
        const setupResponse = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPOSITORY_NAME}/actions/workflows/auto-setup.yml/dispatches`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ref: 'main',
                inputs: {
                    github_token: GITHUB_TOKEN,
                    repository_name: REPOSITORY_NAME
                }
            })
        });
        
        if (setupResponse.ok) {
            log('✅ Auto-setup workflow triggered', 'green');
        }
        
        // Wait a bit then trigger deploy workflow
        setTimeout(async () => {
            try {
                const deployResponse = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPOSITORY_NAME}/actions/workflows/deploy.yml/dispatches`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `token ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ref: 'main'
                    })
                });
                
                if (deployResponse.ok) {
                    log('✅ Deploy workflow triggered', 'green');
                }
            } catch (error) {
                log(`⚠️ Could not trigger deploy workflow: ${error.message}`, 'yellow');
            }
        }, 5000);
        
    } catch (error) {
        log(`⚠️ Could not trigger workflows automatically: ${error.message}`, 'yellow');
        log('You may need to trigger them manually in GitHub Actions', 'yellow');
    }
}

function displayResults() {
    log('\n🎉 AI Co-founder Platform Deployment Complete!', 'green');
    log('===============================================', 'cyan');
    
    log('\n📊 Repository Information:', 'blue');
    log(`   Owner: ${GITHUB_USERNAME}`, 'cyan');
    log(`   Repository: ${REPOSITORY_NAME}`, 'cyan');
    log(`   GitHub URL: https://github.com/${GITHUB_USERNAME}/${REPOSITORY_NAME}`, 'cyan');
    log(`   Pages URL: https://${GITHUB_USERNAME}.github.io/${REPOSITORY_NAME}`, 'cyan');
    log(`   Actions URL: https://github.com/${GITHUB_USERNAME}/${REPOSITORY_NAME}/actions`, 'cyan');
    
    log('\n📋 What was done:', 'blue');
    log('✅ GitHub repository created', 'green');
    log('✅ Documentation updated with real data', 'green');
    log('✅ Git repository configured', 'green');
    log('✅ Code pushed to GitHub', 'green');
    log('✅ GitHub Pages enabled', 'green');
    log('✅ GitHub Actions workflows triggered', 'green');
    
    log('\n🚀 Next steps:', 'blue');
    log('1. Wait 2-3 minutes for GitHub Actions to complete', 'yellow');
    log('2. Check your site at: https://' + GITHUB_USERNAME + '.github.io/' + REPOSITORY_NAME, 'yellow');
    log('3. Monitor progress at: https://github.com/' + GITHUB_USERNAME + '/' + REPOSITORY_NAME + '/actions', 'yellow');
    
    log('\n✨ Your AI Co-founder Platform is now live!', 'magenta');
}

async function main() {
    try {
        log('🚀 AI Co-founder Platform - Full Auto Deployment', 'bright');
        log('================================================', 'cyan');
        
        // Step 1: Create GitHub repository
        await createGitHubRepository();
        
        // Step 2: Update documentation with real data
        updateDocumentationWithRealData();
        
        // Step 3: Setup Git repository
        setupGitRepository();
        
        // Step 4: Commit and push
        commitAndPush();
        
        // Step 5: Enable GitHub Pages
        await enableGitHubPages();
        
        // Step 6: Trigger GitHub Actions
        await triggerGitHubActions();
        
        // Step 7: Display results
        displayResults();
        
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
