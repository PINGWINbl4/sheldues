const utils = require("../utils")

async function checkAllProviso(stationsShelldue, getSend, topic){
    const conditions = stationsShelldue.shelldueScript.conditions
    let timeNow
    const currentTime = await getCurrentTime()
    if(stationsShelldue.runtimeStart) {
        if(stationsShelldue.runtimeStart >= stationsShelldue.runtimeEnd){
            const zeroTime = await getZeroTime()
            timeNow = ((stationsShelldue.runtimeStart <= currentTime) && (currentTime <= zeroTime))
            ||((zeroTime <= currentTime)&&(currentTime<=stationsShelldue.runtimeEnd))
        }
        else{
            timeNow = (stationsShelldue.runtimeStart <= currentTime) && (currentTime <= stationsShelldue.runtimeEnd)
        }
        
    }
    const anyTime = !(stationsShelldue.runtimeEnd && stationsShelldue.runtimeStart)
    if(conditions && (timeNow || anyTime) ){
        for (let i = 0; i < conditions.length; i++) {
                const conditionKeys = Object.keys(conditions[i])
                const checkedValueKey = await findMatchingKeys(conditionKeys, getSend)
                if (topic.elementId == conditions[i].sensor){
                    if(await compareByProviso(conditions[i][checkedValueKey], conditions[i].proviso, getSend[checkedValueKey])){
                        console.log("conditions correct")
                        console.log(conditions[i])
                        stationsShelldue.success[i] = true
                    }
                    else{
                        stationsShelldue.success[i] = false
                    }
                }
                await utils.updateShelldueSuccess(stationsShelldue)
        }
        let result
        switch (stationsShelldue.shelldueScript.proviso) {
            case "one":
                result = stationsShelldue.success.includes(true)
                await utils.updateExeStatus(stationsShelldue, result)
                console.log(stationsShelldue.name, result)
                return result
            case "all":
                result = !stationsShelldue.success.includes(false)
                await utils.updateExeStatus(stationsShelldue, result)
                return result
            default:
                throw new Error(`Invalid proviso. Expected one or all. Geted ${stationsShelldue.shelldueScript.proviso}`);
        }
    }
} 

async function findMatchingKeys(conditionKeys, getSend){

    let matchingKeys = []
    const getSendKeys = Object.keys(getSend)
    conditionKeys.forEach(key => {
        getSendKeys.includes(key)? matchingKeys.push(key):""
    });   
    return matchingKeys[0]
}

async function compareByProviso(ShellduesValue, proviso, getSendValue){
    if(ShellduesValue == undefined){
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
            throw new Error(`Invalid proviso. Expected =, >, <, <=, =<, >=, => or !=. Geted ${proviso}`)
            break;
    }
}

async function getCurrentTime(){
    const currentTime = new Date()
    currentTime.setFullYear(1970,0,1)
    currentTime.setHours(currentTime.getHours()+5,currentTime.getMinutes()+1,0,0)
    return currentTime
}
async function getZeroTime(){
    const currentTime = new Date()
    currentTime.setFullYear(1970,0,1)
    currentTime.setHours(0,0,0,0)
    return currentTime
}
module.exports = {
 checkAllProviso
}