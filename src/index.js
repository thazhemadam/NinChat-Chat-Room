const app = require('./app')

const http = require('http')
const socketio = require('socket.io')
const server = http.createServer(app)
const io = socketio(server) 
const Filter = require('bad-words')
const { generateMessage } = require('./utils/messages')
const { generateLocationMessage } = require('../src/utils/messages.js')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')


const port = process.env.PORT

//io.emit: Emit to everyone
//socket.emit: Emit to only the last connected client
//socket.broadcast.emit: Emit to all clients except for the client last connected
io.on('connection',(socket)=>{
    console.log('New WebSocket connection!')

    //socket.id is available to all the functions defined in this scope.
    socket.on('join',({username, room}, callback)=>{
        
        //Since addUser returns an "error", and "user" object respectively.
        const {error, newUser} = addUser({ id: socket.id, username, room })

        
        if(error){
            return callback(error)
        }

        console.log('Successfully logged in.')
        socket.join(newUser.room)

    
        socket.emit('message',generateMessage(`Welcome ${newUser.username}`),'Server')   
        socket.broadcast.to(newUser.room).emit('message',generateMessage(`${newUser.username} has joined!`),'Server')  

        io.to(newUser.room).emit('roomData',{
                roomName: newUser.room,
                usersInRoom: getUsersInRoom(newUser.room)
        })

        callback()  //Represents no error in logging in
    })

    socket.on('sendMessage',(message, callback)=>{
        const filter = new Filter()

        if(filter.isProfane(message)){
            return callback('Profanity is not allowed.')
        }

        const { username, room } = getUser(socket.id)
        if(username === undefined || room === undefined){
            return callback('Not recognized')
        }
        io.to(room).emit('message',generateMessage(message),username)
        callback()
    })

    socket.on('sendLocation', (location, callback)=>{
        const { username, room } = getUser(socket.id)
        io.to(room).emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${location.latitude},${location.longitude})`), username)
        callback()
    })

    socket.on('disconnect',()=>{

        const removedUser = removeUser(socket.id)
        if(removedUser){
            io.to(removedUser.room).emit('message',generateMessage(`${removedUser.username} has left.`),'Server')
            io.to(removedUser.room).emit('roomData',{
                roomName: removedUser.room,
                usersInRoom: getUsersInRoom(removedUser.room)
            })
        }
    })
})


server.listen(port, ()=>{
    
    console.log(`Server is up on Port ${port}`)
})