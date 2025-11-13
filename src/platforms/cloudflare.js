const fs = require('fs');
const Platform = require('./base');
const logger = require('../utils/logger');
const prompts = require('../utils/prompts');
const shell = require('../utils/shell');

class CloudflarePlatform extends Platform {
  constructor() {
    super('Cloudflare');
    this.cliCommand = 'wrangler';
    this.isWorker = false;
    this.pagesDir = './public';
  }

  async detect() {
    try {
      const exists = fs.existsSync('wrangler.toml');
      if (exists) logger.info('Detected Cloudflare configuration (wrangler.toml)');
      return exists;
    } catch (err) {
      logger.error('detect error: ' + (err && err.message ? err.message : String(err)));
      return false;
    }
  }

  async configure() {
    try {
      // If wrangler.toml exists assume Worker config
      if (fs.existsSync('wrangler.toml')) {
        this.isWorker = true;
        logger.info('wrangler.toml present — deploying as Cloudflare Worker');
        return true;
      }

      // Ask user whether to deploy Workers or Pages
      const useWorkers = prompts.askYesNo('Do you want to deploy to Cloudflare Workers?', false);
      if (useWorkers) {
        logger.step('Creating Cloudflare Workers configuration...');

        const wranglerConfig = `name = "my-cloudflare-project"\ntype = "javascript"\nmain = "dist/index.js"\ncompatibility_date = "2025-02-20"\n`;

        fs.writeFileSync('wrangler.toml', wranglerConfig);
        logger.success('✔️ Created wrangler.toml!');
        this.isWorker = true;
        return true;
      }

      // Pages flow
      const directory = prompts.askQuestion('Enter the directory to publish (default: ./public):', './public') || './public';
      if (!fs.existsSync(directory)) {
        logger.error(`❌ The directory '${directory}' does not exist.`);
        return false;
      }

      this.pagesDir = directory;
      this.isWorker = false;
      logger.info(`Will deploy Cloudflare Pages from '${this.pagesDir}'`);
      return true;
    } catch (err) {
      logger.error('Configure error: ' + (err && err.message ? err.message : String(err)));
      return false;
    }
  }

  async authenticate() {
    // Cloudflare auth handled by wrangler; reuse authenticator via shell check
    try {
      // Try to run a whoami equivalent; if it succeeds, assume authenticated
      const res = shell.execCommand('wrangler whoami', { verbose: false });
      if (res.success) return { authenticated: true, error: '' };
      // otherwise caller may trigger login in authenticator; but we return false to let flow handle it
      return { authenticated: false, error: res.error || 'not authenticated' };
    } catch (err) {
      return { authenticated: false, error: err && err.message ? err.message : String(err) };
    }
  }

  async deploy() {
    try {
      if (this.isWorker) {
        logger.step('Deploying to Cloudflare Workers...');
        const res = shell.execCommand('wrangler deploy', { verbose: true });
        if (!res.success) {
          logger.error('Cloudflare Workers deployment failed: ' + (res.error || 'unknown'));
          return { success: false, url: '', error: res.error || 'deploy failed' };
        }
        logger.success('Cloudflare Workers deployed successfully');
        return { success: true, url: '', error: '' };
      }

      logger.step('Deploying to Cloudflare Pages...');
      if (!this.pagesDir || !fs.existsSync(this.pagesDir)) {
        logger.error(`Publish directory '${this.pagesDir}' does not exist`);
        return { success: false, url: '', error: 'publish directory missing' };
      }

      const res = shell.execCommand(`wrangler pages publish ${this.pagesDir}`, { verbose: true });
      if (!res.success) {
        logger.error('Cloudflare Pages deployment failed: ' + (res.error || 'unknown'));
        return { success: false, url: '', error: res.error || 'deploy failed' };
      }

      logger.success('Cloudflare Pages deployed successfully');
      return { success: true, url: '', error: '' };
    } catch (err) {
      logger.error('Deploy error: ' + (err && err.message ? err.message : String(err)));
      return { success: false, url: '', error: err && err.message ? err.message : String(err) };
    }
  }
}

module.exports = CloudflarePlatform;
