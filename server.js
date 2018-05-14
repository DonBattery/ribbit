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

// These HTML characters needs to be escaped
const tagsToReplace = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;'
};

// list of connected users
let users = [];

function getConnectedUsers(){
  const connectedUsers = [];
  Object.keys(io.sockets.connected).forEach(function(socketID){
      const chatUser = io.sockets.connected[socketID].chatUser;
      if(chatUser && chatUser.inchat) connectedUsers.push(chatUser);
  });
  return connectedUsers;
}

function isNickTaken(nickname) {
  let taken = false;
  users.forEach(user => {
    if (user.nickname === nickname) {
      taken = true;
    }
  });
  if (nickname === 'ribbit-Bot') {
    taken = true;
  }
  return taken;
}

function removeUser(id) {
  users = users.filter( user => {
    return user.id !== id;
  });  
}

function replaceTag(tag) {
  return tagsToReplace[tag] || tag;
}

function safeString(str) {
  return str.replace(/[&<>]/g, replaceTag);
}

app.use(logger);

app.use(express.json());

app.use(favicon(path.join(__dirname,'public','img','favicon.ico')));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/avatars', (req, res) => {
  res.json(avatars);
});

app.get('/checknick/:newnick', (req, res) => {
  res.send((isNickTaken(req.params.newnick)) ? 'taken' : 'free');
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
    id: socket.id,
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
    users.push(socket.chatUser);
  });
  
  socket.on('connectedUsers', () => {
    io.sockets.emit('connectedUsers', getConnectedUsers());
  });
  
  socket.on('newUser', nickname => {
    socket.broadcast.emit('newUser', nickname);
  });
  
  socket.on('chatMessage', (msgObj) => {
    msgObj.message = safeString(msgObj.message);
    io.sockets.emit('chatMessage', msgObj);
  });
  
  socket.on('disconnect', () => {
    socket.broadcast.emit('connectedUsers', getConnectedUsers());
    if (socket.chatUser.inchat) {
      socket.broadcast.emit('userLeft', socket.chatUser.nickname);
      serverLog(socket.chatUser.nickname + ' disconnected.');
    }
    removeUser(socket.id);
    socket.chatUser = undefined;
  });
  
});

// Start main loop
http.listen(PORT, startMessage(serverName, PORT));
