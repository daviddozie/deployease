const fs = require('fs');
const Platform = require('./base');
const logger = require('../utils/logger');
const prompts = require('../utils/prompts');
const shell = require('../utils/shell');

class GithubPlatform extends Platform {
  constructor() {
    super('GitHub Pages');
    this.cliCommand = 'gh-pages';
    this.buildDir = 'build';
  }

  async detect() {
    try {
      const exists = fs.existsSync('.github/workflows');
      if (exists) logger.info('Detected GitHub Actions workflows (.github/workflows)');
      return exists;
    } catch (err) {
      logger.error('detect error: ' + (err && err.message ? err.message : String(err)));
      return false;
    }
  }

  async authenticate() {
    // GitHub Pages deploy uses local npm scripts - no auth step here
    return { authenticated: true, error: '' };
  }

  async configure() {
    try {
      // Ask for build dir
      const dir = prompts.askQuestion('Enter build directory to publish', 'build') || 'build';
      this.buildDir = dir;

      // Ensure gh-pages is installed locally
      const ghPath = 'node_modules/gh-pages';
      if (!fs.existsSync(ghPath)) {
        logger.step('Installing gh-pages...');
        const res = shell.execCommand('npm install gh-pages', { verbose: true, execOptions: { stdio: 'inherit' } });
        if (!res.success) {
          logger.error('Failed to install gh-pages: ' + (res.error || 'unknown'));
          return false;
        }
      }

      // Ensure package.json has deploy script
      if (!fs.existsSync('package.json')) {
        logger.error('package.json not found — cannot add deploy script');
        return false;
      }

      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8')) || {};
      pkg.scripts = pkg.scripts || {};
      if (!pkg.scripts.deploy) {
        logger.step('Adding deploy script to package.json...');
        pkg.scripts.deploy = `gh-pages -d ${this.buildDir}`;
        fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
      } else {
        // If deploy exists, ensure it references the chosen buildDir (best effort)
        if (!pkg.scripts.deploy.includes(this.buildDir)) {
          logger.warn('Existing deploy script does not reference chosen build dir — leaving unchanged');
        }
      }

      return true;
    } catch (err) {
      logger.error('Configure error: ' + (err && err.message ? err.message : String(err)));
      return false;
    }
  }

  async deploy() {
    try {
      logger.step('Building project...');
      // Run build if script exists
      const pkgExists = fs.existsSync('package.json');
      if (pkgExists) {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        if (pkg.scripts && pkg.scripts.build) {
          const buildRes = shell.execCommand('npm run build', { verbose: true, execOptions: { stdio: 'inherit' } });
          if (!buildRes.success) {
            logger.error('Build failed: ' + (buildRes.error || 'unknown'));
            return { success: false, url: '', error: buildRes.error || 'build failed' };
          }
        } else {
          logger.info('No build script found — skipping build');
        }
      }

      logger.step('Deploying to GitHub Pages (npm run deploy)...');
      const deployRes = shell.execCommand('npm run deploy', { verbose: true, execOptions: { stdio: 'inherit' } });
      if (!deployRes.success) {
        logger.error('Deployment failed: ' + (deployRes.error || 'unknown'));
        return { success: false, url: '', error: deployRes.error || 'deploy failed' };
      }

      // We don't reliably have a URL, return success
      logger.success('Successfully deployed to GitHub Pages!');
      return { success: true, url: '', error: '' };
    } catch (err) {
      logger.error('Deploy error: ' + (err && err.message ? err.message : String(err)));
      return { success: false, url: '', error: err && err.message ? err.message : String(err) };
    }
  }
}

module.exports = GithubPlatform;
