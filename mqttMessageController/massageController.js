const utils = require('../utils')
const {checkAllProviso} = require('./provisoCheck')
const {checkActions,
        doActions} = require('./actionController')

async function getMQTTData(topic, payload){
    
    const stringPayload = payload.toString()
    try{
        topic = parseTopic(topic)
        getSend = JSON.parse(stringPayload);
        const user = await utils.findUser(topic.userId)
        const stationsShelldues = await utils.findShelduesOfStation(topic.gatewayId)
        const station = await utils.findStationAtDB(topic.gatewayId)
        if(user.id != station.userId){
            throw new Error('Not your gateway')
        }
        for (let i = 0; i < stationsShelldues.length; i++) { 
            console.log(stationsShelldues[i].executing)
            if((await checkAllProviso(stationsShelldues[i], getSend, topic)||stationsShelldues[i].executing) && stationsShelldues[i].active ){
                console.log("start do action")
                await checkActions(stationsShelldues[i], user, topic)
                utils.updateLastSuccess(stationsShelldues[i])
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