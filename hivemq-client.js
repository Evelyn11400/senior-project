/**
 * Shared MQTT (HiveMQ) for mobile + desktop pages.
 * Cross-device traffic uses the broker only — no local /api or other app backend.
 * Names: publish/subscribe BLACKOUT_MQTT_NAME_TOPIC (default blackout/reboot/names).
 */
(function () {
  var cfg = typeof window !== "undefined" ? window.BLACKOUT_MQTT_CONFIG : null;
  var NAME_TOPIC = (cfg && cfg.nameTopic) || "blackout/reboot/names";
  if (typeof window !== "undefined") {
    window.BLACKOUT_MQTT_NAME_TOPIC = NAME_TOPIC;
  }

  function attachStub() {
    window.BlackoutMQTT = {
      connected: false,
      client: null,
      publish: function () {},
      subscribe: function () {},
      unsubscribe: function () {},
      publishSubmittedName: function () {},
    };
  }

  if (!cfg || typeof mqtt === "undefined") {
    if (typeof mqtt === "undefined") {
      console.warn("[Blackout MQTT] mqtt.js not loaded; skip HiveMQ connect.");
    }
    attachStub();
    return;
  }

  if (!cfg.username || !cfg.password) {
    console.warn(
      "[Blackout MQTT] Set username and password in mqtt-config.js (HiveMQ Cloud → Access Management)."
    );
    attachStub();
    return;
  }

  var url =
    "wss://" + cfg.host + ":" + String(cfg.wsPort) + (cfg.wsPath || "/mqtt");
  var clientId =
    cfg.clientId ||
    "blackout-web-" +
      Math.random().toString(36).slice(2) +
      "-" +
      String(Date.now());

  var client = mqtt.connect(url, {
    username: cfg.username,
    password: cfg.password,
    clientId: clientId,
    clean: true,
    reconnectPeriod: 5000,
    keepalive: 60,
  });

  var connected = false;

  client.on("connect", function () {
    connected = true;
    console.log("[Blackout MQTT] connected:", url);
    window.dispatchEvent(
      new CustomEvent("blackout-mqtt-connect", { detail: { client: client } })
    );
  });

  client.on("reconnect", function () {
    console.log("[Blackout MQTT] reconnecting…");
  });

  client.on("close", function () {
    connected = false;
    console.log("[Blackout MQTT] disconnected");
  });

  client.on("error", function (err) {
    console.error("[Blackout MQTT] error:", err);
  });

  window.BlackoutMQTT = {
    client: client,
    get connected() {
      return connected && client.connected;
    },
    publish: function (topic, message, opts) {
      return client.publish(topic, message, opts || {});
    },
    subscribe: function (topic, opts, cb) {
      if (typeof opts === "function") {
        cb = opts;
        opts = {};
      }
      return client.subscribe(topic, opts || {}, cb);
    },
    unsubscribe: function (topic, cb) {
      return client.unsubscribe(topic, cb);
    },
    publishSubmittedName: function (name) {
      var n = String(name || "").trim();
      if (!n) return;
      var payload = JSON.stringify({ name: n, t: Date.now() });
      return client.publish(NAME_TOPIC, payload, { qos: 0 });
    },
  };
})();
