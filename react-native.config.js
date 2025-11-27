module.exports = {
  dependencies: {
    'react-native-worklets': {
      platforms: {
        android: null, // Disable Android platform, causing conflict with react-native-worklets-core
        ios: null, // Disable iOS platform as well
      },
    },
  },
};

