function pluginName(plugin) {
  return Array.isArray(plugin) ? plugin[0] : plugin;
}

module.exports = ({ config }) => {
  const configuredUrl = process.env.OPS_EXPO_DEV_CLIENT_URL?.trim();
  const defaultLaunchURL = configuredUrl && /^https?:\/\//.test(configuredUrl)
    ? configuredUrl
    : undefined;
  const safeServerUrl = process.env.EXPO_PUBLIC_SAFE_SERVER_URL?.trim() || "https://safe.boxtiove.com";
  const allowCleartextForLocalTest = Boolean(safeServerUrl?.startsWith("http://"));
  const plugins = (config.plugins ?? []).filter(
    (plugin) => !["expo-dev-client", "expo-build-properties"].includes(pluginName(plugin))
  );

  return {
    ...config,
    plugins: [
      ...plugins,
      [
        "expo-build-properties",
        {
          android: {
            usesCleartextTraffic: allowCleartextForLocalTest
          }
        }
      ],
      [
        "expo-dev-client",
        {
          launchMode: "most-recent",
          ...(defaultLaunchURL ? { defaultLaunchURL } : {})
        }
      ]
    ]
  };
};
