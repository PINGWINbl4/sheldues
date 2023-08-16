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

async function findShelduesOfStation(gatewayId){
  let sheldues = []
  if(ignoredStations.includes(gatewayId)){
    return 0
  }
  const station = await db.station.findFirst({
    where:{
      gatewayId:gatewayId
    }
  })
  if(!station){
    ignoredStations.push(gatewayId)
    throw new Error("Can't find station in db with this gatewayId")
  }
  const shelduesId = await db.ShellduesOnStations.findMany({
    where:{
      stationId: station.id
    }
  })
  if(!shelduesId.length){
    throw new Error("Station with this gatewayId haven't sheldues")
  }
  for (let i = 0; i < shelduesId.length; i++) {
    sheldues.push(await db.shelldue.findUnique({
      where:{
        id: shelduesId[i].shelldueId
      }
    }))
    return sheldues
  }
}

async function findSensorAtDB(sensorId){
  return db.sensor.findUnique({
    where:{
      id:sensorId
    }
  })
}

module.exports = {
    findUser,
    findUsersShelldue,
    findSensorAtDB,
    findShelduesOfStation
}