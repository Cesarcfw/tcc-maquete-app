const path = require("node:path");
const { createPhysicalGateway } = require("../physical.cjs");
const { fileStorage } = require("../simulator.cjs");

module.exports = function (RED) {
  function PhysicalGateway(config) {
    RED.nodes.createNode(this, config);
    const shared = this.context().global;
    const gateway = createPhysicalGateway({
      roomId: config.roomId || "quarto-01",
      deviceId: config.deviceId || "ESP32-bancada",
      storage: fileStorage(
        path.join(RED.settings.userDir, "physical-lighting.json"),
      ),
    });
    gateway.setSender((msg) => this.send(msg));
    shared.set("samahiPhysical", gateway);
    this.status({
      fill: "yellow",
      shape: "ring",
      text: "Aguardando ESP fisico",
    });
    this.on("input", (msg, send, done) => {
      try {
        if (gateway.ingest(msg))
          this.status({
            fill: "green",
            shape: "dot",
            text: "ESP recebido / ACK validado",
          });
        done();
      } catch (error) {
        this.status({
          fill: "red",
          shape: "ring",
          text: "Falha na ponte fisica",
        });
        done(error);
      }
    });
    const timer = setInterval(() => {
      void gateway.tick().catch((error) => this.warn(error.message));
    }, 2000);
    this.on("close", (removed, done) => {
      clearInterval(timer);
      gateway.close();
      if (shared.get("samahiPhysical") === gateway)
        shared.set("samahiPhysical", undefined);
      done();
    });
  }
  RED.nodes.registerType("samahi-physical-gateway", PhysicalGateway);
};
