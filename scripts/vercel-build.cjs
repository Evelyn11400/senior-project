/**
 * Vercel only: copy static assets into public/ and write mqtt-config.js there.
 * Output has no package.json → Vercel serves it as static files (no Node entrypoint error).
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const pub = path.join(root, "public");

if (process.env.VERCEL !== "1") {
  console.log("[vercel-build] Skip outside Vercel (use repo root files locally).");
  process.exit(0);
}

var toCopy = [
  "desktop.html",
  "mobile.html",
  "index.html",
  "MQtest.html",
  "styles.css",
  "map-embedded.svg",
  "hivemq-client.js",
  "mqtt-config.example.js",
];

fs.mkdirSync(pub, { recursive: true });
for (var i = 0; i < toCopy.length; i++) {
  var name = toCopy[i];
  var src = path.join(root, name);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(pub, name));
  } else {
    console.warn("[vercel-build] Missing file (skipped):", name);
  }
}

var host = process.env.MQTT_HOST || "";
var user = process.env.MQTT_USERNAME || "";
var pass = process.env.MQTT_PASSWORD || "";
var content;
if (!host || !user || !pass) {
  content =
    "/** Vercel: set MQTT_HOST, MQTT_USERNAME, MQTT_PASSWORD in Environment Variables */\n" +
    "window.BLACKOUT_MQTT_CONFIG = {\n" +
    '  host: "",\n' +
    "  wsPort: 8884,\n" +
    '  wsPath: "/mqtt",\n' +
    '  username: "",\n' +
    '  password: "",\n' +
    '  clientId: "",\n' +
    "};\n";
  console.warn("[vercel-build] Missing MQTT_* env — wrote empty mqtt-config.js.");
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
  console.log("[vercel-build] Wrote mqtt-config.js from env.");
}

fs.writeFileSync(path.join(pub, "mqtt-config.js"), content, "utf8");
console.log("[vercel-build] Done → output directory public/");
