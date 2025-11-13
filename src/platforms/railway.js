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
    // Delegate to shared authenticator
    return authenticator.authenticate('railway');
  }

  async deploy() {
    logger.info('🚀 Deploying to Railway...');

    // Ensure railway CLI available (or allow npx fallback)
    const ensure = installer.ensureCLI('railway');
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

    const cmd = `${useNpx ? 'npx ' : ''}railway up`;
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
