const { PrismaClient } = require('@prisma/client');
const  db = new PrismaClient();

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
    findSensorAtDB
}