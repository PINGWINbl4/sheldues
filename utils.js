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
  let sheldues = []
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
  const shelduesId = await db.ShellduesOnStations.findMany({
    where:{
      stationId: station.id
    }
  })
  //console.log(shelduesId)
  if(!shelduesId.length){
    throw new Error(`Station with ${gatewayId} gatevayId haven't sheldues`)
  }
  for (let i = 0; i < shelduesId.length; i++) {
    console.log(i)
    sheldues.push(await db.shelldue.findUnique({
      where:{
        id: shelduesId[i].shelldueId
      }
    }))
    return sheldues
  }
}

async function findSensorAtDB(elementId){
  return db.sensor.findFirst({
    where:{
      elementId:elementId
    }
  })
}

module.exports = {
    findUser,
    findUsersShelldue,
    findSensorAtDB,
    findShelduesOfStation,
    findStationAtDB
}