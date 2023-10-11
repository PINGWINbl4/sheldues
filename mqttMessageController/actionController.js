const { postEmailMessage,
        postPushMessage  } = require('./notifications')
const mqtt = require("mqtt");
const {checkAllProviso} = require('./provisoCheck')
const utils = require('../utils')
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
        let sameState = true
        console.log(`состояния ${stationsShelldue.success[0]} ${stationsShelldue.lastSuccess[0]}`)
        for (let i = 0; i < stationsShelldue.success.length; i++) {
            stationsShelldue.success[i] != stationsShelldue.lastSuccess[i] ? sameState=false:""
        }
        if(!sameState){
            stationsShelldue = await utils.findShelldueById(stationsShelldue)
            await notificationCheck(actions, stationsShelldue, user)
            await doActions(actions, stationsShelldue, topic)
            utils.updateLastSuccess(stationsShelldue)
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

async function doActions(action, shelldue, topic){
try{
    if(Object.keys(action).includes("set")){
        for (let i = 0; i < action.set.length; i++) {
            const set = action.set[i];
            const setTopic =`${topic.userId}/${topic.gatewayId}/${set.elementId}/set`
            if(set.executing == shelldue.executing){
                mqttSetter.publishAsync(setTopic, JSON.stringify(set))
            } 
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