const fs = require('fs');
const Platform = require('./base');
const logger = require('../utils/logger');
const prompts = require('../utils/prompts');
const authenticator = require('../core/authenticator');
const shell = require('../utils/shell');

class FirebasePlatform extends Platform {
  constructor() {
    super('Firebase');
    this.cliCommand = 'firebase';
  }

  async detect() {
    try {
      const exists = fs.existsSync('firebase.json');
      if (exists) logger.info('Detected Firebase configuration (firebase.json)');
      return exists;
    } catch (err) {
      logger.error('detect error: ' + (err && err.message ? err.message : String(err)));
      return false;
    }
  }

  async authenticate() {
    try {
      return authenticator.authenticate('firebase');
    } catch (err) {
      logger.error('Authentication error: ' + (err && err.message ? err.message : String(err)));
      return { authenticated: false, error: err && err.message ? err.message : String(err) };
    }
  }

  async configure() {
    try {
      // If firebase.json already exists, assume configured
      if (fs.existsSync('firebase.json')) {
        logger.info('firebase.json already exists — skipping configuration');
        return true;
      }

      // Ask for project ID
      const projectId = prompts.askQuestion('Enter your Firebase project ID:', '').trim();
      if (!projectId) {
        logger.error('Firebase project ID is required.');
        return false;
      }

      logger.step('Initializing Firebase in the project...');

      // Run firebase use --add <projectId> (interactive)
      const useRes = shell.execCommand(`firebase use --add ${projectId}`, { verbose: true, execOptions: { stdio: 'inherit' } });
      if (!useRes.success) {
        logger.error('Failed to run `firebase use --add`: ' + (useRes.error || 'unknown'));
        return false;
      }

      const firebaseConfig = {
        hosting: {
          public: 'public',
          ignore: ['firebase.json', '**/.*', '**/node_modules/**'],
          rewrites: [{ source: '**', destination: '/index.html' }]
        }
      };

      fs.writeFileSync('firebase.json', JSON.stringify(firebaseConfig, null, 2));

      if (!fs.existsSync('public')) {
        fs.mkdirSync('public');
        fs.writeFileSync('public/index.html', '<h1>Firebase Hosting Setup</h1>');
      }

      logger.success('Firebase setup completed!');
      return true;
    } catch (err) {
      logger.error('Firebase configure failed: ' + (err && err.message ? err.message : String(err)));
      return false;
    }
  }

  async deploy() {
    try {
      logger.step('Deploying to Firebase Hosting...');
      const cmd = 'firebase deploy --only hosting';
      const res = shell.execCommand(cmd, { verbose: true, execOptions: { stdio: 'inherit' } });

      if (!res.success) {
        logger.error('Firebase deploy failed: ' + (res.error || 'unknown error'));
        return { success: false, url: '', error: res.error || 'deploy failed' };
      }

      // firebase deploy outputs URLs to stdout; try to parse
      const out = res.output || '';
  const urlMatch = out.match(/https?:\/\/[^\s)]+/i);
      const url = urlMatch ? urlMatch[0] : '';

      logger.success('Firebase deploy completed' + (url ? ` — ${url}` : ''));
      return { success: true, url, error: '' };
    } catch (err) {
      logger.error('Deploy error: ' + (err && err.message ? err.message : String(err)));
      return { success: false, url: '', error: err && err.message ? err.message : String(err) };
    }
  }
}

module.exports = FirebasePlatform;
