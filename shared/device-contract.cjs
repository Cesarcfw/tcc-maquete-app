function confirmedReply(reply, commandId, kind) {
  if (!reply || reply.commandId !== commandId || !reply.telemetry) return false;
  if (reply.telemetry.source === "node-red-simulator")
    return reply.status === "applied_in_simulator";
  if (reply.telemetry.source !== "esp32-physical") return false;
  if (kind === "acknowledgeGas")
    return (
      reply.status === "acknowledged_in_gateway" &&
      reply.confirmationScope === "app-only"
    );
  return (
    reply.status === "applied_in_hardware" &&
    reply.confirmationScope === "firmware_ack" &&
    typeof reply.wireCommandId === "string" &&
    /^p-[a-f0-9]{24}$/.test(reply.wireCommandId)
  );
}
module.exports = { confirmedReply };
