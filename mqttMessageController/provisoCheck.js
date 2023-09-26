async function checkAllProviso(stationsShelldue, getSend, topic){
    console.log(stationsShelldue)
    const conditions = stationsShelldue.shelldueScript.conditions
    let allProviso = {
        true:0,
        false:0,
    }
    console.log(stationsShelldue.shelldueScript.actions)
    if(conditions.length){
        for (let i = 0; i < conditions.length; i++) {
            const conditionKeys = Object.keys(conditions[i])
            const checkedValueKey = await findMatchingKeys(conditionKeys, getSend)
            topic.elementId == conditions[i].sensor &&
            await compareByProviso(conditions[i][checkedValueKey], conditions[i].proviso, getSend[checkedValueKey]) ?
                allProviso.true+=1 : 
                allProviso.false+=1 
        }
        switch (stationsShelldue.shelldueScript.proviso) {
            case "one":
                return allProviso.true > 0
            case "all":
                return allProviso.false == 0
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
    //console.log(ShellduesValue, proviso, getSendValue)
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

module.exports = {
 checkAllProviso
}