module.exports = () => {
    const APP_OWNER = process.env.APP_OWNER || 'policyIntel';
    
    const getBaseURL = (appOwner) => {
      switch(appOwner) {
        case 'icheckify':
          return 'https://icheckify-demo.azurewebsites.net/api';
        case 'policyIntel':
        default:
          return 'https://policy-intel.azurewebsites.net/api';
      }
    };

    const getAppName = (appOwner) => {
      switch(appOwner) {
        case 'icheckify':
          return 'iCheckify';
        case 'policyIntel':
        default:
          return 'PolicyIntel';
      }
    };

    if (process.env.MY_ENVIRONMENT === 'production') {
      return {
        /* your production config */
        "name": getAppName(APP_OWNER),
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
            "package": "com.binaytripathi.icheckifyCanhsbc",
            "config": {
              "googleMaps": {
                "apiKey": process.env.EXPO_PUBLIC_GOOGLE_MAP_API_KEY
              }
            },
          },
          extra: {
            APP_OWNER: APP_OWNER,
            baseURL: getBaseURL(APP_OWNER)
          }
      };
    } else {
      return {
        "name": getAppName(APP_OWNER),
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
            APP_OWNER: APP_OWNER,
            baseURL: getBaseURL(APP_OWNER)
          },
      };
    }
  };
  