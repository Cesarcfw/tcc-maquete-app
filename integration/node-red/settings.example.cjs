module.exports = {
  uiHost: "127.0.0.1",
  uiPort: 1880,
  flowFile: "flows.json",
  nodesDir: require("node:path").join(__dirname, "nodes"),
  functionGlobalContext: { samahi: require("./simulator.cjs").instance },
  httpNodeCors: {
    origin: /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
    methods: ["GET", "POST", "OPTIONS"],
  },
};
