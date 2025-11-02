#!/bin/bash
# Fix permissions for node_modules binaries
# Run this if you encounter permission errors

echo "Fixing permissions for node_modules/.bin..."

# Fix all binaries
find node_modules/.bin -type f -exec chmod +x {} \; 2>/dev/null

# Also fix pnpm store binaries if needed
if [ -d "node_modules/.pnpm" ]; then
  find node_modules/.pnpm -name ".bin" -type d -exec find {} -type f -exec chmod +x {} \; \; 2>/dev/null
fi

echo "✅ Permissions fixed!"
echo ""
echo "You can now run: pnpm dev"

