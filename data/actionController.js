const { postEmailMessage,
        postPushMessage  } = require('./notifications')
const mqtt = require("mqtt");

const mqttUrl = "mqtt://hs.k-telecom.org:8883";
const mqttOptions = {
  // Clean session
  clean: true,
  connectTimeout: 1000,
  // Authentication
  clientId: `${process.env.MQTT_CLIENT_ID}setter`,
  username: process.env.MQTT_USERNAME,
  password:  process.env.MQTT_PASSWORD,
};


const mqttSetter = mqtt.connect(mqttUrl, mqttOptions)

async function checkActions(stationsShelldue, user, topic){
    try{
        //console.log(stationsShelldue)
        const actions = stationsShelldue.shelldueScript.actions
        
        for (let i = 0; i < actions.length; i++) {
            const action = actions[i]
            console.log(topic.gatewayId)
            notificationCheck(action, stationsShelldue, user)
            doActions(action, topic)
        }    
    }
    catch(err){
        console.log(err)
    }
}

async function notificationCheck(action, stationsShelldue, user){
    if(Object.keys(action).includes("notification")){
        //console.log(actions[i].notification)
        const body = action.notification.notificationMessage
        switch (action.notification.messageType){
            case "push":
                const title = stationsShelldue.name
                //postPushMessage(user, title, body)
                break;
            case "email":
                //console.log(user)
                //postEmailMessage(user, body)
                break
            default:
                throw new Error(`Invalid notification action. Expected push or email. Geted ${actions[i].notification.messageType}`);
        }
    }
}

async function doActions(action, topic){
try{
    if(Object.keys(action).includes("set")){
        //const actionSensor = action.set.sensorId
        //console.log(test)
        const setTopic =`${topic.userId}/${topic.gatewayId}/${action.set.sensorId}/set`
        mqttSetter.publishAsync( setTopic , JSON.stringify(action.set.script))
        console.log(setTopic)
        console.log(action.set.script) 
    }
}
catch(err){
    console.log(err)
}
}

module.exports = {
    checkActions,
    doActions
}