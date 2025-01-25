module.exports = () => {
    if (process.env.MY_ENVIRONMENT === 'production') {
      return {
        /* your production config */
        "name": "icheckify",
        "android": {
            "adaptiveIcon": {
              "foregroundImage": "./assets/icheckifyIcon.png",
              "backgroundColor": "#ffffff"
            },
            "permissions": [
             "android.permission.CAMERA",
              "CAMERA", 
              "READ_PHONE_STATE",
              "READ_PHONE_NUMBERS",
              "RECEIVE_SMS",
              "READ_SMS"
            ],
            "package": "com.binaytripathi.icheckify",
            "config": {
              "googleMaps": {
                "apiKey": process.env.EXPO_PUBLIC_GOOGLE_MAP_API_KEY
              }
            },
          },
          extra: {
            baseURL : 'https://icheckify.azurewebsites.net/api'
          }
      };
    } else {
      return {
        "name": "icheckify",
        "android": {
            "adaptiveIcon": {
              "foregroundImage": "./assets/icheckifyIcon.png",
              "backgroundColor": "#ffffff"
            },
            "permissions": [
              "android.permission.CAMERA",
              "CAMERA", 
              "READ_PHONE_STATE",
              "READ_PHONE_NUMBERS",
              "RECEIVE_SMS",
              "READ_SMS"
            ],
            "package": "com.binaytripathi.icheckify",
            "config": {
              "googleMaps": {
                "apiKey": process.env.EXPO_PUBLIC_GOOGLE_MAP_API_KEY
              }
            },
          },
          extra: {
            baseURL : 'https://icheckify.azurewebsites.net/api'
          },
      };
    }
  };
  