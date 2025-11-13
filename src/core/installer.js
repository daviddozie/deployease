const logger = require('../utils/logger');
const shell = require('../utils/shell');

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

  // Attempt global install
  const cmd = `npm install -g ${toolName}`;
  const res = shell.execCommand(cmd, { verbose: false });

  if (res.success) {
    logger.success(`${toolName} installed successfully!`);
    return { success: true, useNpx: false };
  }

  // Global install failed — fall back to using npx
  logger.error(`Failed to install ${toolName} globally. Trying with npx...`);
  return { success: false, useNpx: true };
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
