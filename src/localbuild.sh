keytool -genkeypair -v -storetype PKCS12 -keystore release-key.keystore -alias rnProduction-key -keyalg RSA -keysize 2048 -validity 10000

rmdir /s /q node_modules
rmdir /s /q android

expo install
npx expo prebuild --clean --no-install --platform android
xcopy "build.gradle" ".\android\build.gradle" /Y
xcopy "gradle.properties" ".\android\gradle.properties" /Y
copy ".\assets\*.*"  ".\android\app\src\main\res\drawable"
xcopy "release-key.keystore" ".\android" /Y
cd android
rm -rf .gradle/ && gradlew clean

npm run android

set EXPO_PUBLIC_GOOGLE_MAP_API_KEY=AIzaSyAprINTY_E5slgC2DIb-ZXF8k9I2pBIWOE

cd android
gradlew bundleRelease 
//npx react-native build-android --mode=release
//https://stackoverflow.com/questions/78123397/react-native-error-regards-to-react-native-vision-camera-and-react-native-reanim
gradlew assembleRelease

aws s3 cp .\app\build\outputs\apk\release\app-release.apk s3://ickeckify-apk/demo/ --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers full=id=e87d51ba1b7f28ae787f92bbc5d72972d8f39dc9dd3a037e172d2b1dc1f8c466
https://ickeckify-apk.s3.ap-southeast-2.amazonaws.com/demo/app-release.apk

aws s3 cp .\app\build\outputs\apk\release\app-release.apk s3://ickeckify-apk/prod/ --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers full=id=e87d51ba1b7f28ae787f92bbc5d72972d8f39dc9dd3a037e172d2b1dc1f8c466
https://ickeckify-apk.s3.ap-southeast-2.amazonaws.com/prod/app-release.apk




-------------------------

Bundle Android Resources: Execute the command npx npm run bundle:android to bundle your Android resources.

Clean the Android Project: Navigate to your Android project directory with cd android, then run gradlew clean to clean your Android project.

Remove Dependencies and Android Build: Go back to your project root directory and remove all dependencies and the Android build with the command rm -rf -- node_modules package-lock.json android/build.

Install All Dependencies: Run npx npm install --legacy-peer-deps to install all the necessary dependencies.

Modify CMakeLists.txt: Open the file node_modules/react-native-vision-camera/android/CMakeLists.txt and add the following lines at the top of the file:

set(ENABLE_FRAME_PROCESSORS ON)
find_package(react-native-worklets-core REQUIRED CONFIG)
Run the Project: Finally, launch your project from Android Studio.
-------------------------------------


adb devices
adb logcat -v time > log.txt