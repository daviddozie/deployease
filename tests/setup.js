const fs = require('fs');
const child_process = require('child_process');

// Reduce console noise in tests by default
beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  if (console.log.mockRestore) console.log.mockRestore();
  if (console.warn.mockRestore) console.warn.mockRestore();
  if (console.error.mockRestore) console.error.mockRestore();
  jest.clearAllMocks();
});

// Helper to mock small parts of the fs module
function mockFs(overrides = {}) {
  const spies = {};
  for (const [name, impl] of Object.entries(overrides)) {
    if (typeof fs[name] === 'function') {
      spies[name] = jest.spyOn(fs, name).mockImplementation(impl);
    }
  }
  return {
    spies,
    restore: () => Object.values(spies).forEach(s => s && s.mockRestore())
  };
}

// Helper to mock child_process functions like execSync
function mockChildProcess(overrides = {}) {
  const spies = {};
  for (const [name, impl] of Object.entries(overrides)) {
    if (typeof child_process[name] === 'function') {
      spies[name] = jest.spyOn(child_process, name).mockImplementation(impl);
    }
  }
  return {
    spies,
    restore: () => Object.values(spies).forEach(s => s && s.mockRestore())
  };
}

module.exports = {
  mockFs,
  mockChildProcess
};
