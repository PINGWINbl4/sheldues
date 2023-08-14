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

module.exports = {
    findUser,
    findUsersShelldue
}