#!/usr/bin/env node

/**
 * Deployment Helper Script
 * Helps prepare files for production deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Portfolio Deployment Helper');
console.log('================================\n');

// Check if this is a production build
const isProduction = process.argv.includes('--production');

if (isProduction) {
    console.log('📦 Preparing for PRODUCTION deployment...\n');
    
    // Create production build directory
    const buildDir = 'build';
    if (!fs.existsSync(buildDir)) {
        fs.mkdirSync(buildDir);
    }
    
    // Copy frontend files
    const frontendFiles = [
        'index.html',
        'styles.css', 
        'script.js',
        'netlify.toml'
    ];
    
    frontendFiles.forEach(file => {
        if (fs.existsSync(file)) {
            fs.copyFileSync(file, path.join(buildDir, file));
            console.log(`✅ Copied ${file} to build directory`);
        } else {
            console.log(`⚠️  ${file} not found`);
        }
    });
    
    console.log('\n📋 Next Steps:');
    console.log('1. Deploy backend to Railway:');
    console.log('   - Visit https://railway.app');
    console.log('   - Connect GitHub repository');
    console.log('   - Set environment variables');
    console.log('');
    console.log('2. Deploy frontend to Netlify:');
    console.log('   - Drag the build/ folder to netlify.com');
    console.log('   - Or connect GitHub repository');
    console.log('');
    console.log('3. Update API URLs in script.js with actual Railway URL');
    console.log('');
    console.log('🎉 Your portfolio will be live!');
    
} else {
    console.log('🔧 Development Mode\n');
    
    // Check required files
    const requiredFiles = [
        'index.html',
        'styles.css',
        'script.js', 
        'server.js',
        'package.json',
        '.env'
    ];
    
    console.log('📋 Checking required files...');
    let allFilesExist = true;
    
    requiredFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`✅ ${file}`);
        } else {
            console.log(`❌ ${file} - MISSING`);
            allFilesExist = false;
        }
    });
    
    // Check templates directory
    if (fs.existsSync('templates/emails')) {
        console.log('✅ templates/emails/');
    } else {
        console.log('❌ templates/emails/ - MISSING');
        allFilesExist = false;
    }
    
    console.log('');
    
    if (allFilesExist) {
        console.log('🎉 All files ready for deployment!');
        console.log('');
        console.log('📋 Quick Start:');
        console.log('1. Run: npm start (for backend)');
        console.log('2. Run: python -m http.server 8000 (for frontend)');
        console.log('3. Test locally at http://localhost:8000');
        console.log('');
        console.log('🚀 Ready to deploy? Run: node deploy.js --production');
    } else {
        console.log('⚠️  Some files are missing. Please check the setup.');
    }
}

console.log('');
console.log('📧 Email Setup Checklist:');
console.log('□ Gmail App Password configured in .env');
console.log('□ Environment variables set on Railway');
console.log('□ CORS origins updated with production URLs');
console.log('□ API endpoint updated in script.js');
console.log('');
console.log('💡 Need help? Check DEPLOYMENT_GUIDE.md');
