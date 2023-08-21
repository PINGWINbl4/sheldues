const utils = require('../utils')
const {checkAllProviso} = require('./provisoCheck')
const {checkActions} = require('./actionController')
//
async function getMQTTData(topic, payload, packet){
    topic = parseTopic(topic)
    const stringPayload = payload.toString()

    try{
        getSend = JSON.parse(stringPayload);
        const user = await utils.findUser(topic.userId)
        const stationsShelldues = await utils.findShelduesOfStation(topic.gatewayId)
        
        for (let i = 0; i < stationsShelldues.length; i++) {         
            if(await checkAllProviso(stationsShelldues[i], getSend, topic)){
                checkActions(stationsShelldues[i], user)
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
    sensorId:getTopic[2],
    }
}

module.exports = {
    getMQTTData
}