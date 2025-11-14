const logger = require('../utils/logger');
const shell = require('../utils/shell');
const { execSync } = require('child_process');

/**
 * Install a CLI tool globally using npm.
 * Uses shell.execCommand so the function never throws and captures output.
 * Logs progress with the project's logger.
 *
 * @param {string} toolName Name of the tool to install (e.g. 'vercel').
 * @returns {{ success: boolean, useNpx: boolean }}
 */
function installCLI(toolName) {
  if (!toolName || typeof toolName !== 'string') {
    logger.error('installCLI: invalid tool name');
    return { success: false, useNpx: false };
  }
  logger.step(`Installing ${toolName} CLI...`);

  // Map common tool names to their npm package names (handles scoped packages)
  const packageMap = {
    'railway': '@railway/cli',
    'netlify': 'netlify-cli',
    'vercel': 'vercel',
    'firebase': 'firebase-tools',
    'wrangler': 'wrangler',
    'koyeb': '@koyeb/koyeb-cli',
    'gh-pages': 'gh-pages'
  };

  const packageName = packageMap[toolName] || toolName;

  // Attempt global install using execSync to surface immediate errors
  try {
    execSync(`npm install -g ${packageName}`, { stdio: 'inherit' });
    logger.success(`${packageName} installed successfully!`);
    return { success: true, useNpx: false };
  } catch (err) {
    // Global install failed — fall back to using npx
    logger.error(`Failed to install ${packageName} globally. Will try with npx instead.`);
    return { success: false, useNpx: true };
  }
}

/**
 * Ensure a CLI tool is available. If not installed, attempt to install it.
 * @param {string} toolName
 * @returns {{ success: boolean, useNpx: boolean }}
 */
function ensureCLI(toolName) {
  if (!toolName || typeof toolName !== 'string') {
    logger.error('ensureCLI: invalid tool name');
    return { success: false, useNpx: false };
  }

  // Use shell.isCommandInstalled which is safe and never throws
  if (shell.isCommandInstalled(toolName)) {
    return { success: true, useNpx: false };
  }

  // Not installed — attempt installation
  return installCLI(toolName);
}

module.exports = { installCLI, ensureCLI };
