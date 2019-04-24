const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const port = process.env.PORT

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.json())
app.use(express.static(path.join(__dirname, '../public')))

count = 0

io.on('connection', (socket) => {
    console.log("New WebSocket Connection")

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })
        if (error)
            return callback(error)
        console.log(user)

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined.`))

        io.to(user.room).emit('newData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
    })

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()
        if (filter.isProfane(message))
            return callback('!!Profanity!! is not allowed.')
        const user = getUser(socket.id)
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('sendLocation', ({ lat, long }, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, { lat, long }))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} left the room`))
            io.to(user.room).emit('newData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    // socket.emit('countUpdated', count)

    // socket.on('increment', () => {
    //     count++
    //     io.emit('countUpdated', count)
    // })
})

server.listen(port, () => {
    console.log('Listening on port', port)
})