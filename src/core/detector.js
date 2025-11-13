const fs = require('fs');
const logger = require('../utils/logger');

/**
 * Detect deployment platform by checking for common config files.
 * Returns the platform name string or null when none matched.
 * Uses early returns and logs the detected platform via logger.info().
 *
 * Mapping:
 * - netlify.toml -> 'netlify'
 * - vercel.json  -> 'vercel'
 * - firebase.json -> 'firebase'
 * - .github/workflows -> 'github'
 * - wrangler.toml -> 'cloudflare'
 * - render.yaml -> 'render'
 * - railway.json -> 'railway'
 * - koyeb.yaml -> 'koyeb'
 *
 * @returns {string|null}
 */
function detectPlatform() {
  if (fs.existsSync('netlify.toml')) {
    logger.info('Detected platform: netlify');
    return 'netlify';
  }

  if (fs.existsSync('vercel.json')) {
    logger.info('Detected platform: vercel');
    return 'vercel';
  }

  if (fs.existsSync('firebase.json')) {
    logger.info('Detected platform: firebase');
    return 'firebase';
  }

  if (fs.existsSync('.github/workflows')) {
    logger.info('Detected platform: github');
    return 'github';
  }

  if (fs.existsSync('wrangler.toml')) {
    logger.info('Detected platform: cloudflare');
    return 'cloudflare';
  }

  if (fs.existsSync('render.yaml')) {
    logger.info('Detected platform: render');
    return 'render';
  }

  if (fs.existsSync('railway.json')) {
    logger.info('Detected platform: railway');
    return 'railway';
  }

  if (fs.existsSync('koyeb.yaml')) {
    logger.info('Detected platform: koyeb');
    return 'koyeb';
  }

  logger.info('No deployment platform detected');
  return null;
}

module.exports = { detectPlatform };
