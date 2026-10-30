import { spawnSync } from 'node:child_process';

// Practical 12 Requirement: Simulate broken test pipeline failure
process.env.DEMO_BROKEN_TEST = 'true';

const result = spawnSync('node', ['--test', 'tests/task.test.js'], {
  stdio: 'inherit',
  env: process.env,
  shell: process.platform === 'win32'
});

process.exit(result.status ?? 1);
