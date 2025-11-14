const fs = require('fs');
const Platform = require('./base');
const installer = require('../core/installer');
const authenticator = require('../core/authenticator');
const logger = require('../utils/logger');
const shell = require('../utils/shell');

class RailwayPlatform extends Platform {
  constructor() {
    super('railway');
    this.cliCommand = 'railway';
  }

  async detect() {
    try {
      return fs.existsSync('railway.json');
    } catch (err) {
      return false;
    }
  }

  async authenticate() {
    try {
      // Check current auth status
      const whoami = shell.execCommand('railway whoami', { verbose: false });
      if (whoami.success) return { authenticated: true, error: '' };

      // Try to login interactively
      logger.info('Logging in to Railway...');
      const login = shell.execCommand('railway login', { execOptions: { stdio: 'inherit' } });
      if (!login.success) {
        return { authenticated: false, error: login.error || login.output || 'railway login failed' };
      }

      const whoami2 = shell.execCommand('railway whoami', { verbose: false });
      if (whoami2.success) return { authenticated: true, error: '' };
      return { authenticated: false, error: 'not authenticated' };
    } catch (err) {
      logger.error('Authentication error: ' + (err && err.message ? err.message : String(err)));
      return { authenticated: false, error: err && err.message ? err.message : String(err) };
    }
  }

  async deploy() {
    logger.info('🚀 Deploying to Railway...');

    // Ensure railway CLI available (or allow npx fallback)
    const ensure = installer.ensureCLI('@railway/cli');
    let useNpx = false;
    if (!ensure.success) {
      useNpx = !!ensure.useNpx;
      logger.warn('Railway CLI not found locally; will try to run via npx if available.');
    }
    const auth = await this.authenticate();
    if (!auth || !auth.authenticated) {
      logger.error('❌ Railway authentication failed.');
      return { success: false, error: 'Authentication failed' };
    }

    const runner = `${useNpx ? 'npx ' : ''}railway`;

    // Attempt to link the project (will prompt if needed)
    logger.step('Ensuring project is linked to Railway (running `railway link`)...');
    const linkRes = shell.execCommand(`${runner} link`, { execOptions: { stdio: 'inherit' } });
    if (!linkRes.success) {
      logger.warn('railway link did not complete successfully. If your project is already linked this may be fine.');
    }

    // Deploy using railway v3 command
    const cmd = `${runner} up`;
    logger.step(`Running: ${cmd}`);
    const res = shell.execCommand(cmd, { execOptions: { stdio: 'inherit' } });
    if (!res.success) {
      logger.error('❌ Railway deployment failed: ' + (res.error || res.output || 'unknown'));
      return { success: false, error: res.error || res.output || 'railway up failed' };
    }

    logger.success('✅ Railway deployment finished');
    return { success: true };
  }
}

module.exports = RailwayPlatform;
