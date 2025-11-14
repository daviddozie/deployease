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
    this.deployMode = null; // 'workers' or 'pages'
    this.pagesDirectory = null;
    this.pagesProjectName = null;
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
      // If wrangler.toml exists, try to parse it for a main entry
      if (fs.existsSync('wrangler.toml')) {
        const toml = fs.readFileSync('wrangler.toml', 'utf8');
        const m = toml.match(/main\s*=\s*["'](.+?)["']/);
        if (m && m[1]) {
          const entry = m[1];
          if (fs.existsSync(entry)) {
            this.deployMode = 'workers';
            this.entryPoint = entry;
            logger.info(`Detected Cloudflare Worker (wrangler.toml -> main = ${entry})`);
            return { success: true };
          }

          logger.error(`Please build your project first. Expected file: ${entry}`);
          // Offer to create a basic wrangler.toml (even though one exists without a valid entry)
          const create = prompts.askYesNo('Wrangler entry point is missing. Do you want to create/update a basic wrangler.toml (main -> dist/index.js)?', false);
          if (create) {
            const wranglerConfig = 'name = "my-cloudflare-project"\ntype = "javascript"\nmain = "dist/index.js"\ncompatibility_date = "2025-02-20"\n';
            fs.writeFileSync('wrangler.toml', wranglerConfig);
            logger.success('✔️ Created/updated wrangler.toml with main = dist/index.js');
          }

          return { success: false, error: `Build required: missing ${entry}` };
        }

        // No main field present in toml: ask user whether to use Workers or Pages
        const pickWorkers = prompts.askYesNo('wrangler.toml exists but has no "main" field. Deploy to Workers instead of Pages?', false);
        if (!pickWorkers) {
          // Pages flow below will handle pages configuration
        } else {
          // No main in toml; prompt for an entry and create/update the toml
          const entry = prompts.askQuestion('Enter the Workers entry point file (default: dist/index.js):', 'dist/index.js') || 'dist/index.js';
          const wranglerConfig = `name = "my-cloudflare-project"\ntype = "javascript"\nmain = "${entry}"\ncompatibility_date = "2025-02-20"\n`;
          fs.writeFileSync('wrangler.toml', wranglerConfig);
          if (!fs.existsSync(entry)) {
            logger.error(`Please build your project first. Expected file: ${entry}`);
            return { success: false, error: `Build required: missing ${entry}` };
          }
          this.deployMode = 'workers';
          this.entryPoint = entry;
          logger.info(`Created wrangler.toml and will deploy Workers using entry ${entry}`);
          return { success: true };
        }
      }

      // No wrangler.toml present — ask user whether to deploy Workers or Pages
      const useWorkers = prompts.askYesNo('Do you want to deploy to Cloudflare Workers?', false);
      if (useWorkers) {
        // Offer to create a basic wrangler.toml
        const create = prompts.askYesNo('No wrangler.toml found. Create a basic one (main -> dist/index.js)?', true);
        if (create) {
          const wranglerConfig = 'name = "my-cloudflare-project"\ntype = "javascript"\nmain = "dist/index.js"\ncompatibility_date = "2025-02-20"\n';
          fs.writeFileSync('wrangler.toml', wranglerConfig);
          logger.success('✔️ Created wrangler.toml!');
        }

        // Validate entry point
        const expected = 'dist/index.js';
        if (!fs.existsSync(expected)) {
          logger.error(`Please build your project first. Expected file: ${expected}`);
          return { success: false, error: `Build required: missing ${expected}` };
        }

        this.deployMode = 'workers';
        this.entryPoint = expected;
        logger.info('Will deploy Cloudflare Workers');
        return { success: true };
      }

      // Pages flow: smart defaults
      const candidates = ['build', 'dist', 'public', 'out'];
      let defaultDir = 'public';
      for (const d of candidates) {
        if (fs.existsSync(d)) {
          defaultDir = d;
          break;
        }
      }

      const directory = prompts.askQuestion(`Which directory contains your built files? (default: ./${defaultDir})`, `./${defaultDir}`) || `./${defaultDir}`;
      if (!fs.existsSync(directory)) {
        logger.error('Please build your project first. Publish directory does not exist.');
        return { success: false, error: 'Build required: publish directory missing' };
      }

      const files = fs.readdirSync(directory).filter(f => f !== '.gitkeep');
      if (!files || files.length === 0) {
        logger.error('Please build your project first. Publish directory is empty.');
        return { success: false, error: 'Build required: publish directory empty' };
      }

      this.pagesDirectory = directory;
      this.deployMode = 'pages';

      // Ask for a project name to use with pages deploy
      const projectName = prompts.askQuestion('Enter the Cloudflare Pages project name to use for deployment (project will be created if missing):', 'my-cloudflare-project') || 'my-cloudflare-project';
      this.pagesProjectName = projectName;

      logger.info(`Will deploy Cloudflare Pages from '${this.pagesDirectory}' (project: ${this.pagesProjectName})`);
      return { success: true };
    } catch (err) {
      logger.error('Configure error: ' + (err && err.message ? err.message : String(err)));
      return { success: false, error: err && err.message ? err.message : String(err) };
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
      if (this.deployMode === 'workers') {
        logger.step('Deploying to Cloudflare Workers...');
        const res = shell.execCommand('wrangler deploy', { verbose: true });
        if (!res.success) {
          logger.error('Cloudflare Workers deployment failed: ' + (res.error || 'unknown'));
          return { success: false, url: '', error: res.error || 'deploy failed' };
        }
        logger.success('Cloudflare Workers deployed successfully');
        return { success: true, url: '', error: '' };
      }

      if (this.deployMode === 'pages') {
        logger.step('Deploying to Cloudflare Pages...');
        if (!this.pagesDirectory || !fs.existsSync(this.pagesDirectory)) {
          logger.error(`Publish directory '${this.pagesDirectory}' does not exist`);
          return { success: false, url: '', error: 'publish directory missing' };
        }

        const projectFlag = this.pagesProjectName ? `--project-name ${this.pagesProjectName}` : '';
        const cmd = `wrangler pages deploy ${this.pagesDirectory} ${projectFlag}`.trim();
        const res = shell.execCommand(cmd, { verbose: true });
        if (!res.success) {
          logger.error('Cloudflare Pages deployment failed: ' + (res.error || 'unknown'));
          return { success: false, url: '', error: res.error || 'deploy failed' };
        }

        logger.success('Cloudflare Pages deployed successfully');
        return { success: true, url: '', error: '' };
      }

      logger.error('Deploy error: deployment mode not configured (workers/pages)');
      return { success: false, url: '', error: 'not configured' };
    } catch (err) {
      logger.error('Deploy error: ' + (err && err.message ? err.message : String(err)));
      return { success: false, url: '', error: err && err.message ? err.message : String(err) };
    }
  }
}

module.exports = CloudflarePlatform;
