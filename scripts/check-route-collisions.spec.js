const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

const SCRIPT_PATH = path.join(__dirname, 'check-route-collisions.js');

/**
 * Runs the collision check script against the given public directory.
 * @param {string} publicDir - Path to use as the Hugo public directory.
 * @returns {{ status: number, stdout: string, stderr: string }}
 */
function runScript(publicDir) {
  try {
    const stdout = execSync(`node "${SCRIPT_PATH}"`, {
      encoding: 'utf-8',
      stdio: 'pipe',
      env: { ...process.env, COLLISION_CHECK_PUBLIC_DIR: publicDir },
    });
    return { status: 0, stdout, stderr: '' };
  } catch (error) {
    return {
      status: error.status,
      stdout: error.stdout || '',
      stderr: error.stderr || '',
    };
  }
}

describe('check-route-collisions', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'collision-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('exits 0 when no collisions exist', () => {
    const result = runScript(tmpDir);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('No route collisions');
  });

  it('exits 1 when api/ directory exists in Hugo output', () => {
    const apiDir = path.join(tmpDir, 'api');
    fs.mkdirSync(apiDir, { recursive: true });
    fs.writeFileSync(path.join(apiDir, 'data.json'), '{}');

    const result = runScript(tmpDir);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain('api/');
  });

  it('exits 1 when app/_/ directory exists in Hugo output', () => {
    const appDir = path.join(tmpDir, 'app', '_');
    fs.mkdirSync(appDir, { recursive: true });
    fs.writeFileSync(path.join(appDir, 'partial.html'), '<p>oops</p>');

    const result = runScript(tmpDir);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain('app/_/partial.html');
  });

  it('lists all colliding files in output', () => {
    const apiDir = path.join(tmpDir, 'api');
    fs.mkdirSync(apiDir, { recursive: true });
    fs.writeFileSync(path.join(apiDir, 'one.json'), '{}');
    fs.writeFileSync(path.join(apiDir, 'two.json'), '{}');

    const result = runScript(tmpDir);
    expect(result.status).toBe(1);
    expect(result.stdout).toContain('one.json');
    expect(result.stdout).toContain('two.json');
  });
});
