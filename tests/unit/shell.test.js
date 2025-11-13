jest.mock('child_process');
const child_process = require('child_process');
const shell = require('../../src/utils/shell');

describe('execCommand', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('returns success=true when command succeeds', () => {
    child_process.execSync.mockImplementation(() => 'ok\n');
    const res = shell.execCommand('echo hi');
    expect(res.success).toBe(true);
    expect(res.output).toBe('ok');
    expect(res.error).toBe('');
  });

  test('returns success=false when command fails and captures stdout/stderr', () => {
    const err = new Error('command failed');
    err.stdout = Buffer.from('out data');
    err.stderr = Buffer.from('err data');
    child_process.execSync.mockImplementation(() => { throw err; });

    const res = shell.execCommand('badcmd');
    expect(res.success).toBe(false);
    expect(res.output).toBe('out data');
    expect(res.error).toContain('command failed');
  });

  test('execCommand does not throw when command throws', () => {
    const err = new Error('boom');
    child_process.execSync.mockImplementation(() => { throw err; });
    expect(() => shell.execCommand('bad')).not.toThrow();
  });
});

describe('isCommandInstalled', () => {
  afterEach(() => jest.resetAllMocks());

  test("returns true for 'node' when version check succeeds", () => {
    child_process.execSync.mockImplementation((cmd) => {
      if (String(cmd).includes('node --version')) return 'v16.0.0';
      if (String(cmd).includes('node version')) return 'v16.0.0';
      if (String(cmd).startsWith('which') || String(cmd).startsWith('where')) return '/usr/bin/node';
      throw new Error('not found');
    });

    expect(shell.isCommandInstalled('node')).toBe(true);
  });

  test("returns false for a fake CLI 'fakecli123'", () => {
    child_process.execSync.mockImplementation(() => { throw new Error('not found'); });
    expect(shell.isCommandInstalled('fakecli123')).toBe(false);
  });
});
