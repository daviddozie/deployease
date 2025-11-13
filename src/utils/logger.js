// Lightweight console logger with emojis and ANSI colors
// Exports: info, success, error, warn, step

const RESET = '\x1b[0m';
const BLUE = '\x1b[34m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';

function info(message) {
  console.log(`${BLUE}ℹ️  ${message}${RESET}`);
}

function success(message) {
  console.log(`${GREEN}✅  ${message}${RESET}`);
}

function error(message) {
  console.log(`${RED}❌  ${message}${RESET}`);
}

function warn(message) {
  console.log(`${YELLOW}⚠️  ${message}${RESET}`);
}

function step(message) {
  console.log(`${CYAN}⚙️  ${message}${RESET}`);
}

module.exports = { info, success, error, warn, step };
