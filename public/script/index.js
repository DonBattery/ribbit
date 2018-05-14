'use strict';

const socket = io();

function selectAvatar(avatarImg) {
  socket.chatUser.avatar = avatarImg;
  socket.chatUser.inchat = true;
  socket.emit('avatar', avatarImg);
  $('#avatarWrapper').hide();
  $('#topHeader').hide();
  $('#chatWrapper').show();
  socket.emit('connectedUsers', '');  
  socket.emit('newUser', socket.chatUser.nickname);
}

function loadAvatars() {
  $.get('/avatars', (list) => {
    list.forEach(element => {
      let img = $('<img />', { 
        id: element,
        src: 'img/avatar/' + element
      });
      img.on('click', () => {
        selectAvatar(element);
      });
      img.appendTo($('#avatarSelector'));
    });
  });
}

function newMessage(msgObj) {
  const chatMessages = $('#chatMessages');
  const chatBox = $('#chatBox');
  let listItem = $('<li></li>');
  let infoAvatar = $('<img />', {
    src: msgObj.avatar,
    class: "infoAvatar"
  });
  let infoNickname = $(`<div class="infoNickname">${msgObj.nickname}:</div>`);
  let message = $(`<div class="chatMessage">${msgObj.message}</div>`);
  infoAvatar.appendTo(listItem);
  infoNickname.appendTo(listItem);
  message.appendTo(listItem);
  listItem.appendTo(chatMessages);
  chatBox.scrollTop(chatBox.prop("scrollHeight"));
}

$(function () {

  socket.chatUser = {
    nickname: '',
    avatar: '',
    inchat: false
  }  

  // Socket.IO and Test
  socket.on('accept', (msg) => {
    console.log(msg);
  });
  
  socket.on('connectedUsers', users => {
    const chatUsers = $('#chatUsers');
    chatUsers.html('');
    users.forEach(user => {
      let userInfo = $('<div class="userInfo"></div>');
      let infoAvatar = $('<img />', {
        src: 'img/avatar/' + user.avatar,
        class: "infoAvatar"
      });
      let infoNickname = $(`<div class="infoNickname">${user.nickname}</div>`);
      infoAvatar.appendTo(userInfo);
      infoNickname.appendTo(userInfo);
      if (user.nickname === socket.chatUser.nickname) {
        userInfo.css("background-color", "#339966");
      }
      userInfo.appendTo(chatUsers);
    });
  });
  
  socket.on('chatMessage', msgObj => {
    msgObj.avatar = 'img/avatar/' + msgObj.avatar;
    newMessage(msgObj);
  });
  
  socket.on('newUser', nickname => {
    const msgObj = {
      nickname: 'ribbit-Bot',
      avatar: 'img/bot.png',
      message: `${nickname} has connected ribbit`
    }
    newMessage(msgObj);
  });

  socket.on('userLeft', nickname => {
    const msgObj = {
      nickname: 'ribbit-Bot',
      avatar: 'img/bot.png',
      message: `${nickname} has left ribbit`
    }
    newMessage(msgObj);
  });

  $('#nicknameForm').submit(function(){
    const newNickname = $('#nickName').val();
    $.get(`/checknick/${encodeURI(newNickname)}`, res => {
      if (res === 'free') {
        socket.chatUser.nickname = newNickname;    
        socket.emit('nickname', newNickname);
        $('#nickNameWrapper').hide();
        $('#avatarWrapper').show();
        loadAvatars();
      } else {
        $('#wrongNickname').show();
      }
    });
    $('#nickName').val('');
    return false;
  });

  $('#messageForm').submit(() => {
    socket.emit('chatMessage', {
      nickname: socket.chatUser.nickname, 
      avatar: socket.chatUser.avatar,
      message: $('#messageBox').val()
    });
    $('#messageBox').val('');
    return false;
  });

});