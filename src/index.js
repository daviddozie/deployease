const logger = require('./utils/logger');
const prompts = require('./utils/prompts');
const { getAllPlatforms, getPlatformByName, detectPlatform } = require('./platforms');

async function deploy() {
  try {
    logger.info('🚀 DeployEase - Starting deployment...\n');

    // 1. Auto-detect platform
    const detected = await detectPlatform();

    // 2. If no detection, ask user to select
    let platform;
    if (detected) {
      logger.success(`Detected platform: ${detected.name}`);
      platform = detected;
    } else {
      logger.info('No platform detected. Please select manually:');
      // Ensure prompts available
      prompts.ensureReadlineSync();
      const platformNames = getAllPlatforms().map(p => p.name);
      const selected = prompts.selectFromList('Choose platform:', platformNames);
      platform = getPlatformByName(selected);
      if (!platform) {
        logger.error('No platform selected or platform not recognized. Aborting.');
        process.exit(1);
      }
    }

    // 3. Run deployment
    const result = await platform.run();

    // 4. Show result
    if (result && result.success) {
      logger.success(`\n🎉 Successfully deployed to ${platform.name}!`);
      if (result.url) logger.info(`URL: ${result.url}`);
      return { success: true, platform: platform.name, url: result.url || '' };
    }

    logger.error(`\n❌ Deployment failed: ${result && result.error ? result.error : 'unknown error'}`);
    process.exit(1);
  } catch (err) {
    logger.error(`\n❌ Unexpected error during deployment: ${err && err.message ? err.message : String(err)}`);
    process.exit(1);
  }
}

module.exports = { deploy };
