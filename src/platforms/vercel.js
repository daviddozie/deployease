const fs = require('fs');
const Platform = require('./base');
const logger = require('../utils/logger');
const prompts = require('../utils/prompts');
const installer = require('../core/installer');
const authenticator = require('../core/authenticator');
const shell = require('../utils/shell');

class VercelPlatform extends Platform {
  constructor() {
    super('Vercel');
    this.cliCommand = 'vercel';

    try {
      const res = installer.ensureCLI('vercel');
      this.useNpx = Boolean(res && res.useNpx);
      if (res && res.success) {
        logger.info('vercel CLI available');
      } else if (this.useNpx) {
        logger.warn('vercel CLI not installed globally — will use npx');
      }
    } catch (err) {
      logger.warn('installer.ensureCLI failed: ' + (err && err.message ? err.message : String(err)));
      this.useNpx = true;
    }
  }

  async detect() {
    try {
      const exists = fs.existsSync('vercel.json');
      if (exists) logger.info('Detected Vercel configuration (vercel.json)');
      return exists;
    } catch (err) {
      logger.error('detect error: ' + (err && err.message ? err.message : String(err)));
      return false;
    }
  }

  async authenticate() {
    try {
      return authenticator.authenticate('vercel');
    } catch (err) {
      logger.error('Authentication error: ' + (err && err.message ? err.message : String(err)));
      return { authenticated: false, error: err && err.message ? err.message : String(err) };
    }
  }

  /**
   * Ensure project is linked to Vercel. If not, run `vercel link`.
   */
  async configure() {
    try {
      // Check if project is linked to Vercel
      const whoamiCmd = this.useNpx ? 'npx vercel whoami' : 'vercel whoami';
      const res = shell.execCommand(whoamiCmd, { verbose: false });
      if (res.success) {
        logger.info('Project already linked to Vercel');
        // still ask for a deploy directory so deploy can use a known target
        // fall through to directory selection below
      }

      logger.info('🔗 Linking project to Vercel...');
      const linkCmd = this.useNpx ? 'npx vercel link' : 'vercel link';
      const linkRes = shell.execCommand(linkCmd, { verbose: true, execOptions: { stdio: 'inherit' } });
      if (!linkRes.success) {
        logger.error('Failed to link project to Vercel: ' + (linkRes.error || 'unknown'));
        return false;
      }

      logger.success('Project linked to Vercel');
      // continue to choose a publish directory
    } catch (err) {
      logger.error('Configure error: ' + (err && err.message ? err.message : String(err)));
      return false;
    }

    try {
      // Ask for publish directory with smart defaults
      const candidates = ['build', 'dist', 'out', 'public'];
      let defaultDir = 'public';
      for (const d of candidates) {
        if (fs.existsSync(d)) {
          defaultDir = d;
          break;
        }
      }

      const directory = prompts.askQuestion('Which directory contains your built files?', `./${defaultDir}`) || `./${defaultDir}`;
      if (!fs.existsSync(directory)) {
        logger.error(`Publish directory '${directory}' does not exist. Please build your project first.`);
        return false;
      }

      const files = fs.readdirSync(directory).filter(f => f !== '.gitkeep');
      if (!files || files.length === 0) {
        logger.error(`Publish directory '${directory}' is empty. Please build your project first.`);
        return false;
      }

      this.publishDir = directory;
      logger.info(`Will deploy Vercel from '${this.publishDir}'`);
      return true;
    } catch (err) {
      logger.error('Configure error: ' + (err && err.message ? err.message : String(err)));
      return false;
    }
  }

  async deploy() {
    try {
      logger.step('Deploying to Vercel...');

      // Build if package.json has build script — Platform.build will handle this when run() is used.
      const cmd = this.useNpx ? 'npx vercel deploy --prod' : 'vercel deploy --prod';
      const res = shell.execCommand(cmd, { verbose: true });

      if (!res.success) {
        logger.error('Vercel deploy failed: ' + (res.error || 'unknown error'));
        return { success: false, url: '', error: res.error || 'deploy failed' };
      }

      const out = res.output || '';
  const urlMatch = out.match(/https?:\/\/[^\s)]+/i);
      const url = urlMatch ? urlMatch[0] : '';

      logger.success('Vercel deploy completed' + (url ? ` — ${url}` : ''));
      return { success: true, url, error: '' };
    } catch (err) {
      logger.error('Deploy error: ' + (err && err.message ? err.message : String(err)));
      return { success: false, url: '', error: err && err.message ? err.message : String(err) };
    }
  }
}

module.exports = VercelPlatform;
