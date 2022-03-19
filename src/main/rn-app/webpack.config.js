const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      // https://bleepcoder.com/react-native-ui-kitten/596839013/module-parse-failed-unexpected-token-you-may-need-an
      // I took the example from harryy2510 on 19 Apr 2020
      dangerouslyAddModulePathsToTranspile: ['@miblanchard/react-native-slider']
    }
  }, argv);
  return config;
};
