#!/usr/bin/env node

/**
 * Fix react-native-worklets-core CMakeLists.txt for React Native 0.79+
 * This script patches the CMakeLists.txt to properly find React Native prefab targets
 * 
 * The issue: Even though find_package(ReactAndroid) is called, the targets aren't found
 * because the prefab packages need to be configured earlier or the CMAKE_FIND_ROOT_PATH
 * needs to be set correctly.
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

  console.log('🔧 Patching CMakeLists.txt for React Native 0.79+ compatibility...');
  
  const lines = content.split('\n');
  
  // Find where to insert the fix - right after cmake_minimum_required and project
  let insertIndex = -1;
  let projectLineIndex = -1;
  let includeFollyIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('project(')) {
      projectLineIndex = i;
      // Insert right after project() declaration
      insertIndex = i + 1;
      console.log(`   Found project() at line ${i + 1}`);
    }
    if (line.includes('include("${REACT_NATIVE_DIR}/ReactAndroid/cmake-utils/folly-flags.cmake")')) {
      includeFollyIndex = i;
      console.log(`   Found folly-flags include at line ${i + 1}`);
    }
  }
  
  // If project not found, look for cmake_minimum_required
  if (insertIndex === -1) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('cmake_minimum_required')) {
        insertIndex = i + 1;
        console.log(`   Found cmake_minimum_required at line ${i + 1}`);
        break;
      }
    }
  }
  
  // Fallback: insert at the beginning
  if (insertIndex === -1) {
    insertIndex = 0;
    console.log(`   No project/cmake_minimum_required found, inserting at beginning`);
  }

  // Find existing find_package calls
  let findReactAndroidIndex = -1;
  let findFbjniIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('find_package(ReactAndroid')) {
      findReactAndroidIndex = i;
    }
    if (line.includes('find_package(fbjni')) {
      findFbjniIndex = i;
    }
  }
  
  // The fix: Ensure find_package is called BEFORE the folly-flags include
  // This is critical because the include might need React Native to be found first
  let targetInsertIndex = insertIndex;
  
  // Determine the best insertion point: before the include if it exists
  if (includeFollyIndex !== -1) {
    targetInsertIndex = includeFollyIndex;
    if (findReactAndroidIndex !== -1 && findReactAndroidIndex > includeFollyIndex) {
      console.log(`   CRITICAL: include(folly-flags) at line ${includeFollyIndex + 1} happens before find_package at line ${findReactAndroidIndex + 1}!`);
      console.log(`   Moving find_package to before the include`);
    } else {
      console.log(`   Inserting find_package before include(folly-flags) at line ${targetInsertIndex + 1}`);
    }
  }
  
  const patchLines = [
    '',
    '# PATCHED: React Native 0.79+ fix - Find React Native prefab packages before any includes',
    '# This must be called before include() calls that might depend on React Native',
    'find_package(ReactAndroid REQUIRED CONFIG)',
    'find_package(fbjni REQUIRED CONFIG)',
    ''
  ];
  
  // Determine if we need to add find_package or if it already exists early enough
  const shouldAddFindPackage = 
    (findReactAndroidIndex === -1) || // Doesn't exist at all
    (includeFollyIndex !== -1 && findReactAndroidIndex > includeFollyIndex) || // Exists but after include
    (findReactAndroidIndex > targetInsertIndex + 5); // Exists but too late
  
  // Remove duplicate find_package calls if they exist later or after include
  const linesToRemove = [];
  if (findReactAndroidIndex !== -1 && (findReactAndroidIndex > targetInsertIndex + 5 || (includeFollyIndex !== -1 && findReactAndroidIndex > includeFollyIndex))) {
    console.log(`   Will remove find_package(ReactAndroid) at line ${findReactAndroidIndex + 1} (moving it earlier)`);
    linesToRemove.push(findReactAndroidIndex);
  }
  if (findFbjniIndex !== -1 && (findFbjniIndex > targetInsertIndex + 5 || (includeFollyIndex !== -1 && findFbjniIndex > includeFollyIndex))) {
    console.log(`   Will remove find_package(fbjni) at line ${findFbjniIndex + 1} (moving it earlier)`);
    linesToRemove.push(findFbjniIndex);
  }
  
  // Remove duplicates in reverse order to maintain indices
  linesToRemove.sort((a, b) => b - a);
  for (const index of linesToRemove) {
    // Remove the line and any blank lines around it
    let removeStart = index;
    let removeEnd = index + 1;
    if (index > 0 && lines[index - 1].trim() === '') {
      removeStart--;
    }
    if (index < lines.length - 1 && lines[index + 1].trim() === '') {
      removeEnd++;
    }
    lines.splice(removeStart, removeEnd - removeStart);
    console.log(`   Removed find_package at line ${index + 1}`);
  }
  
  // Adjust targetInsertIndex if we removed lines before it
  const removedBeforeInsert = linesToRemove.filter(idx => idx < targetInsertIndex).length;
  if (removedBeforeInsert > 0) {
    targetInsertIndex -= removedBeforeInsert;
  }
  
  // Only add find_package if needed
  if (!shouldAddFindPackage && findReactAndroidIndex !== -1 && findReactAndroidIndex < targetInsertIndex + 5) {
    console.log(`   find_package(ReactAndroid) already exists early at line ${findReactAndroidIndex + 1}, skipping addition`);
    // Remove the find_package lines from patch since they already exist
    patchLines.splice(3, 2); // Remove the two find_package lines
  } else {
    console.log('   Adding find_package(ReactAndroid REQUIRED CONFIG) and find_package(fbjni REQUIRED CONFIG)');
  }
  
  insertIndex = targetInsertIndex;
  
  lines.splice(insertIndex, 0, ...patchLines);
  content = lines.join('\n');

  fs.writeFileSync(cmakeListsPath, content, 'utf8');
  console.log('✅ Successfully patched CMakeLists.txt for React Native 0.79+');
  console.log(`   Inserted prefab configuration at line ${insertIndex + 2}`);
  
  // Verify the patch was applied
  const verifyContent = fs.readFileSync(cmakeListsPath, 'utf8');
  if (!verifyContent.includes('# PATCHED: React Native 0.79+ fix')) {
    throw new Error('File write verification failed - patch marker not found after write');
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

