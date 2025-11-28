#!/usr/bin/env node

/**
 * Fix react-native-worklets-core CMakeLists.txt for React Native 0.79+
 * This script patches the CMakeLists.txt to properly find React Native prefab targets
 * 
 * The issue: add_library() at line 28 tries to link to ReactAndroid:: targets
 * before find_package(ReactAndroid) is called, causing CMake errors.
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

  console.log('🔧 Patching CMakeLists.txt...');
  
  const lines = content.split('\n');
  let addLibraryIndex = -1;
  let findPackageIndex = -1;
  
  // Find the add_library call (usually around line 28 based on error)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Look for add_library(rnworklets - can be on one line or multi-line
    if (line.startsWith('add_library(rnworklets') || 
        (line.startsWith('add_library(') && line.includes('rnworklets'))) {
      addLibraryIndex = i;
      console.log(`   Found add_library at line ${i + 1}`);
      break;
    }
    if (line.includes('find_package(ReactAndroid')) {
      findPackageIndex = i;
      console.log(`   Found existing find_package at line ${i + 1}`);
    }
  }

  // Determine where to insert find_package
  let insertIndex = 0;
  
  // Strategy: Insert find_package right before add_library, or at the top after cmake_minimum_required/project
  if (addLibraryIndex !== -1) {
    // Insert right before add_library (this is the most reliable location)
    insertIndex = addLibraryIndex;
    console.log(`   Will insert find_package before add_library at line ${insertIndex + 1}`);
    
    // Make sure we're not inserting in the middle of a multi-line add_library
    // Look backwards for the start of add_library if it's split across lines
    let actualInsertIndex = insertIndex;
    for (let i = insertIndex - 1; i >= Math.max(0, insertIndex - 5); i--) {
      if (lines[i].trim().startsWith('add_library(')) {
        actualInsertIndex = i;
        break;
      }
    }
    insertIndex = actualInsertIndex;
  } else {
    // Fallback: find cmake_minimum_required or project() and insert after
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('cmake_minimum_required') || 
          (line.startsWith('project(') && !line.includes('#'))) {
        insertIndex = i + 1;
        console.log(`   Will insert find_package after ${line.substring(0, 30)}... at line ${insertIndex + 1}`);
        break;
      }
    }
    
    // If still not found, insert after any initial comments (but before any actual code)
    if (insertIndex === 0) {
      for (let i = 0; i < Math.min(10, lines.length); i++) {
        const line = lines[i].trim();
        if (line && !line.startsWith('#') && !line.startsWith('cmake_')) {
          insertIndex = i;
          console.log(`   Will insert find_package at the top (before first non-comment line)`);
          break;
        }
      }
    }
  }

  // Remove old find_package if it exists in wrong place (after add_library)
  if (findPackageIndex !== -1 && findPackageIndex > insertIndex) {
    console.log(`   Removing misplaced find_package at line ${findPackageIndex + 1}`);
    // Remove the find_package line and any blank lines around it
    let removeStart = findPackageIndex;
    let removeEnd = findPackageIndex + 1;
    
    // Remove preceding blank line if exists
    if (removeStart > 0 && lines[removeStart - 1].trim() === '') {
      removeStart--;
    }
    // Remove following blank line if exists
    if (removeEnd < lines.length && lines[removeEnd].trim() === '') {
      removeEnd++;
    }
    
    lines.splice(removeStart, removeEnd - removeStart);
    
    // Adjust insertIndex if needed
    if (insertIndex > findPackageIndex) {
      insertIndex -= (removeEnd - removeStart);
    }
  }

  // Insert find_package call
  const patchLines = [
    '',
    '# PATCHED: React Native 0.79+ fix - Find React Native prefab packages before linking',
    '# This must be called before any target_link_libraries that reference ReactAndroid:: targets',
    'find_package(ReactAndroid REQUIRED CONFIG)',
    ''
  ];
  
  lines.splice(insertIndex, 0, ...patchLines);
  content = lines.join('\n');

  // Verify the patch was applied correctly
  if (!content.includes('find_package(ReactAndroid REQUIRED CONFIG)')) {
    throw new Error('Failed to insert find_package - content verification failed');
  }

  fs.writeFileSync(cmakeListsPath, content, 'utf8');
  console.log('✅ Successfully patched CMakeLists.txt for React Native 0.79+');
  console.log(`   Inserted find_package(ReactAndroid REQUIRED CONFIG) at line ${insertIndex + 2}`);
  
  // Double-check the file was written
  const verifyContent = fs.readFileSync(cmakeListsPath, 'utf8');
  if (!verifyContent.includes('find_package(ReactAndroid REQUIRED CONFIG)')) {
    throw new Error('File write verification failed - find_package not found after write');
  }
  console.log('   ✅ File write verified successfully');
}

try {
  fixCMakeLists();
} catch (error) {
  console.error('❌ Error fixing CMakeLists.txt:', error.message);
  console.error(error.stack);
  // Don't exit with error code, as this might break CI if node_modules doesn't exist yet
  process.exit(0); // Exit successfully to not break CI
}

