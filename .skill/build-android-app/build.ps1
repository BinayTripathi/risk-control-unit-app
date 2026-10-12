# Build Android App Automation Script
# Usage: .\build.ps1 -AppOwner icheckify -BuildType release -UploadToS3 $true

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('icheckify', 'policyIntel')]
    [string]$AppOwner = 'policyIntel',
    
    [Parameter(Mandatory=$false)]
    [ValidateSet('development', 'release')]
    [string]$BuildType = 'development',
    
    [Parameter(Mandatory=$false)]
    [boolean]$UploadToS3 = $false,
    
    [Parameter(Mandatory=$false)]
    [string]$ProjectRoot = (Get-Location)
)

# Color output
function Write-Header { Write-Host "`n========== $args ==========`n" -ForegroundColor Cyan }
function Write-Success { Write-Host "✓ $args" -ForegroundColor Green }
function Write-Error_ { Write-Host "✗ $args" -ForegroundColor Red }
function Write-Info { Write-Host "ℹ $args" -ForegroundColor Yellow }

# Set error action to stop on any error
$ErrorActionPreference = 'Stop'

# Trap errors
trap {
    Write-Error_ "Build failed: $_"
    exit 1
}

Write-Header "Android Build Process Started"
Write-Info "APP_OWNER: $AppOwner"
Write-Info "Build Type: $BuildType"
Write-Info "Upload to S3: $UploadToS3"
Write-Info "Project Root: $ProjectRoot"

# Set environment variable
$env:APP_OWNER = $AppOwner

# Ask if user wants to remove node_modules
Write-Header "Build Options"
$removeNodeModules = Read-Host "Remove node_modules? (Enter 'y' for yes, or press Enter to skip) [y/N]"
$removeNodeModules = if ($removeNodeModules -eq 'y' -or $removeNodeModules -eq 'yes') { $true } else { $false }

if ($removeNodeModules) {
    Write-Info "node_modules will be removed during cleanup"
} else {
    Write-Info "Keeping existing node_modules"
}

# Ask if user only wants to debug
$debugOnly = Read-Host "Debug only? (Enter 'y' to just run 'npm run android' for debugging, or press Enter to build APK) [y/N]"
$debugOnly = if ($debugOnly -eq 'y' -or $debugOnly -eq 'yes') { $true } else { $false }

if ($debugOnly) {
    Write-Info "Debug mode: Will run 'npm run android' to debug on connected device/emulator"
}

# Validate prerequisites
Write-Header "Validating Prerequisites"

if (-not (Get-Command expo -ErrorAction SilentlyContinue)) {
    Write-Error_ "expo CLI not found. Install with: npm install -g expo-cli"
    exit 1
}

if (-not (Get-Command gradlew -ErrorAction SilentlyContinue) -and -not (Test-Path "$ProjectRoot\android\gradlew.bat")) {
    Write-Info "gradlew will be generated during prebuild"
}

Write-Success "Prerequisites validated"

# If debug only mode, skip to debug flow
if ($debugOnly) {
    Write-Header "Debug Mode - Skipping APK Build"
    
    Write-Info "Setting APP_OWNER environment variable: $AppOwner"
    
    Write-Header "Running npm run android"
    Write-Info "Make sure you have an Android emulator running or device connected via ADB"
    Write-Info "Running: npm run android"
    
    Push-Location "$ProjectRoot"
    & npm run android
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error_ "npm run android failed"
        Pop-Location
        exit 1
    }
    
    Pop-Location
    Write-Header "Debug Session Started"
    Write-Success "App should be running on your device/emulator"
    exit 0
}

Write-Header "Build Mode - Creating APK"
Write-Header "Cleaning Previous Builds"

if ($removeNodeModules) {
    if (Test-Path "$ProjectRoot\node_modules") {
        Write-Info "Removing node_modules..."
        Remove-Item -Path "$ProjectRoot\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
        Write-Success "node_modules removed"
    }
} else {
    Write-Info "Skipping node_modules removal"
}

if (Test-Path "$ProjectRoot\android") {
    Write-Info "Removing android build directory..."
    Remove-Item -Path "$ProjectRoot\android" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Success "android directory removed"
}

# Step 2: Install dependencies and prebuild
Write-Header "Installing Dependencies"

Write-Info "Running: expo install"
& expo install
if ($LASTEXITCODE -ne 0) { throw "expo install failed" }
Write-Success "Dependencies installed"

Write-Header "Running Expo Prebuild"

Write-Info "Running: expo prebuild --clean --no-install --platform android"
& npx expo prebuild --clean --no-install --platform android
if ($LASTEXITCODE -ne 0) { throw "expo prebuild failed" }
Write-Success "Expo prebuild completed"

# Step 3: Copy configuration files
Write-Header "Copying Configuration Files"

if (Test-Path "$ProjectRoot\build.gradle") {
    Write-Info "Copying build.gradle..."
    Copy-Item -Path "$ProjectRoot\build.gradle" -Destination "$ProjectRoot\android\build.gradle" -Force
    Write-Success "build.gradle copied"
}

if (Test-Path "$ProjectRoot\gradle.properties") {
    Write-Info "Copying gradle.properties..."
    Copy-Item -Path "$ProjectRoot\gradle.properties" -Destination "$ProjectRoot\android\gradle.properties" -Force
    Write-Success "gradle.properties copied"
}

# Step 4: Copy assets
Write-Header "Copying Assets"

if (Test-Path "$ProjectRoot\assets") {
    Write-Info "Copying assets to drawable..."
    if (-not (Test-Path "$ProjectRoot\android\app\src\main\res\drawable")) {
        New-Item -ItemType Directory -Path "$ProjectRoot\android\app\src\main\res\drawable" -Force | Out-Null
    }
    Copy-Item -Path "$ProjectRoot\assets\*.*" -Destination "$ProjectRoot\android\app\src\main\res\drawable" -Force -ErrorAction SilentlyContinue
    Write-Success "Assets copied"
}

# Step 5: Copy release keystore
Write-Header "Copying Release Keystore"

if (Test-Path "$ProjectRoot\src\release-key.keystore") {
    Write-Info "Copying release-key.keystore..."
    Copy-Item -Path "$ProjectRoot\src\release-key.keystore" -Destination "$ProjectRoot\android\release-key.keystore" -Force
    Write-Success "Keystore copied"
}
elseif (Test-Path "$ProjectRoot\release-key.keystore") {
    Write-Info "Copying release-key.keystore..."
    Copy-Item -Path "$ProjectRoot\release-key.keystore" -Destination "$ProjectRoot\android\release-key.keystore" -Force
    Write-Success "Keystore copied"
} else {
    Write-Info "No release keystore found (optional)"
}

# Step 5.5: Move debug keystore
Write-Header "Moving Debug Keystore"

if (Test-Path "$ProjectRoot\android\app\debug.keystore") {
    Write-Info "Moving debug.keystore from app/ to android/..."
    Move-Item -Path "$ProjectRoot\android\app\debug.keystore" -Destination "$ProjectRoot\android\debug.keystore" -Force
    Write-Success "debug.keystore moved"
} else {
    Write-Info "No debug.keystore found in android/app/ (optional)"
}

# Step 6: Configure Gradle
Write-Header "Configuring Gradle"

$buildGradleFile = "$ProjectRoot\android\app\build.gradle"
if (Test-Path $buildGradleFile) {
    Write-Info "Commenting out line 17 in app/build.gradle (enableBundleCompression)..."
    $content = Get-Content $buildGradleFile
    $content = $content -replace 'enableBundleCompression', '// enableBundleCompression'
    Set-Content -Path $buildGradleFile -Value $content
    Write-Success "build.gradle configured"
}

# Step 7: Clean gradle cache
Write-Header "Cleaning Gradle Cache"

Push-Location "$ProjectRoot\android"

Write-Info "Running: gradlew clean"
& .\gradlew.bat clean
if ($LASTEXITCODE -ne 0) { 
    Write-Error_ "gradlew clean failed"
    Pop-Location
    exit 1
}
Write-Success "Gradle cache cleaned"

# Step 8: Build
Write-Header "Building Android Project"

if ($BuildType -eq 'release') {
    if (-not $env:EXPO_PUBLIC_GOOGLE_MAP_API_KEY) {
        Write-Error_ "EXPO_PUBLIC_GOOGLE_MAP_API_KEY environment variable not set"
        Pop-Location
        exit 1
    }
    
    Write-Info "Running: gradlew bundleRelease"
    & .\gradlew.bat bundleRelease
    if ($LASTEXITCODE -ne 0) { 
        Write-Error_ "gradlew bundleRelease failed"
        Pop-Location
        exit 1
    }
    Write-Success "Bundle build completed"
    
    Write-Info "Running: gradlew assembleRelease"
    & .\gradlew.bat assembleRelease
    if ($LASTEXITCODE -ne 0) { 
        Write-Error_ "gradlew assembleRelease failed"
        Pop-Location
        exit 1
    }
    Write-Success "Release APK build completed"
    
    $apkPath = "$ProjectRoot\android\app\build\outputs\apk\release\app-release.apk"
} else {
    Write-Info "Running: gradlew assembleDebug"
    & .\gradlew.bat assembleDebug
    if ($LASTEXITCODE -ne 0) { 
        Write-Error_ "gradlew assembleDebug failed"
        Pop-Location
        exit 1
    }
    Write-Success "Debug APK build completed"
    
    $apkPath = "$ProjectRoot\android\app\build\outputs\apk\debug\app-debug.apk"
}

Pop-Location

# Step 9: Upload to S3
if ($UploadToS3) {
    Write-Header "Uploading to S3"
    
    if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
        Write-Error_ "AWS CLI not found. Install it to enable S3 uploads."
        exit 1
    }
    
    if (Test-Path $apkPath) {
        $s3Bucket = "ickeckify-apk"
        $s3Path = if ($BuildType -eq 'release') { "prod" } else { "demo" }
        
        Write-Info "Uploading to s3://$s3Bucket/$s3Path/..."
        & aws s3 cp $apkPath "s3://$s3Bucket/$s3Path/" `
            --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers `
            full=id=e87d51ba1b7f28ae787f92bbc5d72972d8f39dc9dd3a037e172d2b1dc1f8c466
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "APK uploaded to S3"
            Write-Info "Download URL: https://$s3Bucket.s3.ap-southeast-2.amazonaws.com/$s3Path/app-$(if ($BuildType -eq 'release') { 'release' } else { 'debug' }).apk"
        } else {
            Write-Error_ "S3 upload failed"
        }
    } else {
        Write-Error_ "APK not found at $apkPath"
        exit 1
    }
}

Write-Header "Build Process Completed Successfully"
Write-Success "APK location: $apkPath"
