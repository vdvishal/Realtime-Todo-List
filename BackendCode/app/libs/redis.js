 const check = require("./checkLib.js")
 const redis  = require('redis');
 const client = redis.createClient({
   url  : 'redis://redis-19144.c62.us-east-1-4.ec2.cloud.redislabs.com:19144',
   password  : 'vishal12345'
  
  });

   client.get('welcome',function(err,welcomeMessage) {
     if (err) throw err;
     console.log(welcomeMessage);
   })

   let getOnlineUsers = (hash,cb) => {
        client.HGETALL(hash,(err,result)=> {
            console.log("users from "+ hash);
            if (err) {
                console.log(err);
                cb(err,null)
            }
            else if(check.isEmpty(result)) {
                console.log("No online users");
                cb(null,result)
            }
            else {
                console.log(result);
                cb(null,result)                
            }
        })
   }

   let appendOnlineUser = (hash,key,value,cb) => {
       client.HMSET(hash,key,value,(err,result)=>{
            if (err) {
                console.log(err);
                cb(err,null)
            } else {
                console.log(result);
                cb(null,result)                
            }
       })
   }

   let removeOnlineUser = (hash,key) => {
       client.HDEL(hash,key)
       return true;
   }

   let addFriends = (hash,key,value,cb) => {
        client.HDEL(hash,"undefined")
        client.HMSET(hash,key,value,(err,result)=> {
            if(err) {
                console.log(err);

            }
            else{
                console.log("Friend Added");
                client.HGETALL(hash,(err,result) => {
                    console.log("users from "+ hash);
                    if (err) {
                        console.log(err);
                    }
                    else if(check.isEmpty(result)) {
                        console.log("No online users");
                    }
                    else {
                        console.log(result);              
                    }
                })
            }
        })
   }

   let userFriends = (hash,cb) => {
       console.log(hash+"of user");
       client.HGETALL(hash,(err,result)=>{
        console.log("users from userFriends fnx "+ hash);
        if (err) {
            console.log(err);
            cb(err,null)
        }
        else if(check.isEmpty(result)) {
            console.log("No friends of user");
            cb(null,result)
        }
        else {
            console.log("friends of user");
            console.log(result);
            cb(null,result)          
        }
       })
   }

   let checkFriend = (hash,key,cb)=> {
       client.HGET(hash,key,(err,result)=> {
           if(err){
               console.log(err);
           }
           else {
               console.log("friend found");
               cb(null,result)
           }
       })
   }


module.exports = {
    getOnlineUsers:getOnlineUsers,
    appendOnlineUser:appendOnlineUser,
    removeOnlineUser:removeOnlineUser,
    addFriends:addFriends,
    userFriends:userFriends,
    checkFriend:checkFriend
}
