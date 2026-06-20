# Build Android App - Usage Guide

## Quick Start

### Option 1: Using PowerShell Script (Recommended)

Navigate to your project root and run:

```powershell
# Full build process (you'll be prompted for options)
.\build.ps1

# Release build with icheckify
.\build.ps1 -AppOwner icheckify -BuildType release

# Release build and upload to S3
.\build.ps1 -AppOwner policyIntel -BuildType release -UploadToS3 $true
```

When prompted:
- **Remove node_modules?** - Enter `y` only if you've added/updated packages, otherwise press Enter to skip (faster build)
- **Debug only?** - Enter `y` to just run the app for debugging on a connected device/emulator, or press Enter to build APK

### Option 2: Using Copilot Skill

Ask Copilot: 
> "Run the build-android-app skill"

Copilot will prompt you for:
- APP_OWNER (icheckify or policyIntel)
- Build Type (development or release)
- Upload to S3 (yes/no)

### Option 3: Manual Steps with Environment Variable

Set the environment variable before running your manual steps:

```powershell
# Set APP_OWNER environment variable
$env:APP_OWNER = 'icheckify'  # or 'policyIntel'

# Then follow your manual build steps
# The app.config.js will automatically use the correct baseURL
```

## Configuration

### APP_OWNER Variable

- **icheckify**: Uses `https://icheckify-demo.azurewebsites.net/api`
- **policyIntel** (default): Uses `https://policy-intel.azurewebsites.net/api`

### Build Types

- **development**: Faster build for testing, creates debug APK
- **release**: Optimized build for production, creates release APK/bundle

### Keystores

The script automatically handles keystores:
- **Release keystore** (`release-key.keystore`): Copied to `android/` for signing release builds
- **Debug keystore** (`debug.keystore`): Moved from `android/app/debug.keystore` to `android/debug.keystore`

### Debug Mode vs Build Mode

**Debug Mode** (when you select "Debug only? y"):
- Runs `npm run android` to deploy directly to connected device/emulator
- Faster than building APK (2-5 minutes)
- Requires Android device or emulator connected via ADB
- Great for active development and testing
- App stays running and reloads on code changes

**Build Mode** (default):
- Creates an APK file
- Slower but creates a standalone app you can share/test offline
- Great for QA testing or production releases

### Required Environment Variables

```powershell
# For release builds (required)
$env:EXPO_PUBLIC_GOOGLE_MAP_API_KEY = 'your-google-maps-api-key'

# For S3 uploads (required)
# Configure AWS CLI: aws configure
# Add your AWS credentials with S3 permissions
```

## Examples

### Example 1: Debug Only (Run App on Device/Emulator)
```powershell
$env:APP_OWNER = 'icheckify'
.\build.ps1
# When prompted:
# Remove node_modules? (press Enter to skip)
# Debug only? (enter 'y')
```
- Runs `npm run android` to deploy and debug on connected device/emulator
- No APK file created
- Fastest option for development testing (2-5 minutes)

### Example 2: Development Build (Quick Testing)
```powershell
$env:APP_OWNER = 'icheckify'
.\build.ps1
# When prompted:
# Remove node_modules? (press Enter to skip)
# Debug only? (press Enter to build APK)
```
- Creates debug APK in `android/app/build/outputs/apk/debug/`
- Faster build time (5-10 minutes if skipping node_modules)

### Example 2: Release Build for Production
```powershell
$env:EXPO_PUBLIC_GOOGLE_MAP_API_KEY = 'AIzaSy...'
$env:APP_OWNER = 'policyIntel'
.\build.ps1
# When prompted:
# Remove node_modules? (enter 'n' unless packages changed)
# Debug only? (press Enter to build APK)
```
- Creates optimized release APK in `android/app/build/outputs/apk/release/`
- Uploads to S3 bucket
- Takes longer (20-30 minutes)

### Example 3: icheckify Release Build with Manual Upload
```powershell
$env:EXPO_PUBLIC_GOOGLE_MAP_API_KEY = 'AIzaSy...'
$env:APP_OWNER = 'icheckify'
.\build.ps1 -AppOwner icheckify -BuildType release
# When prompted:
# Remove node_modules? (enter 'n' unless packages changed)
# Debug only? (press Enter to build APK)
# APK will be at: android/app/build/outputs/apk/release/app-release.apk
# Then manually upload if needed
```

## Output Files

### Development Build
- APK: `android/app/build/outputs/apk/debug/app-debug.apk`
- Size: ~150-200 MB

### Release Build
- APK: `android/app/build/outputs/apk/release/app-release.apk`
- Bundle: `android/app/build/outputs/bundle/release/app-release.aab`
- Size: ~80-120 MB

## Troubleshooting

### Debug Mode Issues

#### "No connected devices/emulators"
Ensure you have:
```bash
# Check connected devices
adb devices

# If no device shown, start an Android emulator or connect a physical device via USB
```

#### "npm run android failed"
```bash
# Make sure you're in the project root
cd c:\risk-control-unit-app

# Verify npm is installed
npm --version

# Try running it manually
npm run android
```

### "expo CLI not found"
```powershell
npm install -g expo-cli
```

### "gradlew clean failed"
- Ensure Java is installed: `java -version`
- Check Android SDK is configured
- Try deleting the `android` folder and rerun the script

### "AWS CLI not found"
```powershell
# Install AWS CLI v2 from: https://aws.amazon.com/cli/
# Then configure: aws configure
```

### Build takes too long
- First build is slower due to dependency setup
- Ensure sufficient disk space (5GB+)
- Close other applications to free up RAM

### "EXPO_PUBLIC_GOOGLE_MAP_API_KEY not set"
For release builds, you must set this variable:
```powershell
$env:EXPO_PUBLIC_GOOGLE_MAP_API_KEY = 'your-api-key'
```

## Manual Steps (If Script Fails)

### For Debug Only Mode

```powershell
# 1. Ensure device/emulator is connected
adb devices

# 2. Set environment variable
$env:APP_OWNER = 'icheckify'  # or 'policyIntel'

# 3. Run the app
npm run android

# App should deploy and run on your device/emulator
```

### For Full APK Build

If the script fails, you can follow these manual steps:

```powershell
# 1. Clean (optional - only if new packages added)
# rmdir /s /q node_modules

# 2. Clean android build
rmdir /s /q android

# 3. Install and prebuild
expo install
npx expo prebuild --clean --no-install --platform android

# 4. Copy files
xcopy "build.gradle" ".\android\build.gradle" /Y
xcopy "gradle.properties" ".\android\gradle.properties" /Y
copy ".\assets\*.*" ".\android\app\src\main\res\drawable"

# 5. Move debug keystore
move ".\android\app\debug.keystore" ".\android\debug.keystore"

# 6. Build
cd android
gradlew clean
gradlew assembleRelease  # or assembleDebug
cd ..

# 7. Find APK
# Release: android\app\build\outputs\apk\release\app-release.apk
# Debug: android\app\build\outputs\apk\debug\app-debug.apk
```

## Environment Variables Summary

Create a `.env.local` file in your project root (don't commit):

```
APP_OWNER=icheckify
EXPO_PUBLIC_GOOGLE_MAP_API_KEY=AIzaSy...
MY_ENVIRONMENT=production
```

Then load it before running:
```powershell
# Load from .env.local
Get-Content .env.local | ForEach-Object {
    if ($_ -notmatch '^\s*#' -and $_ -match '=') {
        $name, $value = $_.split('=')
        Set-Item -Path "env:$name" -Value $value
    }
}
```
