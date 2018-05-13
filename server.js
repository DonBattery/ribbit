'use strict';

// Express APP and Socket.IO
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const PORT = (process.argv[2] || 8080);
const serverName = (process.argv[3] || 'ribbit');


// Various helpers
const path = require('path');
const logger = require('endpointz').reqLog;
const serverLog = require('endpointz').serverLog;
const startMessage = require('endpointz').startMessage;
const favicon = require('serve-favicon');

// Filesystem for picture URLs
const fs = require('fs');
const avatars = fs.readdirSync('./public/img/avatar/');

app.use(logger);

app.use(express.json());

app.use(favicon(path.join(__dirname,'public','img','favicon.ico')));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/avatars', (req, res) => {
  res.json(avatars);
});

// 404 catch-all handler (middleware)
app.use(function(req, res, next){
  res.status(404).send('404');
});

// 500 error handler (middleware)
app.use(function(err, req, res, next){
  serverLog(err.stack);
  res.status(500).send('500');
});

// Socket.IO 
io.on('connection', function(socket){
  
  socket.chatUser = {
    nickname: '',
    avatar: '',
    inchat: false
  }

  serverLog('User connected with the ID : ' + socket.id);

  socket.emit('accept', 'Socket.IO Connected');

  socket.on('nickname', nickName => {
    socket.chatUser.nickname = nickName;
  });

  socket.on('avatar', avatarImg => {
    socket.chatUser.avatar = avatarImg;
    socket.chatUser.inchat = true;
  });

  socket.on('connectedUsers', () => {
    io.sockets.emit('connectedUsers', getUsers());
  });

  socket.on('newUser', nickname => {
    socket.broadcast.emit('newUser', nickname);
  });

  socket.on('chatMessage', (msgObj) => {
    io.sockets.emit('chatMessage', msgObj);
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('connectedUsers', getUsers());
    socket.broadcast.emit('userLeft', socket.chatUser.nickname);
    serverLog(socket.chatUser.nickname + ' disconnected.');
    socket.chatUser = undefined;
  });

});

function getUsers(){
  const users = [];
  Object.keys(io.sockets.connected).forEach(function(socketID){
      const chatUser = io.sockets.connected[socketID].chatUser;
      if(chatUser && chatUser.inchat) users.push(chatUser);
  });
  return users;
}

// Start main loop
http.listen(PORT, startMessage(serverName, PORT));
