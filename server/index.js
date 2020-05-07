const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors =  require('cors');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users.js');

const router = require('./router');

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(router);
app.use(cors());

io.on('connection', (socket) => {
    socket.on('join', ({name, room}, callback) => {
        const {error, user} = addUser({id: socket.id, name: name, room: room});
        if (error) {
            return callback(error);
        }

        socket.emit('message', {user: 'admin', text: `${name} welcome in ${room}`});
        socket.broadcast.to(room).emit('message', {user: 'admin', text: `${name} has joined`});
        socket.join(room);

        const usersInRoom = getUsersInRoom(room);
        console.log('usersInRoom:', usersInRoom);
        io.to(room).emit('roomData', {room: room, users: usersInRoom});
        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', {user: 'admin', text: `${user.name} has left`});
            io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)});
        }
        console.log('User left');
    });

    socket.on('sendMessage', (message, callback) => {
        console.log('socket.id', socket.id);
        const user = getUser(socket.id);
        io.to(user.room).emit('message', {user: user.name, text: message});
        callback();
    });
});

server.listen(PORT, () => {
    console.log(`Server has started on port ${PORT}`);
});