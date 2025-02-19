#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

//Written Function to detect platform
function detectPlatform() {
    if (fs.existsSync('netlify.toml')) return 'netlify';
    if (fs.existsSync('vercel.json')) return 'vercel';
    if (fs.existsSync('firebase.json')) return 'firebase';
    return 'vercel'; // Default to Vercel
}

//Written Function to execute shell commands
function runCommand(command) {
    try {
        execSync(command, { stdio: 'inherit' });
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
}

// Command for Deployment
function deploy() {
    const platform = detectPlatform();
    console.log(`🚀 Deploying to ${platform}...`);

    if (platform === 'netlify') {
        runCommand('npx netlify deploy --prod');
    } else if (platform === 'vercel') {
        runCommand('npx vercel deploy --prod --yes');
    } else if (platform === 'firebase') {
        runCommand('npx firebase deploy');
    } else {
        console.error('❌ No supported deployment platform found.');
        process.exit(1);
    }
}

// Handles the CLI input
if (process.argv[2] === 'deploy') {
    deploy();
} else {
    console.log('❌ Unknown command. Use: deployease deploy');
    process.exit(1);
}
