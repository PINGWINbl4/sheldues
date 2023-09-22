const utils = require('../utils')
const {checkAllProviso} = require('./provisoCheck')
const {checkActions,
        doActions} = require('./actionController')
const { warnEnvConflicts } = require('@prisma/client/runtime/library')

async function getMQTTData(topic, payload, packet){
    topic = parseTopic(topic)
    const stringPayload = payload.toString()

    try{
        getSend = JSON.parse(stringPayload);
        const user = await utils.findUser(topic.userId)
        const stationsShelldues = await utils.findShelduesOfStation(topic.gatewayId)
        const station = await utils.findStationAtDB(topic.gatewayId)
        if(user.id != station.userId){
            throw new Error('Not your gateway')
        }
        for (let i = 0; i < stationsShelldues.length; i++) {         
            if(await checkAllProviso(stationsShelldues[i], getSend, topic) && stationsShelldues[i].active){
                checkActions(stationsShelldues[i], user, topic)
                const sensor = await utils.findSensorAtDB(topic.elementId)
                const toLog = {
                    userId: topic.userId,
                    stationId: station.id,
                    sensorId: sensor.id
                }
                utils.writeToLog(toLog,1)
            }
        }

    }

    catch(err){
        if(stringPayload == "online" || stringPayload == "offline"){
            console.log(`${topic.gatewayId} was ${stringPayload} at ${new Date()}`)
        } 
        else{
            console.log(err)
        }
    }
}


//========================================================================
function parseTopic(topic){
    let getTopic = topic.split("/");   //  Получаем топики
    return {
    userId:getTopic[0],
    gatewayId:getTopic[1],
    elementId:getTopic[2],
    }
}

module.exports = {
    getMQTTData
}