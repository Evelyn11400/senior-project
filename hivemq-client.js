/**
 * Shared MQTT (HiveMQ) for mobile + desktop pages.
 * After connect: window.BlackoutMQTT = { client, connected, publish, subscribe, ... }
 */
(function () {
  var cfg = typeof window !== "undefined" ? window.BLACKOUT_MQTT_CONFIG : null;
  if (!cfg || typeof mqtt === "undefined") {
    if (typeof mqtt === "undefined") {
      console.warn("[Blackout MQTT] mqtt.js not loaded; skip HiveMQ connect.");
    }
    return;
  }

  if (!cfg.username || !cfg.password) {
    console.warn(
      "[Blackout MQTT] Set username and password in mqtt-config.js (HiveMQ Cloud → Access Management)."
    );
    window.BlackoutMQTT = {
      connected: false,
      client: null,
      publish: function () {},
      subscribe: function () {},
    };
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
  };
})();
