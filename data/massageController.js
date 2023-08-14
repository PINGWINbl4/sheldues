const utils = require('../utils')

async function getMQTTData(topic, payload, packet){
    let getTopic = topic.split("/");   //  Получаем топики
    //let getSend = payload.toString();
    let userId = getTopic[0]
    let gatewayId = getTopic[1]
    let sensorId = getTopic[2]
    const stringPayload = payload.toString()
    try{
        getSend = JSON.parse(stringPayload);
        const user = await utils.findUser(userId)
        const shelldue = await utils.findUsersShelldue(userId)
        console.log(payload.toString())
        shelldue.length ? console.log(shelldue):""
    } catch(err){
        stringPayload == "online" || stringPayload == "offline" ? console.log(stringPayload) : console.log(err)
    }
}

module.exports = {
    getMQTTData
}