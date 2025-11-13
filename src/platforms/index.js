const Netlify = require('./netlify');
const Vercel = require('./vercel');
const Firebase = require('./firebase');
const GitHub = require('./github');
const Cloudflare = require('./cloudflare');
const Render = require('./render');
const Railway = require('./railway');
const Koyeb = require('./koyeb');
const logger = require('../utils/logger');

// Instantiate platform objects
const platforms = [
  new Netlify(),
  new Vercel(),
  new Firebase(),
  new GitHub(),
  new Cloudflare(),
  new Render(),
  new Railway(),
  new Koyeb()
];

function getAllPlatforms() {
  return platforms;
}

function getPlatformByName(name) {
  if (!name) return null;
  const needle = String(name).toLowerCase();
  return platforms.find(p => {
    const pname = (p && p.name) ? String(p.name).toLowerCase() : '';
    if (pname === needle) return true;
    if (pname.includes(needle)) return true;
    if (needle.includes(pname)) return true;
    return false;
  }) || null;
}

async function detectPlatform() {
  logger.info('🔎 Detecting deployment platform from project files...');
  for (const p of platforms) {
    try {
      // allow detect() to be async
      const ok = await Promise.resolve(p.detect());
      if (ok) {
        logger.info(`Detected platform: ${p.name}`);
        return p;
      }
    } catch (err) {
      // non-fatal: log and continue
      logger.warn(`Error while detecting ${p && p.name ? p.name : 'unknown'}: ${err && err.message ? err.message : String(err)}`);
    }
  }
  logger.info('No platform detected from project files');
  return null;
}

module.exports = {
  platforms,
  getAllPlatforms,
  getPlatformByName,
  detectPlatform
};
