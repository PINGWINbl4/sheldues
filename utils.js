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
    throw new Error(`Station with ${gatewayId} gatevayId haven't sheldues`)
  }
  for (let i = 0; i < shellduesId.length; i++) {
    shelldues.push(await db.shelldue.findFirst({
      where:{
          id: shellduesId[i].shelldueId,
          active: true
      }
    }))
  }
  return shelldues
}

async function findSensorAtDB(elementId){
  return db.sensor.findFirst({
    where:{
      elementId:elementId
    },
    include:{
      settings:true
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

async function updateShelldueSuccess(shelldue){
  return await db.shelldue.update({
    where:{
      id: shelldue.id
    },
    data:{
      success: shelldue.success
    }
  })
  }


  async function writeToLog(data, code){
    try{
      const url = `http://${process.env.LOGGER_HOST || "localhost"}:${process.env.LOGGER_PORT || "5282"}/${code}` 
      const postData = {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: data
        })
      }
      await fetch(url, postData)
      .then(console.log(`${data.shelldueName} change status. Log req sended.\n User with id:${data.userId} can see it soon`))
      .catch(err => {throw new Error(err)})
    }
    catch(err){
      console.log(err)
    }
}

async function updateLastSuccess(shelldue){
    shelldue = await db.shelldue.findUnique({
      where:{
        id: shelldue.id
      }
    })
    shelldue.lastSuccess = shelldue.success
    return await db.shelldue.update({
      where:{
        id: shelldue.id
      },
      data:{
        lastSuccess: shelldue.lastSuccess
      }
    })
}

async function findShelldueById(shelldue){
  return await db.shelldue.findUnique({
    where:{
      id:shelldue.id
    }
  })
}
module.exports = {
    findUser,
    findUsersShelldue,
    findSensorAtDB,
    findShelduesOfStation,
    findStationAtDB,
    updateExeStatus,
    writeToLog,
    updateShelldueSuccess,
    updateLastSuccess,
    findShelldueById
}