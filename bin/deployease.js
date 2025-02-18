#!/usr/bin/env node
const { program } = require('commander');
const { exec } = require('shelljs');
const inquirer = require('inquirer').default || require('inquirer');
const dotenv = require('dotenv');

dotenv.config();

// Setting the CLI version and description
program.version('1.0.0').description('DeployEase - Deploy frontend Apps Easily');

//Setting The Deploy Command
program
    .command('deploy')
    .option('-p, --platform <platform>', 'Choose a platform (netlify, vercel, firebase)')
    .action(async (options) => {
        let platform = options.platform;

        if (!platform) {
            const response = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'platform',
                    message: 'Select a deployment platform',
                    choices: ['netlify', 'vercel', 'firebase'],
                },
            ]);
            platform = response.platform;
        }

        console.log(`Deploying to ${platform}...`);

        if (platform === 'netlify') {
            exec('netlify deploy --prod');
        } else if (platform === 'vercel') {
            exec('vercel deploy --prod --yes');
        } else if (platform === 'firebase') {
            exec('firebase deploy');
        } else {
            console.log('Invalid platform selected.');
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
