'use strict';

$(function () {
  const socket = io();
  $('form').submit(function(){
    socket.emit('login', $('#nickName').val());
    console.log($('#nickName').val());
    return false;
  });
});