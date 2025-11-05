#!/usr/bin/env node

// Force disable turbopack
process.env.TURBOPACK = '0';
process.env.NEXT_PRIVATE_SKIP_TURBOPACK = '1';
delete process.env.TURBO;

// Run next build
const { execSync } = require('child_process');

try {
  execSync('next build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      TURBOPACK: '0',
      NEXT_PRIVATE_SKIP_TURBOPACK: '1'
    }
  });
} catch (error) {
  process.exit(1);
}

