const fs = require('fs');
const Platform = require('./base');
const logger = require('../utils/logger');
const shell = require('../utils/shell');
const prompts = require('../utils/prompts');

class RenderPlatform extends Platform {
  constructor() {
    super('render');
    this.cliCommand = null; // no dedicated CLI
  }

  // detect by presence of render.yaml (or render.yml)
  async detect() {
    try {
      return fs.existsSync('render.yaml') || fs.existsSync('render.yml');
    } catch (err) {
      return false;
    }
  }

  // Authentication for Render is Git-based; nothing to do here.
  async authenticate() {
    return { authenticated: true };
  }

  // Deploy by pushing to git remote. Prompts user to commit local changes.
  async deploy() {
    logger.info('📦 Preparing Render deployment (git-based)...');

    // Ensure prompts available
    prompts.ensureReadlineSync();

    // 1) Make sure we're in a git repository
    const insideRepo = shell.execCommand('git rev-parse --is-inside-work-tree');
    if (!insideRepo.success) {
      logger.error('❌ This directory is not a git repository.');
      logger.info('To deploy to Render you must push a git repository to a remote provider (GitHub/GitLab/Bitbucket).');
      logger.info('Run these commands to initialize and push:\n- git init\n- git add -A\n- git commit -m "Initial commit"\n- git remote add origin <your-remote-url>\n- git push -u origin <branch>');
      return { success: false, error: 'Not a git repository' };
    }

    // 2) Check for git remotes
    const remotes = shell.execCommand('git remote -v');
    if (!remotes.success || !remotes.output || !remotes.output.trim()) {
      logger.warn('⚠️ No git remote detected.');
      logger.info('Add a remote that points to your Git host (GitHub/GitLab/Bitbucket) and push the branch. Example:');
      logger.info('  git remote add origin https://github.com/username/repo.git');
      logger.info('  git push -u origin main');
      return { success: false, error: 'No git remote configured' };
    }

    // 3) Check for uncommitted changes
    const status = shell.execCommand('git status --porcelain');
    if (status.success && status.output && status.output.trim()) {
      logger.warn('⚠️ You have uncommitted changes in your working tree.');
      const commitNow = prompts.askYesNo('Do you want to create a commit from these changes and continue?', true);

      if (!commitNow) {
        logger.error('Aborting deployment. Please commit or stash your changes and run this command again.');
        return { success: false, error: 'Uncommitted changes present' };
      }

      // Ask for commit message
      const defaultMsg = 'deployease: deploy';
  const message = prompts.askQuestion('Commit message', defaultMsg).trim() || defaultMsg;

  logger.step('Staging changes...');
  const addRes = shell.execCommand('git add -A');
      if (!addRes.success) {
        logger.error('❌ git add failed: ' + (addRes.error || addRes.output || 'unknown'));
        return { success: false, error: 'git add failed' };
      }

  logger.step('Committing...');
  // Use stdio: inherit so commit hooks and user prompts (if any) can run
  // Prepare a shell-safe quoted message by escaping any double-quotes at runtime
  const safeMsg = message.replace(/"/g, '\\"');
  const commitRes = shell.execCommand('git commit -m "' + safeMsg + '"', { execOptions: { stdio: 'inherit' } });
      if (!commitRes.success) {
        logger.error('❌ git commit failed: ' + (commitRes.error || commitRes.output || 'unknown'));
        return { success: false, error: 'git commit failed' };
      }
    }

    // 4) Push to remote
    logger.step('Pushing current branch to remote...');
    // Use interactive stdio so credentials (if needed) are handled by git
    const pushRes = shell.execCommand('git push', { execOptions: { stdio: 'inherit' } });
    if (!pushRes.success) {
      logger.error('❌ git push failed: ' + (pushRes.error || pushRes.output || 'unknown'));
      logger.info('If this is the first push, run: git push -u <remote> <branch>');
      return { success: false, error: 'git push failed' };
    }

    logger.success('✅ Code pushed to remote successfully.');

    // 5) Provide Render dashboard connection instructions
    const remoteInfo = remotes.output || '';
    let host = 'your Git provider';
    if (/github\.com/.test(remoteInfo)) host = 'GitHub';
    else if (/gitlab\.com/.test(remoteInfo)) host = 'GitLab';
    else if (/bitbucket\.org/.test(remoteInfo)) host = 'Bitbucket';

    logger.info('\n🔗 Next steps to connect your repository to Render:');
    logger.info('1. Go to https://dashboard.render.com and sign in or create an account.');
  logger.info('2. Click "New+" → Select "Web Service".');
  logger.info(`3. Choose ${host} as the provider and authorize Render to access your repository (if required).`);
    logger.info('4. Select the repository you just pushed and pick the branch you want Render to deploy (e.g. main).');
    logger.info('5. Set the build command (if your project needs one) and the publish directory (e.g. build or public).');
  logger.info('6. Click "Create Web Service" — Render will build and deploy automatically from future pushes.');

    logger.info('\n✅ If you prefer to trigger a deploy from the Render dashboard, simply follow the steps above and then use the dashboard to start the first deploy.');

    return { success: true };
  }
}

module.exports = RenderPlatform;
