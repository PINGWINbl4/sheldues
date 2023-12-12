const express = require('express');
const mqtt = require("mqtt");
const {connectMqtt} = require('./mqttConnection/Connection');
const {getMQTTData} = require('./mqttMessageController/massageController')

const EventEmitter = require('events');
const emitter = new EventEmitter();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const mqttUrl = "mqtt://hs.k-telecom.org:8883";
const mqttOptions = {
  // Clean session
  clean: true,
  connectTimeout: 1000,
  // Authentication
  clientId: Math.random(),
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
};


const mqttClient = mqtt.connect(mqttUrl, mqttOptions)
mqttClient.on("connect", () => connectMqtt(mqttClient));

mqttClient.on("message", async (topic, payload, packet) => getMQTTData(topic, payload, packet));

app.post("/", async (req, res, next)=>{
  console.log(req.body)
  mqttClient.publishAsync( req.body.topic , JSON.stringify(req.body.shelldueScript))
  res.json("done")
})

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    status: err.status || 500,
    message: err.message,
  });
});

const PORT = process.env.APP_PORT || 5050;
const HOST = process.env.APP_HOST || "localhost"
app.listen(PORT, HOST, () => console.log(`🚀 @ http://${HOST}:${PORT}`));