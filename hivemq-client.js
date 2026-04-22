/**
 * Shared MQTT (HiveMQ) for mobile + desktop pages.
 * Cross-device traffic uses the broker only — no local /api or other app backend.
 * Names: publish/subscribe BLACKOUT_MQTT_NAME_TOPIC (default blackout/reboot/names).
 * Build markers: topic BLACKOUT_BUILD_TOPIC (default blackout/reboot/build).
 * Station list + repair: BLACKOUT_STATIONS_TOPIC, BLACKOUT_REPAIR_TOPIC.
 *
 * If `mqtt-config.js` sets `window.BLACKOUT_MQTT_CONFIG`, non-empty fields override these
 * defaults (same broker/credentials as MQtest.html).
 */
(function () {
  function emitMqttStatus(state, message, defer) {
    if (typeof window === "undefined") return;
    function fire() {
      try {
        window.dispatchEvent(
          new CustomEvent("blackout-mqtt-status", {
            detail: { state: state, message: message || "" },
          })
        );
      } catch (e) {}
    }
    if (defer && typeof queueMicrotask === "function") {
      queueMicrotask(fire);
    } else if (defer) {
      setTimeout(fire, 0);
    } else {
      fire();
    }
  }

  var DEFAULT_BLACKOUT_MQTT_CONFIG = {
    host: "2ec7c29478854652aefa31c92c09f792.s1.eu.hivemq.cloud",
    wsPort: 8884,
    wsPath: "/mqtt",
    username: "test2",
    password: "Aa123456",
    clientId: "",
    nameTopic: "blackout/reboot/names",
    buildTopic: "blackout/reboot/build",
    stationsTopic: "blackout/reboot/stations",
    repairTopic: "blackout/reboot/repair",
  };

  function mergeMqttConfig() {
    var raw =
      typeof window !== "undefined" && window.BLACKOUT_MQTT_CONFIG
        ? window.BLACKOUT_MQTT_CONFIG
        : {};
    var cfg = {};
    var k;
    for (k in DEFAULT_BLACKOUT_MQTT_CONFIG) {
      var rv = raw[k];
      cfg[k] =
        rv != null && rv !== ""
          ? rv
          : DEFAULT_BLACKOUT_MQTT_CONFIG[k];
    }
    return cfg;
  }

  var cfg = mergeMqttConfig();
  var NAME_TOPIC = cfg.nameTopic || "blackout/reboot/names";
  var BUILD_TOPIC = cfg.buildTopic || "blackout/reboot/build";
  var STATIONS_TOPIC = cfg.stationsTopic || "blackout/reboot/stations";
  var REPAIR_TOPIC = cfg.repairTopic || "blackout/reboot/repair";
  if (typeof window !== "undefined") {
    window.BLACKOUT_MQTT_NAME_TOPIC = NAME_TOPIC;
    window.BLACKOUT_BUILD_TOPIC = BUILD_TOPIC;
    window.BLACKOUT_STATIONS_TOPIC = STATIONS_TOPIC;
    window.BLACKOUT_REPAIR_TOPIC = REPAIR_TOPIC;
  }

  function attachStub() {
    window.BlackoutMQTT = {
      connected: false,
      client: null,
      publish: function (topic, message, opts, cb) {
        if (typeof opts === "function") {
          cb = opts;
          opts = {};
        }
        if (typeof cb === "function") {
          setTimeout(function () {
            cb(new Error("MQTT unavailable"));
          }, 0);
        }
      },
      subscribe: function () {},
      unsubscribe: function () {},
      publishSubmittedName: function () {},
    };
  }

  if (typeof mqtt === "undefined") {
    console.warn("[Blackout MQTT] mqtt.js not loaded; skip HiveMQ connect.");
    emitMqttStatus("unavailable", "mqtt.js not loaded", true);
    attachStub();
    return;
  }

  if (!cfg.host || !cfg.username || !cfg.password) {
    console.warn(
      "[Blackout MQTT] Missing host, username, or password after merge; skip connect."
    );
    emitMqttStatus("unavailable", "Missing host, username, or password", true);
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

  emitMqttStatus("connecting", "", true);

  var client = mqtt.connect(url, {
    username: cfg.username,
    password: cfg.password,
    clientId: clientId,
    clean: true,
    reconnectPeriod: 5000,
    keepalive: 60,
    connectTimeout: 30 * 1000,
  });

  var connected = false;

  client.on("connect", function () {
    connected = true;
    console.log("[Blackout MQTT] connected:", url);
    emitMqttStatus("connected");
    window.dispatchEvent(
      new CustomEvent("blackout-mqtt-connect", { detail: { client: client } })
    );
  });

  client.on("reconnect", function () {
    console.log("[Blackout MQTT] reconnecting…");
    emitMqttStatus("connecting");
  });

  client.on("close", function () {
    connected = false;
    console.log("[Blackout MQTT] disconnected");
    emitMqttStatus("disconnected");
  });

  client.on("error", function (err) {
    console.error("[Blackout MQTT] error:", err);
    emitMqttStatus(
      "error",
      err && err.message ? err.message : String(err)
    );
  });

  window.BlackoutMQTT = {
    client: client,
    get connected() {
      return connected && client.connected;
    },
    publish: function (topic, message, opts, cb) {
      var o = opts;
      if (typeof o === "function") {
        cb = o;
        o = {};
      }
      o = o || {};
      if (typeof cb === "function") {
        return client.publish(topic, message, o, cb);
      }
      return client.publish(topic, message, o);
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
