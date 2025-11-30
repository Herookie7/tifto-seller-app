#!/bin/bash
# Quick fix: Make SDK directory writable so Gradle can install NDK

echo "🔧 Fixing Android SDK permissions..."
echo ""
echo "This will make /usr/lib/android-sdk writable so Gradle can install the NDK."
echo ""

# Make the SDK directory writable
sudo chmod -R a+w /usr/lib/android-sdk

if [ $? -eq 0 ]; then
    echo "✅ SDK directory is now writable"
    echo ""
    echo "Now you can run the build:"
    echo "  cd android && ./gradlew assembleRelease"
else
    echo "❌ Failed to change permissions"
    exit 1
fi

