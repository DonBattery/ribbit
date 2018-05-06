'use strict';

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

// const cors = require('cors');
const path = require('path');
const logger = require('endpointz').reqLog;
const serverLog = require('endpointz').serverLog;
const startMessage = require('endpointz').startMessage;
const favicon = require('serve-favicon');

const PORT = (process.argv[2] || 8080);
const serverName = (process.argv[3] || 'ribbit');

app.use(logger);

// app.use(cors());

app.use(express.json());

app.use(favicon(path.join(__dirname,'public','img','favicon.ico')));

app.use(express.static(path.join(__dirname, 'public')));

// 404 catch-all handler (middleware)
app.use(function(req, res, next){
  res.status(404).render('404');
});

// 500 error handler (middleware)
app.use(function(err, req, res, next){
  serverLog(err.stack);
  res.status(500).render('500');
});

// Socket.IO 
io.on('connection', function(socket){
  serverLog('User connected with the ID : ' + socket.id);
  socket.on('login', nickName => {
    serverLog('With the nickname : ' + nickName);
  });
});

// Start main loop
http.listen(PORT, startMessage(serverName, PORT));
