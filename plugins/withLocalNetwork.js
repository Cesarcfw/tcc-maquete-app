const { withAndroidManifest } = require("expo/config-plugins");

module.exports = (config, { enabled = false } = {}) =>
  withAndroidManifest(config, (result) => {
    const application = result.modResults.manifest.application?.[0];
    if (!application) throw new Error("Aplicação Android ausente no manifesto.");
    application.$ = application.$ || {};
    application.$["android:usesCleartextTraffic"] = String(enabled);
    return result;
  });
