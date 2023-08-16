const utils = require('../utils')
//
async function getMQTTData(topic, payload, packet){
    topic = parseTopic(topic)
    const stringPayload = payload.toString()

    try{
        getSend = JSON.parse(stringPayload);
        //const user = await utils.findUser(topic.userId)
        //const userShelldues = await utils.findUsersShelldue(topic.userId)
        const stationsShelldues = await utils.findShelduesOfStation(topic.gatewayId)
        console.log(stationsShelldues[0].shelldueScript.actions)
        for (let i = 0; i < stationsShelldues.length; i++) {
            checkAllProviso(stationsShelldues[i], getSend)
            //checkPush(stationsShelldues[i])
        }

        //console.log(stationsSheldues)
        //userShelldues.length ? console.log(userShelldues):""
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
    //let getSend = payload.toString();
    return {
    userId:getTopic[0],
    gatewayId:getTopic[1],
    sensorId:getTopic[2],
    }
}

async function checkAllProviso(stationsShelldue, getSend){
    //console.log(stationsShelldue.shelldueScript)
    const conditions = stationsShelldue.shelldueScript.conditions

    for (let i = 0; i < conditions.length; i++) {
        const conditionKeys = Object.keys(conditions[i])
        //console.log(conditionKeys)
        const checkedValueKey = await findMatchingKeys(conditionKeys, getSend)
        //console.log(checkedValueKey)
        const checkedValue = conditions[i][checkedValueKey]
        //console.log(getSend[checkedValueKey])
        console.log(compareByProviso(checkedValue, conditions[i].proviso, getSend[checkedValueKey]))
        
    }
}

/*async function checkPush(stationsShelldue, getSend){
    console.log(stationsShelldue.shelldueScript.actions)
    console.log(stationsShelldue.shelldueScript)
}*/

async function findMatchingKeys(conditionKeys, getSend){

    let matchingKeys = []
    const getSendKeys = Object.keys(getSend)
    conditionKeys.forEach(key => {
        getSendKeys.includes(key)? matchingKeys.push(key):""
    });
    //console.log(matchingKeys)
    
    return matchingKeys[0]
}

async function compareByProviso(ShellduesValue, proviso, getSendValue){
    console.log(ShellduesValue, proviso, getSendValue)
    if(typeof ShellduesValue == "undefined"){
        return false
    }
    switch (proviso) {
        case "=":
            return ShellduesValue == getSendValue
        case ">":
            return ShellduesValue > getSendValue
        case "<":
            return ShellduesValue < getSendValue
        case ">=" || "=>":
            return ShellduesValue >= getSendValue
        case "<=" || "=<":
            return ShellduesValue <= getSendValue
        case "!=":
            return ShellduesValue != getSendValue
        default:
            break;
    }
}
module.exports = {
    getMQTTData
}