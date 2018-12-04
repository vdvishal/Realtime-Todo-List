const socketio = require('socket.io');
const mongoose = require('mongoose');
const shortid = require('shortid');
const logger = require('./loggerLib.js');
const events = require('events');
const tokenLib = require("./tokenLib.js");
const redis = require("./redis.js")
const check = require('../libs/checkLib')
const reqmodel = require("./../models/FriendReq.js")
const eventEmitter = new events.EventEmitter();
const reqModel = mongoose.model('Req')

const setServer = (server) => {
    let io = socketio.listen(server);

    let myIo = io.of('/')

    myIo.on('connection', (socket) => {  
        socket.on('set-user',(authToken) => {
          
            tokenLib.verifyToken(authToken,(err,user)=>{
                if(err){
                    socket.emit('auth-error', { status: 500, error: 'Please provide correct auth token' })
                }
                else{
                    let currentUser = user.data;
                    socket.userId = currentUser.userId
                    let fullName = `${currentUser.firstName} ${currentUser.lastName}`
         
                    redis.appendOnlineUser('onlineUsers',socket.userId,fullName,(err,result) => {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            redis.getOnlineUsers('onlineUsers',(err,result)=> {
                                socket.room = 'allusers'
                                socket.join(socket.room)
                                socket.to(socket.room).broadcast.emit('online-user-list',result);
                            })
                        }
                    })

                }
            })
        })

        socket.on('add-user',(userInfo) =>{

            myIo.emit(userInfo.recieverId,userInfo)

            eventEmitter.emit('friendReq',userInfo)
        })
        
        socket.on('accept-notify',data =>{
            myIo.emit(`${data.senderId}__`,data.localuser)

            
        })

        socket.on('add-event-notify',data => {
            socket.to('allusers').broadcast.emit('create-event',data);
        })

        socket.on('edit-event-notify',data => {
            socket.to('allusers').broadcast.emit('edit-event',data);
        })

        socket.on('add-subevent-notify',data => {
            socket.to('allusers').broadcast.emit('add-sub-event',data);
        })

        socket.on('edit-subevent-notify',data => {
            socket.to('allusers').broadcast.emit('edit-sub-event',data);
        })

        socket.on('delete-event-notify',data => {
            socket.to('allusers').broadcast.emit('delete-event',data);
        })

        socket.on('delete-subevent-notify',data => {
            socket.to('allusers').broadcast.emit('delete-sub-event',data);
        })

        

        socket.on('disconnect', () => {
            if (socket.userId) {
                redis.removeOnlineUser('onlineUsers', socket.userId)
                redis.getOnlineUsers('onlineUsers', (err, result) => {
                    if (err) {
                        console.log(err)
                    } else {
                        socket.leave(socket.room)
                        socket.to(socket.room).broadcast.emit('online-user-list', result);
                    }
                })
            }
        })

    })

    
}

eventEmitter.on('friendReq', data => {
    reqModel.find({recieverId:data.recieverId,senderId: data.userId}).exec((err,result) => {
        if (err){
            logger.error(err.message,'socketLib.js:eventemitter',10)
            return null
        }
        else if (check.isEmpty(result)) {
            let newReq = new reqModel({
                recieverId: data.recieverId,
                senderId: data.userId,
                firstName:data.firstName,
                lastName:data.lastName
            })
        
            newReq.save((err,req) => {
                if(err) {
                    console.log(`error occurred: ${err}`);
                }
                else {
                    console.log("req Saved.");
                }
            })
        }
        else {
            let info = logger.info('Friend rer already sent',null, null)
            return info;
        }
    })

})





module.exports = {
    setServer: setServer
}