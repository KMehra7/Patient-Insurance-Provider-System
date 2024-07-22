var express = require("express"),
    empty = require('is-empty'),
    { poolPromise, doQuery, sql } = require('../db');

let users = [];
let activeRooms = [];

module.exports = (socket, io) => {

  socket.on('socketConnect', function(data) {

    try {
      let query = `select last_message_view.*, 
                  (select count(*) from messages where last_message_view.room_id = messages.room_id and messages.timestamp > last_message_view.time and messages.user_id <> @id and last_message_view.user_id = @id and last_message_view.user_type = @user_type) as unread,
                  (select messages.* from messages where last_message_view.room_id = messages.room_id order by timestamp desc, id desc FOR JSON PATH) as messages
                  from last_message_view where user_id = @id and user_type = @user_type;`;
      let params = [
          {name: 'id', sqltype: sql.Int, value: data.id},
          {name: 'user_type', sqltype: sql.VarChar(20), value: data.usertype}
      ];
      doQuery(null, query, params, function(selectData) {
        socket.emit('add_conversations', selectData.recordset.map(convo => ({...convo, userTyping: false, userConnected: !empty(activeRooms.filter(room => room.room_id === convo.room_id)), meConnected: false, messages: empty(JSON.parse(convo.messages)) ? [] : JSON.parse(convo.messages).reverse()})));
        selectData.recordset.forEach(function(convo) { 
          socket.join(convo.room_id);
        });
        users.push({
          socket_id: socket.id,
          user_id: data.id,
          user_type: data.usertype,
          rooms: selectData.recordset.map(convo => convo.room_id)
        });
      });
    } catch(e) {
      console.log(e);
    }

  });

  socket.on("disconnect", (reason) => {
    
    const userArr = users.filter(u => u.socket_id === socket.id);
    users = users.filter(u => u.socket_id !== socket.id);
    if(!empty(userArr)) {
      const user = userArr[0];
      user.rooms.forEach(function(room) {
        socket.to(room).emit("user_disconnected", {connectedUser: {user_id: data.id, user_type: data.usertype}, room_id: room, userConnected: false});
      });
    }
    activeRooms = activeRooms.filter(room => !(room.socket_id === socket.id));

  });

  socket.on('join_page', function(data) {

    try {
      let query2 = `update last_message_view set time = GETDATE() where user_id = @user_id and room_id = @room_id and user_type = @user_type;`;
      let params2 = [
        {name: 'room_id', sqltype: sql.VarChar(20), value: data.room_id},
        {name: 'user_id', sqltype: sql.Int, value: data.id},
        {name: 'user_type', sqltype: sql.VarChar(20), value: data.usertype}
      ];
      doQuery(null, query2, params2, function(records2) {
        socket.to(data.room_id).emit("user_connected", {connectedUser: {user_id: data.id, user_type: data.usertype}, room_id: data.room_id, userConnected: true});
        activeRooms.push({socket_id: socket.id, room_id: data.room_id});
      });
    } catch(e) {
      console.log(e);
    }

  });

  socket.on('leave_page', function(data) {

    try {
      let query2 = `update last_message_view set time = GETDATE() where user_id = @user_id and room_id = @room_id and user_type = @user_type;`;
      let params2 = [
        {name: 'room_id', sqltype: sql.VarChar(20), value: data.room_id},
        {name: 'user_id', sqltype: sql.Int, value: data.id},
        {name: 'user_type', sqltype: sql.VarChar(20), value: data.usertype}
      ];
      doQuery(null, query2, params2, function(records2) {
        socket.to(data.room_id).emit("user_disconnected", {connectedUser: {user_id: data.id, user_type: data.usertype}, room_id: data.room_id, userConnected: false});
        activeRooms = activeRooms.filter(room => !(room.socket_id === socket.id && room.room_id === data.room_id));
      });
    } catch(e) {
      console.log(e);
    }

  });

  socket.on("send_chat", (data) => {
    try {
      let query = "insert into messages (user_id, room_id, user_type, message) output inserted.* values (@user_id, @room_id, @user_type, @message);";
      let params = [
        {name: 'user_id', sqltype: sql.Int, value: data.id},
        {name: 'room_id', sqltype: sql.VarChar(20), value: data.room_id},
        {name: 'message', sqltype: sql.VarChar(1000), value: data.message},
        {name: 'user_type', sqltype: sql.VarChar(20), value: data.usertype}
      ];
      doQuery(null, query, params, function(records) {
        const record = records.recordset[0];
        io.in(`${data.room_id}`).emit('chat_received', [{...record}]);
      });
    } catch(e) {
      console.log(e)
    }
    
  });

  socket.on("user_typing", (data) => {
    socket.to(`${data.room_id}`).emit('user_typing_received', data);
  });

  socket.on("join_room", (data) => {
    socket.join(data.room_id);
  });

};

