#!/usr/bin/env node

/**
 * Create napi-postinstall wrapper script when bin-links is disabled
 * This is needed because exfat filesystem doesn't support symlinks
 */

const fs = require('fs');
const path = require('path');

const binDir = path.join(__dirname, '..', 'node_modules', '.bin');
const wrapperScript = path.join(binDir, 'napi-postinstall');

// Create .bin directory if it doesn't exist
if (!fs.existsSync(binDir)) {
  try {
    fs.mkdirSync(binDir, { recursive: true });
    console.log('📁 Created node_modules/.bin directory');
  } catch (error) {
    console.log('⚠️  Could not create .bin directory:', error.message);
    process.exit(0);
  }
}

const wrapperContent = `#!/bin/sh
# Wrapper script for napi-postinstall when bin-links is disabled
# This script uses npx to run napi-postinstall, which will download @napi-rs/cli if needed
# Using npx ensures it works even if @napi-rs/cli isn't installed yet

# First, try to use npx (most reliable, works even if package isn't installed)
if command -v npx >/dev/null 2>&1; then
  exec npx --yes @napi-rs/cli napi-postinstall "$@"
fi

# Fallback: try to find it locally
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
NODE_MODULES_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ -f "$NODE_MODULES_DIR/@napi-rs/cli/napi-postinstall.js" ]; then
  exec node "$NODE_MODULES_DIR/@napi-rs/cli/napi-postinstall.js" "$@"
elif [ -f "$NODE_MODULES_DIR/@napi-rs/cli/dist/napi-postinstall.js" ]; then
  exec node "$NODE_MODULES_DIR/@napi-rs/cli/dist/napi-postinstall.js" "$@"
else
  echo "Error: napi-postinstall not found. Please ensure @napi-rs/cli is installed." >&2
  exit 1
fi
`;

try {
  fs.writeFileSync(wrapperScript, wrapperContent, 'utf8');
  fs.chmodSync(wrapperScript, '755');
  console.log('✅ Created napi-postinstall wrapper script');
} catch (error) {
  console.log('⚠️  Could not create napi-postinstall wrapper:', error.message);
  // Don't fail the install process
  process.exit(0);
}

