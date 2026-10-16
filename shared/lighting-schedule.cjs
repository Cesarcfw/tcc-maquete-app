const TIME_ZONE = "America/Sao_Paulo";
const clockFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
const minutes = (value) =>
  Number(value.slice(0, 2)) * 60 + Number(value.slice(3));
function defaultLightingSchedule() {
  return {
    timeZone: TIME_ZONE,
    dayStart: "07:00",
    nightStart: "19:00",
    dayIntensity: 100,
    nightIntensity: 20,
  };
}
function validLightingSchedule(value) {
  const time = (text) =>
    typeof text === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(text);
  const level = (n) => Number.isInteger(n) && n >= 0 && n <= 100;
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    value.timeZone === TIME_ZONE &&
    time(value.dayStart) &&
    time(value.nightStart) &&
    value.dayStart !== value.nightStart &&
    level(value.dayIntensity) &&
    level(value.nightIntensity)
  );
}
function lightingPeriod(schedule, timestamp) {
  if (!validLightingSchedule(schedule))
    throw new Error("Programação de luz inválida.");
  const parts = clockFormat.formatToParts(new Date(timestamp));
  const current =
    Number(parts.find((p) => p.type === "hour").value) * 60 +
    Number(parts.find((p) => p.type === "minute").value);
  const day = minutes(schedule.dayStart),
    night = minutes(schedule.nightStart);
  const isDay =
    day < night
      ? current >= day && current < night
      : current >= day || current < night;
  return isDay ? "day" : "night";
}
module.exports = {
  TIME_ZONE,
  defaultLightingSchedule,
  validLightingSchedule,
  lightingPeriod,
};
