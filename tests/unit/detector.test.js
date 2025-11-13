jest.mock('fs');
const fs = require('fs');
const { detectPlatform } = require('../../src/core/detector');

describe('detectPlatform', () => {
  const mapping = [
    ['netlify', 'netlify.toml'],
    ['vercel', 'vercel.json'],
    ['firebase', 'firebase.json'],
    ['github', '.github/workflows'],
    ['cloudflare', 'wrangler.toml'],
    ['render', 'render.yaml'],
    ['railway', 'railway.json'],
    ['koyeb', 'koyeb.yaml']
  ];

  afterEach(() => {
    jest.resetAllMocks();
  });

  mapping.forEach(([name, path]) => {
    test(`returns '${name}' when ${path} exists`, () => {
      fs.existsSync.mockImplementation((p) => p === path);
      const result = detectPlatform();
      expect(result).toBe(name);
    });
  });

  test('returns null when no config files exist', () => {
    fs.existsSync.mockReturnValue(false);
    expect(detectPlatform()).toBeNull();
  });
});
