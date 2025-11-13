const logger = require('../utils/logger');
const shell = require('../utils/shell');

/**
 * Check authentication for a platform and try to login if not authenticated.
 * Returns an object describing the authentication state.
 *
 * @param {string} platform
 * @returns {{ authenticated: boolean, error: string }}
 */
function authenticate(platform) {
  const authCommands = {
    netlify: 'netlify status',
    vercel: 'vercel whoami',
    firebase: 'firebase projects:list',
    cloudflare: 'wrangler whoami',
    railway: 'railway whoami',
    koyeb: 'koyeb organization list'
  };

  const loginCommands = {
    netlify: 'netlify login',
    vercel: 'vercel login',
    firebase: 'firebase login',
    cloudflare: 'wrangler login',
    railway: 'railway login',
    koyeb: 'koyeb login'
  };

  if (!platform || typeof platform !== 'string') {
    return { authenticated: true, error: '' };
  }

  const checkCmd = authCommands[platform];
  if (!checkCmd) {
    // No auth check required for unknown platforms
    return { authenticated: true, error: '' };
  }

  // Try to run the auth-check command
  const res = shell.execCommand(checkCmd, { verbose: false });
  if (res.success) {
    return { authenticated: true, error: '' };
  }

  // Not authenticated — attempt login
  logger.info(`\n🔐 You are not logged into ${platform}. Logging in now...`);

  const loginCmd = loginCommands[platform] || `${platform} login`;
  // Use stdio: 'inherit' so interactive logins (browser-based) can work
  const loginRes = shell.execCommand(loginCmd, { verbose: true, execOptions: { stdio: 'inherit' } });

  if (loginRes.success) {
    logger.success(`✔️ Logged into ${platform} successfully!\n`);
    return { authenticated: true, error: '' };
  }

  logger.error(`❌ Failed to log into ${platform}. Please log in manually using '${platform} login'.`);
  return { authenticated: false, error: loginRes.error || 'login failed' };
}

module.exports = { authenticate };
