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

    const getBranding = (appOwner) => {
      switch(appOwner) {
        case 'icheckify':
          return {
            adaptiveIcon: {
              "foregroundImage": "./assets/icheckifyIcon.png",
              "backgroundColor": "#ffffff"
            }
          };
        case 'policyIntel':
        default:
          return {
            icon: "./assets/policyintel-icon.png",
            splash: {
              "image": "./assets/policyintel-splash.png",
              "resizeMode": "contain",
              "backgroundColor": "#0B1F33"
            },
            adaptiveIcon: {
              "foregroundImage": "./assets/policyintel-adaptive-icon.png",
              "backgroundColor": "#0B1F33"
            },
            plugins: [
              ["expo-splash-screen", {
                "image": "./assets/policyintel-splash.png",
                "imageWidth": 180,
                "resizeMode": "contain",
                "backgroundColor": "#0B1F33"
              }]
            ]
          };
      }
    };

    const branding = getBranding(APP_OWNER);

    if (process.env.MY_ENVIRONMENT === 'production') {
      return {
        /* your production config */
        "name": getAppName(APP_OWNER),
        "icon": branding.icon,
        "splash": branding.splash,
        "plugins": branding.plugins,
        "android": {
            "adaptiveIcon": branding.adaptiveIcon,
            "splash": branding.splash,
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
        "icon": branding.icon,
        "splash": branding.splash,
        "plugins": branding.plugins,
        "android": {
            "adaptiveIcon": branding.adaptiveIcon,
            "splash": branding.splash,
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
  