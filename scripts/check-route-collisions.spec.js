const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SCRIPT_PATH = path.join(__dirname, 'check-route-collisions.js');
const PUBLIC_DIR = path.join(__dirname, '..', 'hugo', 'public');

/**
 * Runs the collision check script and returns the result.
 * @returns {{ status: number, stdout: string, stderr: string }}
 */
function runScript() {
  try {
    const stdout = execSync(`node "${SCRIPT_PATH}"`, {
      encoding: 'utf-8',
      stdio: 'pipe',
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
  const apiDir = path.join(PUBLIC_DIR, 'api');
  const appDir = path.join(PUBLIC_DIR, 'app', '_');

  afterEach(() => {
    // Clean up any test directories we created
    if (fs.existsSync(apiDir)) {
      fs.rmSync(apiDir, { recursive: true });
    }
    if (fs.existsSync(appDir)) {
      fs.rmSync(appDir, { recursive: true });
    }
  });

  it('exits 0 when no collisions exist', () => {
    const result = runScript();
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('No route collisions');
  });

  it('exits 1 when api/ directory exists in Hugo output', () => {
    fs.mkdirSync(apiDir, { recursive: true });
    fs.writeFileSync(path.join(apiDir, 'data.json'), '{}');

    const result = runScript();
    expect(result.status).toBe(1);
    expect(result.stdout).toContain('api/');
  });

  it('exits 1 when app/_/ directory exists in Hugo output', () => {
    fs.mkdirSync(appDir, { recursive: true });
    fs.writeFileSync(path.join(appDir, 'partial.html'), '<p>oops</p>');

    const result = runScript();
    expect(result.status).toBe(1);
    expect(result.stdout).toContain('app/_/partial.html');
  });

  it('lists all colliding files in output', () => {
    fs.mkdirSync(apiDir, { recursive: true });
    fs.writeFileSync(path.join(apiDir, 'one.json'), '{}');
    fs.writeFileSync(path.join(apiDir, 'two.json'), '{}');

    const result = runScript();
    expect(result.status).toBe(1);
    expect(result.stdout).toContain('one.json');
    expect(result.stdout).toContain('two.json');
  });
});
