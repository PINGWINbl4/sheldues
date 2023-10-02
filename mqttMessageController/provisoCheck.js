const utils = require("../utils")

async function checkAllProviso(stationsShelldue, getSend, topic){
    const conditions = stationsShelldue.shelldueScript.conditions
    let timeNow
    stationsShelldue.runtimeStart? timeNow = (stationsShelldue.runtimeStart <= await getCurrentTime()) && (await getCurrentTime() <= stationsShelldue.runtimeEnd): timeNow = false
    const anyTime = !(stationsShelldue.runtimeEnd && stationsShelldue.runtimeStart)
    if(conditions && (timeNow || anyTime)){
        console.log(timeNow, anyTime, stationsShelldue.id)
        console.log("Time correct. Start check conditions")
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
                    utils.updateShelldueSuccess(stationsShelldue)
            }
        }
        console.log(stationsShelldue.success)
        let result
        switch (stationsShelldue.shelldueScript.proviso) {
            case "one":
                result = stationsShelldue.success.includes(true)
                result? utils.updateExeStatus(stationsShelldue, true) : utils.updateExeStatus(stationsShelldue, false)
                return result
            case "all":
                result = !stationsShelldue.success.includes(false)
                result? utils.updateExeStatus(stationsShelldue, true) : utils.updateExeStatus(stationsShelldue, false)
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
    //console.log(matchingKeys)
    
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
    currentTime.setSeconds(0)
    currentTime.setMilliseconds(0)
    currentTime.setFullYear(1970)
    currentTime.setMonth(0)
    currentTime.setDate(1)
    currentTime.setHours(currentTime.getHours()+5)
    currentTime.setMinutes(currentTime.getMinutes()+1)
    return currentTime
}

module.exports = {
 checkAllProviso
}