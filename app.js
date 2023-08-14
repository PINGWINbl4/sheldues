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
  clientId: "scenarions",
  username: process.env.MQTT_USERNAME,
  password: "MQTTpassword1!",
};


const mqttClient = mqtt.connect(mqttUrl, mqttOptions)
mqttClient.on("connect", function (){
    connectMqtt(mqttClient)
});

mqttClient.on("message", async function (topic, payload, packet) {
    // Payload is Buffer
    getMQTTData(topic, payload, packet)

  });