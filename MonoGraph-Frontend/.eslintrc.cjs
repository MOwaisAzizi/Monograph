module.exports = {
  root: true,
  extends: ['@react-native', 'prettier'],
  plugins: ['prettier'],
  ignorePatterns: ['node_modules/', 'ios/', 'android/', 'build/'],
  rules: {
    'prettier/prettier': 'warn',
  },
};
