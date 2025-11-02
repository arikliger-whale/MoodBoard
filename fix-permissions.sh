#!/bin/bash
# Fix permissions for MoodB project
# Run this script with: bash fix-permissions.sh

echo "Fixing permissions for MoodB project..."

# Change ownership of all files to current user
sudo chown -R $(whoami):staff /Users/arikliger/Documents/MoodB

# Ensure directories are writable
find /Users/arikliger/Documents/MoodB -type d -exec chmod 755 {} \;

# Ensure files are readable/writable
find /Users/arikliger/Documents/MoodB -type f -exec chmod 644 {} \;

# Make scripts executable
find /Users/arikliger/Documents/MoodB -name "*.sh" -exec chmod +x {} \;

echo "✅ Permissions fixed!"
echo ""
echo "You can now run:"
echo "  pnpm prisma generate"
echo "  pnpm prisma db push"
echo "  pnpm dev"

