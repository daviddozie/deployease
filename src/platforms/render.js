const fs = require('fs');
const Platform = require('./base');
const logger = require('../utils/logger');
const shell = require('../utils/shell');
const prompts = require('../utils/prompts');

class RenderPlatform extends Platform {
  constructor() {
    super('render');
    this.cliCommand = null; // no dedicated CLI
    this.gitBranch = null;
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

  async configure() {
    // Ensure prompts are available
    prompts.ensureReadlineSync();

    try {
      const hasRenderYaml = fs.existsSync('render.yaml') || fs.existsSync('render.yml');
      if (!hasRenderYaml) {
        logger.info('No render.yaml found in repository. To use Render you should create a render.yaml (or connect via the Render dashboard).');
        logger.info('Quick setup steps:\n1. Go to https://dashboard.render.com and create a new Web Service.\n2. Connect your Git provider (GitHub/GitLab/Bitbucket).\n3. Select the repository and branch, and configure the build & publish settings.');

        const connected = prompts.askYesNo('Have you connected this repository to Render (via the dashboard)?', false);
        if (!connected) {
          logger.error('Please connect your repository to Render first. See the instructions above.');
          return { success: false, error: 'Repository not connected to Render' };
        }
        // If user says yes, proceed — they likely connected via dashboard
      }

      // 1) Ensure we're inside a git repository
      const insideRepo = shell.execCommand('git rev-parse --is-inside-work-tree');
      if (!insideRepo.success) {
        logger.error('This directory is not a git repository. Initialize a git repo and push it to your Git provider.');
        logger.info('Example:\n  git init\n  git add -A\n  git commit -m "Initial commit"\n  git remote add origin <your-remote-url>\n  git push -u origin main');
        return { success: false, error: 'Not a git repository' };
      }

      // 2) Check for git remotes
      const remotes = shell.execCommand('git remote -v');
      if (!remotes.success || !remotes.output || !remotes.output.trim()) {
        logger.error('No Git remote found. Push your repository to GitHub (or another provider) first.');
        logger.info('Example:\n  git remote add origin https://github.com/username/repo.git\n  git push -u origin main');
        return { success: false, error: 'No git remote configured' };
      }

      // 3) Get current branch
      const branchRes = shell.execCommand('git branch --show-current');
      if (!branchRes.success) {
        logger.error('Failed to determine current git branch');
        return { success: false, error: 'Could not determine git branch' };
      }
      const branch = (branchRes.output || '').toString().trim();
      if (!branch) {
        logger.error('Could not determine current git branch. Please ensure you are on a branch (not in detached HEAD).');
        return { success: false, error: 'No current branch' };
      }
      this.gitBranch = branch;

      // 4) Check for uncommitted changes
      const status = shell.execCommand('git status --porcelain');
      if (status.success && status.output && status.output.trim()) {
        logger.warn('You have uncommitted changes in your working tree. These should be committed before deploying.');
        const commitNow = prompts.askYesNo('Do you want to create a commit from these changes and continue?', true);

        if (!commitNow) {
          logger.error('Aborting. Please commit or stash your changes and run this command again.');
          return { success: false, error: 'Uncommitted changes present' };
        }

        // Commit changes with a standard message
        logger.step('Staging changes...');
        const addRes = shell.execCommand('git add -A');
        if (!addRes.success) {
          logger.error('git add failed: ' + (addRes.error || addRes.output || 'unknown'));
          return { success: false, error: 'git add failed' };
        }

        logger.step('Committing...');
        const message = 'Deploy to Render via DeployEase';
        const safeMsg = message.replace(/"/g, '\\"');
        const commitRes = shell.execCommand('git commit -m "' + safeMsg + '"', { stdio: 'inherit' });
        if (!commitRes.success) {
          logger.error('git commit failed: ' + (commitRes.error || commitRes.output || 'unknown'));
          return { success: false, error: 'git commit failed' };
        }

        logger.success('✅ Changes committed successfully.');
      }

      logger.info(`Ready to deploy branch '${this.gitBranch}' to Render.`);
      return { success: true };
    } catch (err) {
      logger.error('Configure error: ' + (err && err.message ? err.message : String(err)));
      return { success: false, error: err && err.message ? err.message : String(err) };
    }
  }

  // Deploy by pushing to git remote. Pushes the configured branch.
  async deploy() {
    try {
      logger.step('Pushing branch to remote...');

      // Determine branch to push
      let branch = this.gitBranch;
      if (!branch) {
        const branchRes = shell.execCommand('git branch --show-current');
        if (!branchRes.success) {
          logger.error('Failed to determine current branch for push');
          return { success: false, error: 'Could not determine git branch' };
        }
        branch = (branchRes.output || '').toString().trim();
      }

      if (!branch) {
        logger.error('No branch specified to push');
        return { success: false, error: 'No branch to push' };
      }

      // Push to origin
      const pushCmd = `git push origin ${branch}`;
      const pushRes = shell.execCommand(pushCmd, { stdio: 'inherit' });
      if (!pushRes.success) {
        logger.error('git push failed: ' + (pushRes.error || pushRes.output || 'unknown'));
        return { success: false, error: pushRes.error || pushRes.output || 'git push failed' };
      }

      logger.success('✅ Pushed to GitHub successfully!');
      logger.info('🚀 Render will automatically deploy your changes');
      logger.info('View status at: https://dashboard.render.com');

      return { success: true, url: 'https://dashboard.render.com' };
    } catch (err) {
      logger.error('Deploy error: ' + (err && err.message ? err.message : String(err)));
      return { success: false, error: err && err.message ? err.message : String(err) };
    }
  }
}

module.exports = RenderPlatform;
