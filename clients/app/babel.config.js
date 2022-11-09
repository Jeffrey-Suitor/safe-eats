module.exports = function (api) {
  api.cache(true);
  return {
    plugins: [
      "nativewind/babel",
      "transform-inline-environment-variables",
      "react-native-reanimated/plugin",
    ],
    presets: ["babel-preset-expo"],
    env: {
      production: {
        plugins: ["react-native-paper/babel"],
      },
    },
  };
};
