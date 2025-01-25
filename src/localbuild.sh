keytool -genkeypair -v -storetype PKCS12 -keystore release-key.keystore -alias rnProduction-key -keyalg RSA -keysize 2048 -validity 10000

rmdir /s /q node_modules
rmdir /s /q android

expo install
npx expo prebuild --clean --no-install --platform android
xcopy "build.gradle" ".\android\build.gradle" /Y
xcopy "gradle.properties" ".\android\gradle.properties" /Y
copy ".\assets\*.*"  ".\android\app\src\main\res\drawable"
xcopy "release-key.keystore" ".\android\app" /Y
cd android
m -rf .gradle/ && ./gradlew clean

npm run android

set EXPO_PUBLIC_GOOGLE_MAP_API_KEY=aizaSyAmfJSJM1Ej913jydNhTfDtMQMtng7FXtm

cd android
gradlew bundleRelease 
//npx react-native build-android --mode=release
//https://stackoverflow.com/questions/78123397/react-native-error-regards-to-react-native-vision-camera-and-react-native-reanim
gradlew assembleRelease

aws s3 cp .\app\build\outputs\apk\release\app-release.apk s3://ickeckify-apk/demo/ --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers full=id=e87d51ba1b7f28ae787f92bbc5d72972d8f39dc9dd3a037e172d2b1dc1f8c466
https://ickeckify-apk.s3.ap-southeast-2.amazonaws.com/demo/app-release.apk

aws s3 cp .\app\build\outputs\apk\release\app-release.apk s3://ickeckify-apk/prod/ --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers full=id=e87d51ba1b7f28ae787f92bbc5d72972d8f39dc9dd3a037e172d2b1dc1f8c466
https://ickeckify-apk.s3.ap-southeast-2.amazonaws.com/prod/app-release.apk