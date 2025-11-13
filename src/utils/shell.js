const { execSync } = require('child_process');

/**
 * Execute a shell command synchronously and return a safe result object.
 * This function never throws — it catches errors and returns them in the result.
 *
 * @param {string} command The shell command to run.
 * @param {Object} [options] Options object.
 * @param {boolean} [options.verbose=false] If true, logs the command before running.
 * @param {Object} [options.execOptions] Additional options passed to execSync (cwd, env, etc.).
 * @returns {{ success: boolean, output: string, error: string }}
 */
function execCommand(command, options = {}) {
  const { verbose = false, execOptions = {} } = options;

  if (verbose) {
    // Minimal command logging; keep output readable for consumers
    console.log(`[exec] ${command}`);
  }

  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe', ...execOptions });
    return { success: true, output: (output || '').toString().trim(), error: '' };
  } catch (err) {
    // err may contain stdout/stderr (Buffer) depending on Node version and command
    let stdout = '';
    let stderr = '';

    try {
      if (err.stdout) stdout = err.stdout.toString();
    } catch (e) {
      stdout = '';
    }

    try {
      if (err.stderr) stderr = err.stderr.toString();
    } catch (e) {
      stderr = '';
    }

    const message = err.message || stderr || String(err);
    return { success: false, output: (stdout || '').toString().trim(), error: (message || '').toString() };
  }
}

/**
 * Returns true if a command appears to be installed on the system.
 * It attempts a few common checks ("--version", "version", and platform-specific lookup).
 * Uses execCommand internally so it never throws.
 *
 * @param {string} command The command name to check (e.g. 'netlify').
 * @returns {boolean}
 */
function isCommandInstalled(command) {
  if (!command || typeof command !== 'string') return false;

  const checks = [
    `${command} --version`,
    `${command} version`
  ];

  // Platform-specific fallbacks
  if (process.platform === 'win32') {
    checks.push(`where ${command}`);
  } else {
    checks.push(`which ${command}`);
  }

  for (const cmd of checks) {
    const res = execCommand(cmd, { verbose: false });
    if (res.success && res.output) return true;
    if (res.success && !res.output) {
      // some tools write to stderr for version info; treat success as installed
      return true;
    }
  }

  return false;
}

module.exports = { execCommand, isCommandInstalled };
