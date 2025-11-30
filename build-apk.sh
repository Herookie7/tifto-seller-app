#!/bin/bash
# Script to build APK for Tifto Seller App

echo "📱 Building Tifto Seller App APK..."
echo ""

# Step 1: Accept Android SDK licenses and ensure SDK is writable
echo "Step 1: Setting up Android SDK permissions and licenses..."

# Make SDK directory writable (required for NDK installation)
sudo chmod -R a+w /usr/lib/android-sdk 2>/dev/null || echo "Note: Could not change SDK permissions. NDK will be installed with sudo."

# Create licenses directory
sudo mkdir -p /usr/lib/android-sdk/licenses

# Accept Android SDK license
echo "24333f8a63b6825ea9c5514f83c2829b004d1fee" | sudo tee /usr/lib/android-sdk/licenses/android-sdk-license > /dev/null

# Accept NDK license
echo "844e3ef61f86bb0a78e8fc0f27a7d99b776bfeb9" | sudo tee /usr/lib/android-sdk/licenses/android-ndk-license > /dev/null

# Accept other common licenses
echo "601085b94cd77f0b54ff86406957099ebe79c4d6" | sudo tee /usr/lib/android-sdk/licenses/android-sdk-preview-license > /dev/null
echo "84831b9409646a918e30573bab4c9c91346d8abd" | sudo tee /usr/lib/android-sdk/licenses/android-sdk-preview-license > /dev/null

echo "✅ Licenses accepted"
echo ""

# Step 2: Build the APK
echo "Step 2: Building release APK..."
cd android
./gradlew assembleRelease

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "📦 APK location:"
    find app/build/outputs/apk -name "*.apk" -type f
    echo ""
    echo "To install on a connected device:"
    echo "  adb install app/build/outputs/apk/release/app-release.apk"
else
    echo ""
    echo "❌ Build failed. Please check the error messages above."
    exit 1
fi


