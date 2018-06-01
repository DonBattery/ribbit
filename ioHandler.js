'use strict';

let logger = console.log;

const sqliteConn = require('./msgLogger');

const msgLogger = new sqliteConn.db('./secret/message.db');

msgLogger.createConn();

// These HTML characters needs to be escaped
const tagsToReplace = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;'
};

function replaceTag(tag) {
  return tagsToReplace[tag] || tag;
}

function safeString(str) {
  return str.replace(/[&<>]/g, replaceTag).substring(0,255);
}

function handler(io) {
  
  function getUsers(inChat = false){
    const userList = [];
    Object.keys(io.sockets.connected).forEach(function(socketID){
      const chatUser = io.sockets.connected[socketID].chatUser;
      if ((inChat && chatUser.inchat) || !inChat) {
        userList.push(chatUser)
      }
    });
    return userList;
  }
  
  function nickTaken(nickname) {
    let taken = false;
    getUsers().forEach(user => {
      if (user.nickname === nickname) {
        taken = true;
      }
    });
    if (nickname === 'ribbit-Bot') {
      taken = true;
    }
    return taken;
  }

  function nickLong(nickname) {
    return (nickname.length > 18);
  }
  
  io.on('connection', (socket) =>{ 
    
    socket.chatUser = {
      nickname: '',
      avatar: '',
      inchat: false
    }
    
    msgLogger.query((rows) => {
      socket.emit('prevMsgs', rows);
    }, logger);

    logger('IO - new User connected with the ID : ' + socket.id);
    
    socket.on('trynick', nickName => {
      nickName = safeString(nickName);
      if (nickTaken(nickName)) {
        socket.emit('trynick', {
          available: false, taken: true
        });
      } else if (nickLong(nickName)) {
        socket.emit('trynick', {
          available: false, long: true
        });
      } else {
        socket.chatUser.nickname = nickName;
        socket.emit('trynick', {
          available: true, nickname: nickName
        });
      }
    });
    
    socket.on('avatar', avatarImg => {
      socket.chatUser.avatar = avatarImg;
      socket.chatUser.inchat = true;
    });
    
    socket.on('connectedUsers', () => {
      io.sockets.emit('connectedUsers', getUsers(true));
    });
    
    socket.on('newUser', msg => {
      socket.broadcast.emit('newUser', socket.chatUser.nickname);
    });
    
    socket.on('chatMessage', (msgObj) => {
      msgObj.message = safeString(msgObj.message);
      msgObj.id = socket.id;
      msgLogger.newMessage(msgObj, logger, logger);
      io.sockets.emit('chatMessage', msgObj);
    });
    
    socket.on('disconnect', () => {
      socket.broadcast.emit('connectedUsers', getUsers(true));
      if (socket.chatUser.inchat) {
        socket.broadcast.emit('userLeft', socket.chatUser.nickname);
      }
      logger('IO - User disconnected with the ID : ' + socket.id);
      socket.chatUser = undefined;      
    });  
  });
}

function setLogger(newLogger) {
  logger = newLogger;
}

module.exports = {
  handler,
  setLogger
};