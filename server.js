const path = require("path");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

/** In-memory only — cleared on every server restart */
const submittedNames = [];
const nameStreamClients = new Set();

function broadcastNames() {
  var payload = JSON.stringify({ names: submittedNames.slice() });
  var line = "data: " + payload + "\n\n";
  nameStreamClients.forEach(function (res) {
    try {
      res.write(line);
    } catch (e) {
      nameStreamClients.delete(res);
    }
  });
}

app.get("/api/names/stream", function (req, res) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  if (typeof res.flushHeaders === "function") res.flushHeaders();

  var initial = JSON.stringify({ names: submittedNames.slice() });
  res.write("data: " + initial + "\n\n");

  nameStreamClients.add(res);
  req.on("close", function () {
    nameStreamClients.delete(res);
  });
});

app.post("/api/names", function (req, res) {
  var raw = req.body && req.body.name;
  var name = typeof raw === "string" ? raw.trim() : "";
  if (name) {
    submittedNames.push(name);
    broadcastNames();
  }
  res.json({ ok: true, names: submittedNames.slice() });
});

app.get("/api/names", function (req, res) {
  res.json({ names: submittedNames.slice() });
});

/* /desktop and /mobile (any case, optional trailing slash) — must run THIS server, then restart after edits */
app.use(function (req, res, next) {
  if (req.method !== "GET" && req.method !== "HEAD") return next();
  var p = req.path.replace(/\/+$/, "") || "/";
  var key = p.toLowerCase();
  if (key === "/desktop") {
    return res.sendFile(path.join(__dirname, "desktop.html"));
  }
  if (key === "/mobile") {
    return res.sendFile(path.join(__dirname, "mobile.html"));
  }
  next();
});

app.use(express.static(path.join(__dirname)));

var PORT = process.env.PORT || 3000;
var server = app.listen(PORT, "0.0.0.0", function () {
  console.log("");
  console.log("Blackout Reboot — http://localhost:" + PORT);
  console.log("  Desktop: /desktop  or  /desktop.html");
  console.log("  Mobile:  /mobile   or  /mobile.html");
  console.log("  LAN:     http://<your-PC-IPv4>:" + PORT + "/desktop");
  console.log("Restart this process after changing server.js. Do not use npx serve for :3000.");
  console.log("");
});

server.on("error", function (err) {
  if (err.code === "EADDRINUSE") {
    console.error("");
    console.error("【端口 " + PORT + " 已被占用】");
    console.error("多半说明服务器已经在跑了，可直接用浏览器打开:");
    console.error("  http://localhost:" + PORT + "/desktop.html");
    console.error("若要重启：任务管理器 → 结束 Node.js → 再双击 start-server.bat");
    console.error("");
  } else {
    console.error(err);
  }
  process.exit(1);
});
