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
        for (let i = 0; i < action.notification.length; i++) {
            const body = action.notification.notificationMessage[i]
            if(action.notification.executing == shelldue.executing){
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
                console.log(shelldue)
                const sensor = await utils.findSensorAtDB(set.elementId)
                const toLog = {
                        userId: shelldue.userId,
                        stationId: sensor.stationId,
                        sensorId: sensor.id,
                        shelldueId: shelldue.id,
                        sensorName: sensor.settings.name,
                        shelldueName: shelldue.name
                    }
                    shelldue.executing? utils.writeToLog(toLog, 1):utils.writeToLog(toLog, 3)//*/
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