const mqtt = require("mqtt");

async function createMQTTClient(mqttUrl, mqttOptions){
   var mqttClient =await mqtt.connect(mqttUrl, mqttOptions)
} 

async function connectMqtt(mqttClient) {
    if (mqttClient.connected) {
        console.log("conected")  
        mqttClient.subscribe("$share/shelldueQueue/+/+/+");
      } else {
        console.log("disconeted");
      } 
  }

module.exports = {
    createMQTTClient,
    connectMqtt
}