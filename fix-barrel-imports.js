#!/usr/bin/env node

/**
 * Automated Barrel Import Fixer
 * Replaces barrel imports from '@/components/ui' with direct imports
 */

const fs = require('fs');
const path = require('path');

// Component mapping: component name -> file path
const COMPONENT_MAP = {
  // Buttons
  MoodBButton: '@/components/ui/Button',

  // Cards
  MoodBCard: '@/components/ui/Card',

  // Tables
  MoodBTable: '@/components/ui/Table',
  MoodBTableHead: '@/components/ui/Table',
  MoodBTableBody: '@/components/ui/Table',
  MoodBTableRow: '@/components/ui/Table',
  MoodBTableHeader: '@/components/ui/Table',
  MoodBTableCell: '@/components/ui/Table',

  // Badges
  MoodBBadge: '@/components/ui/Badge',

  // States
  EmptyState: '@/components/ui/EmptyState',
  ErrorState: '@/components/ui/ErrorState',
  LoadingState: '@/components/ui/LoadingState',

  // Dialogs
  ConfirmDialog: '@/components/ui/ConfirmDialog',

  // Forms
  FormSection: '@/components/ui/FormSection',

  // Inputs
  ImageUpload: '@/components/ui/ImageUpload',

  // Selectors
  IconSelector: '@/components/ui/IconSelector',

  // Editors
  RichTextEditor: '@/components/ui/RichTextEditor',
};

/**
 * Fix barrel imports in a file
 */
function fixBarrelImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Check if file has barrel import
    const barrelImportRegex = /import\s+{([^}]+)}\s+from\s+['"]@\/components\/ui['"]/;
    const match = content.match(barrelImportRegex);

    if (!match) {
      return { fixed: false, reason: 'No barrel import found' };
    }

    // Extract imported components
    const importedComponents = match[1]
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    if (importedComponents.length === 0) {
      return { fixed: false, reason: 'No components imported' };
    }

    // Group components by their file path
    const importsByPath = {};
    const unknownComponents = [];

    for (const component of importedComponents) {
      const targetPath = COMPONENT_MAP[component];
      if (targetPath) {
        if (!importsByPath[targetPath]) {
          importsByPath[targetPath] = [];
        }
        importsByPath[targetPath].push(component);
      } else {
        unknownComponents.push(component);
      }
    }

    // Generate direct imports
    const directImports = [];

    // Add comment explaining the fix
    directImports.push('// FIX: Replaced barrel import with direct imports to improve compilation speed');
    directImports.push('// Barrel imports force compilation of ALL components (including heavy RichTextEditor, ImageUpload)');
    directImports.push('// Direct imports only compile what\'s needed');

    // Add imports grouped by path
    for (const [targetPath, components] of Object.entries(importsByPath)) {
      if (components.length === 1) {
        directImports.push(`import { ${components[0]} } from '${targetPath}'`);
      } else {
        directImports.push(`import { ${components.join(', ')} } from '${targetPath}'`);
      }
    }

    // Replace the barrel import with direct imports
    const newContent = content.replace(barrelImportRegex, directImports.join('\n'));

    // Write back to file
    fs.writeFileSync(filePath, newContent, 'utf8');

    return {
      fixed: true,
      componentCount: importedComponents.length,
      unknownComponents,
      paths: Object.keys(importsByPath).length
    };

  } catch (error) {
    return { fixed: false, error: error.message };
  }
}

/**
 * Main execution
 */
function main() {
  const filesToFix = process.argv.slice(2);

  if (filesToFix.length === 0) {
    console.error('Usage: node fix-barrel-imports.js <file1> <file2> ...');
    process.exit(1);
  }

  console.log(`🔧 Fixing barrel imports in ${filesToFix.length} files...\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const filePath of filesToFix) {
    const result = fixBarrelImports(filePath);

    if (result.fixed) {
      successCount++;
      console.log(`✅ ${filePath}`);
      console.log(`   → Fixed ${result.componentCount} components across ${result.paths} import paths`);
      if (result.unknownComponents.length > 0) {
        console.log(`   ⚠️  Unknown components: ${result.unknownComponents.join(', ')}`);
      }
    } else if (result.error) {
      errorCount++;
      console.log(`❌ ${filePath}`);
      console.log(`   → Error: ${result.error}`);
    } else {
      skipCount++;
      console.log(`⏭️  ${filePath}`);
      console.log(`   → ${result.reason}`);
    }
    console.log('');
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Fixed: ${successCount}`);
  console.log(`   ⏭️  Skipped: ${skipCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📁 Total: ${filesToFix.length}`);
}

main();
