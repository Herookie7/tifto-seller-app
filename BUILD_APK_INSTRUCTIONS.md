
# Building APK for Tifto Seller App

## Quick Build (Recommended)

Run the build script:
```bash
./build-apk.sh
```

This script will:
1. Accept all required Android SDK licenses
2. Build the release APK
3. Show you where the APK file is located

## Manual Build Steps

If you prefer to build manually:

### 1. Accept Android SDK Licenses

You need to accept the Android SDK and NDK licenses. Run these commands:

```bash
sudo mkdir -p /usr/lib/android-sdk/licenses
echo "24333f8a63b6825ea9c5514f83c2829b004d1fee" | sudo tee /usr/lib/android-sdk/licenses/android-sdk-license
echo "844e3ef61f86bb0a78e8fc0f27a7d99b776bfeb9" | sudo tee /usr/lib/android-sdk/licenses/android-ndk-license
```

### 2. Build the APK

```bash
cd android
./gradlew assembleRelease
```

### 3. Find Your APK

After a successful build, the APK will be located at:
```
android/app/build/outputs/apk/release/app-release.apk
```

### 4. Install on Device (Optional)

To install on a connected Android device:
```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

## Build Debug APK

For a debug APK (unsigned, for testing):
```bash
cd android
./gradlew assembleDebug
```

The debug APK will be at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## Troubleshooting

- **License errors**: Make sure you've accepted all licenses as shown in step 1
- **SDK not found**: Ensure `local.properties` exists in the `android/` directory with:
  ```
  sdk.dir=/usr/lib/android-sdk
  ```
- **Build fails**: Check that all dependencies are installed: `npm install`

