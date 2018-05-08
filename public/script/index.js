'use strict';

function loadAvatars() {
  $.get('/avatars', (list) => {
    list.forEach(element => {
      var img = $('<img />', { 
        id: element,
        src: 'img/avatar/' + element
      });
      img.on('click', () => {
        console.log(element);
      });
      img.appendTo($('#avatarSelector'));
    });
  });
}

$(function () {

  // Socket.IO and Test
  const socket = io();
  socket.on('accept', (msg) => {
    console.log('From IO :' + msg);
  });

  // Main welcome / nickname page
  $('form').submit(function(){
    socket.emit('nickname', $('#nickName').val());
    console.log($('#nickName').val());
    $('#nickNameWrapper').hide();
    $('#avatarWrapper').show();
    loadAvatars();   
    return false;
  });

});