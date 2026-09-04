const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [
  /node_modules\/expo-modules-core\/expo-module-gradle-plugin\/bin\/.*/,
];

module.exports = withNativeWind(config, { input: './global.css' });