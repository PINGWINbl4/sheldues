const { PrismaClient } = require('@prisma/client');
const  db = new PrismaClient();
var ignoredStations = []
async function findUser(userId){
    return db.user.findUnique({
        where:{
          id: userId
        } 
      })
}

async function findUsersShelldue(userId){
    return db.shelldue.findMany({
        where:{
          userId: userId
        },
      include:{
        stations:true
      }    
      })
}
async function findStationAtDB(gatewayId){
  return await db.station.findFirst({
    where:{
      gatewayId:gatewayId
    }
  })
}
async function findShelduesOfStation(gatewayId){
  let shelldues = []
  if(ignoredStations.includes(gatewayId)){
    throw new Error(`${gatewayId} into banList`)
  }
  const station = await db.station.findFirst({
    where:{
      gatewayId:gatewayId
    }
  })
  if(!station){
    ignoredStations.push(gatewayId)
    throw new Error(`Can't find station in db with gatewayId ${gatewayId}`)
  }
  const shellduesId = await db.ShellduesOnStations.findMany({
    where:{
      stationId: station.id
    }
  })
  if(!shellduesId.length){
    throw new Error(`Station with ${gatewayId} gatevayId haven't condition sheldues`)
  }
  for (let i = 0; i < shellduesId.length; i++) {
    shelldues.push(await db.shelldue.findUnique({
      where:{
        id: shellduesId[i].shelldueId,
        shelldueType: "condition"
      }
    }))
  }
  return shelldues
}

async function findSensorAtDB(elementId){
  return db.sensor.findFirst({
    where:{
      elementId:elementId
    }
  })
}

async function updateExeStatus(shelldue, status){
  return db.shelldue.update({
    where:{
      id: shelldue.id
    },
    data:{
      executing: status
    }
  })
}

async function writeToLog(data, code){

  const logCode = await db.EventCode.findUnique({
      where:{
          code: code
      }
  })

  data.codeId = logCode.id
  const eLog = await db.EventLog.create({
      data:data
  })
  return eLog
}

module.exports = {
    findUser,
    findUsersShelldue,
    findSensorAtDB,
    findShelduesOfStation,
    findStationAtDB,
    updateExeStatus,
    writeToLog
}