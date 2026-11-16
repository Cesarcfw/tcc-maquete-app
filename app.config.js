const base = require("./app.json").expo;

// HTTP local é permitido somente no APK interno de testes.
module.exports = () => {
  const evaluation = process.env.APP_VARIANT === "evaluation";
  return {
    ...base,
    name: evaluation ? "SAMAHI Avaliação" : base.name,
    extra: {
      ...base.extra,
      appVariant: evaluation ? "evaluation" : "integrated",
    },
    android: {
      ...base.android,
      ...(evaluation
        ? { package: "com.cesarcfw.tccmaqueteapp.evaluation", versionCode: 1 }
        : {}),
    },
    plugins: [
      ...(base.plugins || []),
      [
        "./plugins/withLocalNetwork",
        { enabled: process.env.EAS_BUILD_PROFILE === "preview" },
      ],
    ],
  };
};
