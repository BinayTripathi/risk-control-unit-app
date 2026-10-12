---
name: build-android-app
description: Automate the complete Android APK build process for the icheckify app. Handles prebuild setup, gradle configuration, asset copying, and APK/bundle generation. Supports APP_OWNER environment variable to switch between icheckify and policyIntel builds. Requires GOOGLE_MAP_API_KEY environment variable for release builds.
---

# Build Android App

This skill automates the complete Android build workflow from the localbuild.sh script.

## Prerequisites

Before running this skill, ensure you have:
- Java Development Kit (JDK) 11+
- Android SDK
- Node.js and npm installed
- AWS CLI configured (for S3 uploads)
- EXPO_PUBLIC_GOOGLE_MAP_API_KEY environment variable set

## Workflow

1. **Ask for build options**
   - Remove node_modules: yes/no (skip if no new packages added)
   - Debug only: yes/no (debug on device/emulator vs build APK)

2. **If debug mode selected**
   - Set APP_OWNER environment variable
   - Run `npm run android` to start debugging on connected device/emulator
   - Exit (no APK build)

3. **If full build mode selected**
   - Prompt user for build configuration
   - APP_OWNER: `icheckify` or `policyIntel` (default: policyIntel)
   - Build type: `development`, `release`
   - Upload to S3: yes/no

4. **Clean previous builds (conditional)**
   - Remove node_modules (only if user confirms)
   - Remove android build directory

5. **Install dependencies and prebuild**
   - Run `expo install`
   - Run `expo prebuild --clean --no-install --platform android`

6. **Copy configuration files**
   - Copy build.gradle to android/
   - Copy gradle.properties to android/
   - Copy assets to android/app/src/main/res/drawable

7. **Copy and move keystores**
   - Copy release-key.keystore to android/
   - Move debug.keystore from android/app/ to android/

8. **Configure Gradle**
   - Comment out line 17 in android/app/build.gradle (enableBundleCompression)

9. **Build Android project**
   - Clean gradle: `cd android && gradlew clean`
   - For development: Run `gradlew assembleDebug`
   - For release: Run `gradlew bundleRelease` and `gradlew assembleRelease`

10. **Upload to S3 (optional)**
    - Upload APK to S3 bucket based on build type

## Configuration Variables

- `APP_OWNER`: `icheckify` or `policyIntel` (default: policyIntel)
  - Controls which baseURL is used in app.config.js
  - icheckify: https://icheckify-demo.azurewebsites.net/api
  - policyIntel: https://policy-intel.azurewebsites.net/api

- `BUILD_TYPE`: `development` or `release`
  - development: Faster build for testing
  - release: Optimized APK/bundle for production

- `EXPO_PUBLIC_GOOGLE_MAP_API_KEY`: Required for release builds

## Usage Examples

**Development build with policyIntel (default):**
```bash
# Copilot will prompt for build type and ask if you want S3 upload
```

**Release build for icheckify:**
```bash
# When prompted:
# - APP_OWNER: icheckify
# - Build type: release
# - Upload to S3: yes
```

## Key Commands Executed

```bash
# Clean
rmdir /s /q node_modules
rmdir /s /q android

# Setup
expo install
npx expo prebuild --clean --no-install --platform android

# Copy files
xcopy "build.gradle" ".\android\build.gradle" /Y
xcopy "gradle.properties" ".\android\gradle.properties" /Y
copy ".\assets\*.*" ".\android\app\src\main\res\drawable"

# Build
cd android
gradlew clean
gradlew bundleRelease  # or assembleRelease
gradlew assembleRelease

# S3 Upload
aws s3 cp .\app\build\outputs\apk\release\app-release.apk s3://ickeckify-apk/{buildType}/ --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers
```

## Error Handling

- Stops if gradle operations fail
- Validates required environment variables are set
- Checks if build artifacts exist before S3 upload
- Validates S3 bucket access before upload

## Notes

- Build process takes 15-30 minutes depending on your machine
- First prebuild takes longer due to dependencies
- Ensure sufficient disk space (5GB+)
- Keep Android Studio or terminal open for detailed error logs if build fails
