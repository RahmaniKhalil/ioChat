const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);


users = [];
connections = [];

// Start the server on port 3000
server.listen(process.env.PORT || 3000);
console.log("Server running ...");

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', (socket) => {
  connections.push(socket);
  console.log("Connected: %s Socket(s) connected", connections.length);
  
  //Disconnect
  socket.on('disconnect', (data) =>{
    users.splice(users.indexOf(socket.username),1);
    updateUsernames();
    connections.splice(connections.indexOf(socket), 1);
    console.log("Disconnected: %s Socket(s) connected", connections.length);
  });

  //Capture the send message event from the client
  socket.on('send message', (data) => {
    
    // Emit the new message data to the client
    io.sockets.emit('new message', {msg: data, user: socket.username});
  });

  //New user
  socket.on('new user', (data, callback) => {
    callback(true);
    socket.username = data;
    users.push(socket.username);
    updateUsernames();
  });

  function updateUsernames() {
    io.sockets.emit('get users', users);
  }
  
  
});