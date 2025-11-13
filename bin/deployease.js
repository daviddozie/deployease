#!/usr/bin/env node

const { deploy } = require('../src/index');

if (process.argv[2] === 'deploy') {
  deploy().catch((error) => {
    console.error('❌ Fatal error:', error && error.message ? error.message : String(error));
    process.exit(1);
  });
} else {
  console.log('Usage: deployease deploy');
}
