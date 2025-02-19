#!/usr/bin/env node
const { program } = require('commander');
const { exec } = require('shelljs');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

// Setting the CLI version and description
program.version('1.0.0').description('DeployEase - Deploy frontend Apps Easily');

// Function to detect the deployment platform
function detectPlatform() {
    if (fs.existsSync('netlify.toml')) return 'netlify';
    if (fs.existsSync('vercel.json')) return 'vercel';
    if (fs.existsSync('firebase.json')) return 'firebase';
    return 'vercel'; // Default to Vercel
}

// Deploy Command
program
    .command('deploy')
    .description('Deploy your frontend project automatically')
    .action(() => {
        const platform = detectPlatform();
        console.log(`🚀 Deploying to ${platform}...`);

        if (platform === 'netlify') {
            exec('netlify deploy --prod');
        } else if (platform === 'vercel') {
            exec('vercel deploy --prod --yes');
        } else if (platform === 'firebase') {
            exec('firebase deploy');
        } else {
            console.log('❌ Unsupported platform detected. Please ensure you have the correct configuration.');
        }
    });

// List deployed projects
program
    .command('list-projects')
    .description('List deployed projects from Netlify, Vercel, or Firebase')
    .action(() => {
        console.log('📄 Fetching deployed projects...');
        exec('netlify sites:list || vercel ls || firebase projects:list');
    });

// Parse CLI arguments
program.parse(process.argv);
