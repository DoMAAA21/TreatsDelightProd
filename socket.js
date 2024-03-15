const socketIo = require('socket.io');
const http = require('http');
const app = require('./app');

const server = http.createServer(app);
const io = socketIo(server);


io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });


  socket.on("new_user_login", (data) => {
    io.emit("new_user_login", { message: data.message });
  });
});

global.io = io;


module.exports = server;
