module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    "plugins": [
      ["react-native-worklets-core/plugin"],
      'react-native-reanimated/plugin',
       [ "module-resolver",
        {
          "root": ["./src"],
          "alias": {
            '@root': './',
            '@src': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@configurations' : './src/config' ,
            '@core' : './src/core',
            '@helpers' : './src/helpers',
            '@hooks' : './src/hooks',
            '@services' : './src/service',
            '@store' : './src/store'
          }
        }
      ]
    ]
  };
};
