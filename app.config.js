const base = require("./app.json").expo;

// HTTP local é permitido somente no APK interno de testes.
module.exports = () => ({
  ...base,
  plugins: [
    ...(base.plugins || []),
    ["./plugins/withLocalNetwork", { enabled: process.env.EAS_BUILD_PROFILE === "preview" }],
  ],
});
