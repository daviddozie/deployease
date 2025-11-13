const fs = require('fs');
const Platform = require('./base');
const installer = require('../core/installer');
const authenticator = require('../core/authenticator');
const logger = require('../utils/logger');
const shell = require('../utils/shell');

class KoyebPlatform extends Platform {
  constructor() {
    super('koyeb');
    this.cliCommand = 'koyeb';
  }

  async detect() {
    try {
      return fs.existsSync('koyeb.yaml') || fs.existsSync('koyeb.yml');
    } catch (err) {
      return false;
    }
  }

  async authenticate() {
    return authenticator.authenticate('koyeb');
  }

  async deploy() {
    logger.info('🚀 Deploying to Koyeb...');

    const ensure = installer.ensureCLI('koyeb');
    let useNpx = false;
    if (!ensure.success) {
      useNpx = !!ensure.useNpx;
      logger.warn('Koyeb CLI not found locally; will try to run via npx if available.');
    }

    const auth = await this.authenticate();
    if (!auth || !auth.authenticated) {
      logger.error('❌ Koyeb authentication failed.');
      return { success: false, error: 'Authentication failed' };
    }

    const cmd = `${useNpx ? 'npx ' : ''}koyeb service deploy`;
    logger.step(`Running: ${cmd}`);

    const res = shell.execCommand(cmd, { execOptions: { stdio: 'inherit' } });
    if (!res.success) {
      logger.error('❌ Koyeb deployment failed: ' + (res.error || res.output || 'unknown'));
      return { success: false, error: res.error || res.output || 'koyeb service deploy failed' };
    }

    logger.success('✅ Koyeb deployment finished');
    return { success: true };
  }
}

module.exports = KoyebPlatform;
