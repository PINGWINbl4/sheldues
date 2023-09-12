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
        const actions = stationsShelldue.shelldueScript.actions
        
        for (let i = 0; i < actions.length; i++) {
            const action = actions[i]
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
        const body = action.notification.notificationMessage
        switch (action.notification.messageType){
            case "push":
                const title = stationsShelldue.name
                postPushMessage(user, title, body)
                break;
            case "email":
                postEmailMessage(user, body)
                break
            default:
                throw new Error(`Invalid notification action. Expected push or email. Geted ${action.notification.messageType}`);
        }
    }
}

async function doActions(action, topic){
try{
    if(Object.keys(action).includes("set")){
        for (let i = 0; i < action.set.length; i++) {
            const set = action.set[i];
            const setTopic =`${topic.userId}/${topic.gatewayId}/${set.elementId}/set`
            mqttSetter.publishAsync( setTopic , JSON.stringify(action.set.script)) 
            
        }
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