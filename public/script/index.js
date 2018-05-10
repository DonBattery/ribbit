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
  
  // Main welcome / nickname page
  $('#nicknameForm').submit(function(){
    socket.chatUser.nickname = $('#nickName').val();
    socket.emit('nickname', $('#nickName').val());
    $('#nickNameWrapper').hide();
    $('#avatarWrapper').show();
    loadAvatars();   
    return false;
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
      userInfo.appendTo(chatUsers);
    });
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

  socket.on('chatMessage', msgObj => {
    const chatMessages = $('#chatMessages');
    const chatBox = $('#chatBox');
    let listItem = $('<li></li>');
    let infoAvatar = $('<img />', {
      src: 'img/avatar/' + msgObj.avatar,
      class: "infoAvatar"
    });
    let infoNickname = $(`<div class="infoNickname">${msgObj.nickname}:</div>`);
    let message = $(`<div class="chatMessage">${msgObj.message}</div>`);
    infoAvatar.appendTo(listItem);
    infoNickname.appendTo(listItem);
    message.appendTo(listItem);
    listItem.appendTo(chatMessages);
    chatBox.scrollTop(chatBox.prop("scrollHeight"));
  });

});