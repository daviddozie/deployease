#!/usr/bin/env node
const { program } = require('commander');
const { execSync } = require('child_process');
execSync('vercel deploy --prod --yes', { stdio: 'inherit' });
const fs = require('fs');

// CLI version
program.version('1.0.0').description('DeployEase - Deploy frontend Apps Easily');

// Detect the deployment platform
function detectPlatform() {
    if (fs.existsSync('netlify.toml')) return 'netlify';
    if (fs.existsSync('vercel.json')) return 'vercel';
    if (fs.existsSync('firebase.json')) return 'firebase';
    return 'vercel'; // Default to Vercel
}

// Deploy command
program.command('deploy')
    .description('Deploy your frontend project automatically')
    .action(() => {
        const platform = detectPlatform();
        console.log(`🚀 Deploying to ${platform}...`);

        const commands = {
            netlify: 'netlify deploy --prod',
            vercel: 'vercel deploy --prod --yes',
            firebase: 'firebase deploy'
        };

        if (commands[platform]) {
            execSync(commands[platform], { stdio: 'inherit' });
        } else {
            console.log('❌ Unsupported platform detected. Please check your config.');
        }
    });

// List deployed projects
program.command('list-projects')
    .description('List deployed projects from Netlify, Vercel, or Firebase')
    .action(() => {
        console.log('📄 Fetching deployed projects...');
        execSync('netlify sites:list || vercel ls || firebase projects:list', { stdio: 'inherit' });
    });

// Parse CLI arguments
program.parse(process.argv);
