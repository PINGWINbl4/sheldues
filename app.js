const mqtt = require("mqtt");
const {connectMqtt} = require('./mqtt/Connection');
const {getMQTTData} = require('./data/massageController')
const EventEmitter = require('events');

const emitter = new EventEmitter();

const mqttUrl = "mqtt://hs.k-telecom.org:8883";
const mqttOptions = {
  // Clean session
  clean: true,
  connectTimeout: 1000,
  // Authentication
  clientId: process.env.MQTT_CLIENT_ID,
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
};


const mqttClient = mqtt.connect(mqttUrl, mqttOptions)
mqttClient.on("connect", () => connectMqtt(mqttClient));

mqttClient.on("message", async (topic, payload, packet) => getMQTTData(topic, payload, packet));