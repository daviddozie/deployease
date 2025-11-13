const Platform = require('../../src/platforms/base');

describe('Platform base class', () => {
  test('constructor sets name correctly', () => {
    const p = new Platform('MyPlatform');
    expect(p.name).toBe('MyPlatform');
  });

  test('detect() throws error (must be overridden)', async () => {
    const p = new Platform('X');
    await expect(p.detect()).rejects.toThrow('detect() must be implemented');
  });

  test('authenticate() throws error (must be overridden)', async () => {
    const p = new Platform('X');
    await expect(p.authenticate()).rejects.toThrow('authenticate() must be implemented');
  });

  test('deploy() throws error (must be overridden)', async () => {
    const p = new Platform('X');
    await expect(p.deploy()).rejects.toThrow('deploy() must be implemented');
  });

  test('configure() returns true by default', async () => {
    const p = new Platform('X');
    await expect(p.configure()).resolves.toBe(true);
  });

  test('run() calls methods in correct order', async () => {
    class TestPlatform extends Platform {
      constructor() {
        super('test');
        this.order = [];
      }

      async authenticate() {
        this.order.push('authenticate');
        return { authenticated: true };
      }

      async configure() {
        this.order.push('configure');
        return true;
      }

      async build() {
        this.order.push('build');
        return { success: true };
      }

      async deploy() {
        this.order.push('deploy');
        return { success: true };
      }
    }

    const tp = new TestPlatform();
    const res = await tp.run();
    expect(res && res.success).toBe(true);
    expect(tp.order).toEqual(['authenticate', 'configure', 'build', 'deploy']);
  });

  test('run() aborts when authentication fails', async () => {
    class BadAuthPlatform extends Platform {
      constructor() { super('bad'); }
      async authenticate() { return { authenticated: false }; }
      async configure() { throw new Error('should not reach configure'); }
    }

    const p = new BadAuthPlatform();
    const res = await p.run();
    expect(res.success).toBe(false);
    expect(res.error).toBe('Authentication failed');
  });
});
