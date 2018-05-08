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
  serverLog('User connected with the ID : ' + socket.id);
  socket.emit('accept', 'sajt');
  socket.on('login', nickName => {
    serverLog('With the nickname : ' + nickName);
  });
});

// Start main loop
http.listen(PORT, startMessage(serverName, PORT));
