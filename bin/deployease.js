#!/usr/bin/env node
const { program } = require('commander');
const { exec, which } = require('shelljs');
const inquirer = require('inquirer').default || require('inquirer');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

// Setting CLI version and description
program.version('1.0.0').description('DeployEase - Deploy frontend Apps Easily');

// Function to detect platform based on project files
function detectPlatform() {
    if (fs.existsSync('netlify.toml')) return 'netlify';
    if (fs.existsSync('vercel.json')) return 'vercel';
    if (fs.existsSync('firebase.json')) return 'firebase';
    return null;
}

// Function to ensure required CLI tools are installed
function ensureCLIInstalled(platform) {
    const cliMap = {
        netlify: { command: 'netlify', install: 'npm install -g netlify-cli' },
        vercel: { command: 'vercel', install: 'npm install -g vercel' },
        firebase: { command: 'firebase', install: 'npm install -g firebase-tools' },
    };

    if (!which(cliMap[platform].command)) {
        console.log(`⚠️ ${platform} CLI not found. Installing...`);
        exec(cliMap[platform].install);
    }
}

// Deploy command
program
    .command('deploy')
    .option('-p, --platform <platform>', 'Choose a platform (netlify, vercel, firebase)')
    .action(async (options) => {
        let platform = options.platform || detectPlatform();

        if (!platform) {
            const response = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'platform',
                    message: 'Select a deployment platform:',
                    choices: ['netlify', 'vercel', 'firebase'],
                },
            ]);
            platform = response.platform;
        }

        console.log(`🚀 Deploying to ${platform}...`);
        ensureCLIInstalled(platform); // Ensure required CLI is installed

        const deployCommands = {
            netlify: 'netlify deploy --prod',
            vercel: 'vercel deploy --prod --yes',
            firebase: 'firebase deploy',
        };

        if (deployCommands[platform]) {
            exec(deployCommands[platform]);
        } else {
            console.log('❌ Invalid platform selected.');
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
