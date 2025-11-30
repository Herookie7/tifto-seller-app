# GitHub Workflows for APK Building

This directory contains GitHub Actions workflows to automatically build Android APK files for the Tifto Seller App.

## Available Workflows

### 1. Build APK (`build-apk.yml`)

**Purpose:** Builds the APK and uploads it as a GitHub Actions artifact.

**Triggers:**
- Manual trigger via GitHub Actions UI (workflow_dispatch)
- On push to `main` or `master` branches
- On pull requests to `main` or `master`

**Output:**
- APK file available as a downloadable artifact
- Artifact retention: 90 days

**How to Use:**
1. Go to GitHub Actions tab in your repository
2. Select "Build Android APK" workflow
3. Click "Run workflow" button
4. Wait for the build to complete
5. Download the APK from the Artifacts section

---

### 2. Build and Create Release (`build-and-release.yml`)

**Purpose:** Builds the APK and creates a GitHub Release with the APK attached.

**Triggers:**
- Manual trigger via GitHub Actions UI only

**Inputs:**
- `tag_name`: Release tag name (e.g., v1.0.62) - **Required**
- `release_name`: Display name for the release (default: "Tifto Seller App Release")
- `release_notes`: Release notes in markdown format
- `draft`: Create as draft release (default: false)
- `prerelease`: Create as pre-release (default: false)

**Output:**
- GitHub Release with APK attached
- Git tag created automatically
- Release notes generated automatically

**How to Use:**
1. Go to GitHub Actions tab
2. Select "Build APK and Create Release" workflow
3. Click "Run workflow"
4. Fill in the inputs:
   - **Tag name:** e.g., `v1.0.62`
   - **Release name:** e.g., `Tifto Seller v1.0.62`
   - **Release notes:** Markdown formatted notes
   - **Draft/Pre-release:** Check if needed
5. Click "Run workflow"
6. Wait for completion
7. Find your release in the Releases section

---

## Prerequisites

### Required GitHub Secrets

For the workflows to work properly, you may need to set up these secrets in your repository:

1. **GOOGLE_SERVICES_JSON** (Optional but recommended)
   - Your Firebase `google-services.json` file content
   - Go to: Repository Settings → Secrets and variables → Actions → New repository secret
   - If not set, a placeholder will be used (not suitable for production)

### No Secrets Required (Default)

The workflows will work without any secrets, but will use placeholder Firebase configuration.

---

## Workflow Features

✅ **Automatic Setup**
- Node.js 20.18.0 (matches eas.json)
- Java JDK 17
- Android SDK (latest)
- All required dependencies

✅ **Build Process**
- Installs npm dependencies
- Generates Android native code
- Fixes React Native worklets compatibility
- Builds release APK

✅ **Artifact Management**
- Uploads APK as downloadable artifact
- 90-day retention period
- Easy download from GitHub UI

✅ **Release Management**
- Creates Git tags automatically
- Generates release notes
- Attaches APK to releases
- Supports draft and pre-release flags

---

## Build Output

The APK file will be located at:
```
android/app/build/outputs/apk/release/app-release.apk
```

Download the artifact or release to get the APK file.

---

## Troubleshooting

### Build Fails

1. **Check the workflow logs** in the Actions tab
2. **Verify dependencies** are up to date in `package.json`
3. **Ensure Android SDK** is properly configured (handled automatically)
4. **Check for errors** in the build logs

### APK Not Found

1. Check if the build actually completed successfully
2. Verify the APK path in the build logs
3. Check artifact upload section for errors

### Release Creation Fails

1. Ensure you have write permissions to the repository
2. Check if the tag name already exists
3. Verify all required inputs are provided

---

## Environment Variables

The workflows use these environment variables:
- `NPM_CONFIG_LEGACY_PEER_DEPS: "true"` - Required for dependency compatibility
- `CI: "true"` - Enables CI-specific optimizations

---

## Manual Build

If you prefer to build locally, see `BUILD_APK_INSTRUCTIONS.md` in the root directory.

---

## Support

For issues or questions:
1. Check the workflow logs
2. Review error messages in the Actions tab
3. Ensure all prerequisites are met

