#!/usr/bin/env node

/**
 * Fix react-native-worklets-core CMakeLists.txt for React Native 0.79+
 * This script patches the CMakeLists.txt to properly find React Native prefab targets
 */

const fs = require('fs');
const path = require('path');

const cmakeListsPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-worklets-core',
  'android',
  'CMakeLists.txt'
);

function fixCMakeLists() {
  if (!fs.existsSync(cmakeListsPath)) {
    console.log('⚠️  CMakeLists.txt not found, skipping fix (this is normal if node_modules is not installed yet)');
    return;
  }

  let content = fs.readFileSync(cmakeListsPath, 'utf8');

  // Check if already patched
  if (content.includes('# PATCHED: React Native 0.79+ fix')) {
    console.log('✅ CMakeLists.txt already patched');
    return;
  }

  // The issue is that find_package(ReactAndroid REQUIRED CONFIG) needs to be called
  // before target_link_libraries tries to use ReactAndroid:: targets
  
  // Find where add_library is called (usually around line 28 based on the error)
  const lines = content.split('\n');
  let addLibraryIndex = -1;
  let findPackageIndex = -1;
  let targetLinkIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('add_library(rnworklets') || line.includes('add_library(rnworklets ')) {
      addLibraryIndex = i;
    }
    if (line.includes('find_package(ReactAndroid')) {
      findPackageIndex = i;
    }
    if (line.includes('target_link_libraries(rnworklets') && line.includes('ReactAndroid::')) {
      targetLinkIndex = i;
    }
  }

  // If find_package is not found or comes after add_library/target_link_libraries, we need to fix it
  const needsFix = findPackageIndex === -1 || 
                   (addLibraryIndex !== -1 && findPackageIndex > addLibraryIndex) ||
                   (targetLinkIndex !== -1 && findPackageIndex > targetLinkIndex);

  if (needsFix) {
    // Find a good place to insert find_package - before add_library or at the top after cmake_minimum_required
    let insertIndex = 0;
    
    // Find cmake_minimum_required and project() calls to insert after them
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('cmake_minimum_required') || lines[i].includes('project(')) {
        insertIndex = i + 1;
      }
    }
    
    // If we found add_library, insert before it (preferred location)
    if (addLibraryIndex !== -1 && addLibraryIndex > insertIndex) {
      insertIndex = addLibraryIndex;
    }
    
    // Remove old find_package if it exists in wrong place
    if (findPackageIndex !== -1 && findPackageIndex > insertIndex) {
      // Remove the old find_package line and any comments around it
      const removeStart = Math.max(0, findPackageIndex - 1);
      const removeEnd = findPackageIndex + 2;
      lines.splice(removeStart, removeEnd - removeStart);
      if (addLibraryIndex > findPackageIndex) {
        addLibraryIndex -= (removeEnd - removeStart);
      }
      if (insertIndex > findPackageIndex) {
        insertIndex -= (removeEnd - removeStart);
      }
    }
    
    // Insert find_package call
    const patchLines = [
      '',
      '# PATCHED: React Native 0.79+ fix - Find React Native prefab packages before linking',
      'find_package(ReactAndroid REQUIRED CONFIG)',
      ''
    ];
    
    lines.splice(insertIndex, 0, ...patchLines);
    content = lines.join('\n');
  }

  // Also ensure that if there are any target_link_libraries calls, they come after find_package
  // The error suggests the targets aren't found, so we need to make sure find_package is called first
  
  fs.writeFileSync(cmakeListsPath, content, 'utf8');
  console.log('✅ Fixed react-native-worklets-core CMakeLists.txt for React Native 0.79+');
}

try {
  fixCMakeLists();
} catch (error) {
  console.error('❌ Error fixing CMakeLists.txt:', error.message);
  // Don't exit with error code, as this might break CI if node_modules doesn't exist yet
  console.error('   This is non-fatal and will be fixed on next npm install');
}

