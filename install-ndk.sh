#!/bin/bash
# Script to install the required NDK version for the build

echo "🔧 Installing NDK 27.1.12297006..."
echo ""

# Find sdkmanager
SDKMANAGER=""
if [ -f "/usr/lib/android-sdk/cmdline-tools/latest/bin/sdkmanager" ]; then
    SDKMANAGER="/usr/lib/android-sdk/cmdline-tools/latest/bin/sdkmanager"
elif [ -f "/usr/lib/android-sdk/tools/bin/sdkmanager" ]; then
    SDKMANAGER="/usr/lib/android-sdk/tools/bin/sdkmanager"
else
    echo "❌ Error: Could not find sdkmanager"
    echo "Please install Android SDK command-line tools first"
    exit 1
fi

# Accept licenses first
echo "Accepting NDK license..."
sudo mkdir -p /usr/lib/android-sdk/licenses
echo "844e3ef61f86bb0a78e8fc0f27a7d99b776bfeb9" | sudo tee /usr/lib/android-sdk/licenses/android-ndk-license > /dev/null

# Install NDK with sudo
echo "Installing NDK (this requires sudo)..."
sudo $SDKMANAGER "ndk;27.1.12297006"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ NDK installed successfully!"
else
    echo ""
    echo "❌ Failed to install NDK"
    exit 1
fi

