#!/usr/bin/env node
const { execSync } = require('child_process');

/**
 * Ensure `readline-sync` is installed and available as `global.readline`.
 * If missing, installs it using `npm install readline-sync`.
 */
function ensureReadlineSync() {
  try {
    require.resolve('readline-sync');
  } catch (e) {
    try {
      console.log('\n⚙️ Installing readline-sync...');
      execSync('npm install readline-sync', { stdio: 'inherit' });
      console.log('✔️ readline-sync installed successfully!\n');
    } catch (installErr) {
      // If installation fails, rethrow so callers can handle or exit
      console.error('❌ Failed to install readline-sync:', installErr && installErr.message ? installErr.message : installErr);
      throw installErr;
    }
  }

  // attach to global for convenience (matches existing project style)
  global.readline = require('readline-sync');
}

/**
 * Ask a question using readline-sync and return trimmed answer or defaultValue.
 * @param {string} question The question to show to the user.
 * @param {string} [defaultValue=''] Default value to return when user submits empty input.
 * @returns {string}
 */
function askQuestion(question, defaultValue = '') {
  try {
    ensureReadlineSync();
    const answer = global.readline.question(String(question));
    const trimmed = (answer || '').toString().trim();
    return trimmed === '' ? defaultValue : trimmed;
  } catch (err) {
    // On any error, return defaultValue to keep callers safe
    return defaultValue;
  }
}

/**
 * Ask a yes/no question and return boolean.
 * Accepts: yes/y/no/n (case-insensitive). Defaults to defaultYes when input empty.
 * @param {string} question
 * @param {boolean} [defaultYes=true]
 * @returns {boolean}
 */
function askYesNo(question, defaultYes = true) {
  try {
    ensureReadlineSync();

    const hint = defaultYes ? ' (Y/n): ' : ' (y/N): ';
    const prompt = `${question}${hint}`;

    const raw = global.readline.question(prompt).trim();
    if (raw === '') return Boolean(defaultYes);

    const normalized = raw.toLowerCase();
    if (['y', 'yes'].includes(normalized)) return true;
    if (['n', 'no'].includes(normalized)) return false;

    // If ambiguous, fall back to default
    return Boolean(defaultYes);
  } catch (err) {
    return Boolean(defaultYes);
  }
}

/**
 * Present a numbered list of options and return the selected option string.
 * Keeps prompting until a valid selection is made or throws if options invalid.
 * @param {string} title Title/question to display above the list.
 * @param {string[]} options Array of option strings.
 * @returns {string} Selected option value from options array.
 */
function selectFromList(title, options) {
  if (!Array.isArray(options) || options.length === 0) {
    throw new Error('options must be a non-empty array');
  }

  ensureReadlineSync();

  for (;;) {
    console.log(`\n${title}`);
    options.forEach((opt, i) => {
      console.log(`${i + 1}. ${opt}`);
    });

    const answer = global.readline.question('\nEnter the number of your choice: ').trim();
    const idx = parseInt(answer, 10);

    if (!Number.isNaN(idx) && idx >= 1 && idx <= options.length) {
      return options[idx - 1];
    }

    // allow selecting by exact text match (case-insensitive)
    const byText = options.find(o => o.toLowerCase() === (answer || '').toLowerCase());
    if (byText) return byText;

    console.log('❌ Invalid choice. Please enter a valid number or exact option text.');
  }
}

module.exports = { ensureReadlineSync, askQuestion, askYesNo, selectFromList };
