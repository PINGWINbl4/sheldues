const utils = require('../utils')

async function getMQTTData(topic, payload, packet){
    topic = parseTopic(topic)
    const stringPayload = payload.toString()

    try{
        getSend = JSON.parse(stringPayload);
        const user = await utils.findUser(topic.userId)
        const userShelldues = await utils.findUsersShelldue(topic.userId)
        const stationsSheldues = await utils.findShelduesOfStation(topic.gatewayId)

        console.log(stationsSheldues)
        userShelldues.length ? console.log(userShelldues):""
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

function parseTopic(topic){
    let getTopic = topic.split("/");   //  Получаем топики
    //let getSend = payload.toString();
    return {
    userId:getTopic[0],
    gatewayId:getTopic[1],
    sensorId:getTopic[2],
    }
}
module.exports = {
    getMQTTData
}