const fs = require('fs');
const logger = require('../utils/logger');
const prompts = require('../utils/prompts');
const shell = require('../utils/shell');

class Platform {
  constructor(name) {
    this.name = name;
    this.cliCommand = null;
  }

  // Override these in subclasses
  async detect() {
    throw new Error('detect() must be implemented');
  }

  async authenticate() {
    throw new Error('authenticate() must be implemented');
  }

  async configure() {
    // Optional - return true if no config needed
    return true;
  }

  async build() {
    try {
      // Check if package.json exists
      if (!fs.existsSync('package.json')) {
        logger.info('No package.json found, skipping build step');
        return { success: true };
      }

      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

      // Check if build script exists
      if (!packageJson.scripts || !packageJson.scripts.build) {
        const shouldBuild = prompts.askYesNo(
          'No build script found in package.json. Skip build step?',
          true
        );

        if (shouldBuild) {
          logger.warn('Skipping build. Make sure your files are ready to deploy.');
          return { success: true };
        }
      }

      // Run build
      logger.step('Running build...');
      const result = shell.execCommand('npm run build', { verbose: true });

      if (!result.success) {
        logger.error('Build failed: ' + (result.error || 'unknown'));
        return { success: false, error: 'Build failed' };
      }

      logger.success('Build completed!');
      return { success: true };
    } catch (err) {
      logger.error(`Build error: ${err && err.message ? err.message : String(err)}`);
      return { success: false, error: err && err.message ? err.message : String(err) };
    }
  }

  async deploy() {
    throw new Error('deploy() must be implemented');
  }

  // Full deployment flow
  async run() {
    try {
      logger.info(`Starting deployment to ${this.name}...`);

      const authResult = await this.authenticate();
      if (!authResult || !authResult.authenticated) {
        return { success: false, error: 'Authentication failed' };
      }

      const configResult = await this.configure();
      if (!configResult) {
        return { success: false, error: 'Configuration failed' };
      }

      const buildResult = await this.build();
      if (!buildResult || !buildResult.success) {
        return { success: false, error: 'Build failed' };
      }

      return await this.deploy();
    } catch (err) {
      logger.error(`Deployment flow error: ${err && err.message ? err.message : String(err)}`);
      return { success: false, error: err && err.message ? err.message : String(err) };
    }
  }
}

module.exports = Platform;
