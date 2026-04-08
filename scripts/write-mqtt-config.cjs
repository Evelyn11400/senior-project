/**
 * Vercel build: create mqtt-config.js from env (never commit secrets to git).
 * Only runs when VERCEL=1 so `npm run build` locally does not overwrite your mqtt-config.js.
 */
const fs = require("fs");
const path = require("path");

if (process.env.VERCEL !== "1") {
  console.log("[write-mqtt-config] Skip (only runs on Vercel; local mqtt-config.js left unchanged).");
  process.exit(0);
}

const outPath = path.join(__dirname, "..", "mqtt-config.js");

var host = process.env.MQTT_HOST || "";
var user = process.env.MQTT_USERNAME || "";
var pass = process.env.MQTT_PASSWORD || "";

var content;
if (!host || !user || !pass) {
  content =
    "/** Vercel: set MQTT_HOST, MQTT_USERNAME, MQTT_PASSWORD in Project → Settings → Environment Variables */\n" +
    "window.BLACKOUT_MQTT_CONFIG = {\n" +
    '  host: "",\n' +
    "  wsPort: 8884,\n" +
    '  wsPath: "/mqtt",\n' +
    '  username: "",\n' +
    '  password: "",\n' +
    '  clientId: "",\n' +
    "};\n";
  console.warn(
    "[write-mqtt-config] Missing MQTT_* env vars — wrote empty mqtt-config.js (pages will warn until you set secrets on Vercel)."
  );
} else {
  var port = parseInt(process.env.MQTT_WS_PORT || "8884", 10) || 8884;
  var wsPath = process.env.MQTT_WS_PATH || "/mqtt";
  var topic = (process.env.MQTT_NAME_TOPIC || "").trim();
  var topicLine = topic ? "  nameTopic: " + JSON.stringify(topic) + ",\n" : "";
  content =
    "window.BLACKOUT_MQTT_CONFIG = {\n" +
    "  host: " +
    JSON.stringify(host) +
    ",\n" +
    "  wsPort: " +
    port +
    ",\n" +
    "  wsPath: " +
    JSON.stringify(wsPath) +
    ",\n" +
    "  username: " +
    JSON.stringify(user) +
    ",\n" +
    "  password: " +
    JSON.stringify(pass) +
    ",\n" +
    '  clientId: "",\n' +
    topicLine +
    "};\n";
  console.log("[write-mqtt-config] Wrote mqtt-config.js from environment variables.");
}

fs.writeFileSync(outPath, content, "utf8");
