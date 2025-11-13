const fs = require('fs');
const Platform = require('./base');
const logger = require('../utils/logger');
const installer = require('../core/installer');
const authenticator = require('../core/authenticator');
const shell = require('../utils/shell');

class NetlifyPlatform extends Platform {
  constructor() {
    super('Netlify');
    this.cliCommand = 'netlify';

    // Ensure CLI is available (attempt global install). installer.ensureCLI is synchronous
    try {
      const res = installer.ensureCLI('netlify-cli');
      this.useNpx = Boolean(res && res.useNpx);
      if (res && res.success) {
        logger.info('netlify-cli available');
      } else if (this.useNpx) {
        logger.warn('netlify-cli not installed globally — will use npx');
      }
    } catch (err) {
      logger.warn('installer.ensureCLI failed: ' + (err && err.message ? err.message : String(err)));
      this.useNpx = true;
    }
  }

  async detect() {
    try {
      const exists = fs.existsSync('netlify.toml');
      if (exists) logger.info('Detected Netlify configuration (netlify.toml)');
      return exists;
    } catch (err) {
      logger.error('detect error: ' + (err && err.message ? err.message : String(err)));
      return false;
    }
  }

  async authenticate() {
    try {
      const res = authenticator.authenticate('netlify');
      return res;
    } catch (err) {
      logger.error('Authentication error: ' + (err && err.message ? err.message : String(err)));
      return { authenticated: false, error: err && err.message ? err.message : String(err) };
    }
  }

  async deploy() {
    try {
      logger.step('Deploying to Netlify...');

      // Choose command depending on whether we'll use npx fallback
      let cmd;
      if (this.useNpx) {
        // netlify-cli is the npm package; use npx to invoke it
        cmd = 'npx netlify-cli deploy --prod';
      } else {
        cmd = 'netlify deploy --prod';
      }

      // Run and capture output to try to extract the deploy URL
      const res = shell.execCommand(cmd, { verbose: true });

      if (!res.success) {
        logger.error('Netlify deploy failed: ' + (res.error || 'unknown error'));
        return { success: false, url: '', error: res.error || 'deploy failed' };
      }

      // Try to parse a URL from output
      const out = res.output || '';
  const urlMatch = out.match(/https?:\/\/[^\s)]+/i);
      const url = urlMatch ? urlMatch[0] : '';

      logger.success('Netlify deploy completed' + (url ? ` — ${url}` : ''));
      return { success: true, url, error: '' };
    } catch (err) {
      logger.error('Deploy error: ' + (err && err.message ? err.message : String(err)));
      return { success: false, url: '', error: err && err.message ? err.message : String(err) };
    }
  }
}

module.exports = NetlifyPlatform;
