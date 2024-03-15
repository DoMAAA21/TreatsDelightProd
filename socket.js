const socketIo = require('socket.io');
const http = require('http');
const app = require('./app');

const server = http.createServer(app);
const cors = require('cors');
const io = socketIo(server,{
  cors: {
    origin: ['http://localhost:3000','http://localhost:3001','https://treatsdelight.vercel.app','https://octopus-app-bwpel.ondigitalocean.app'], 
  }
});


io.on("connection", (socket) => {

  console.log("connected");
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  


  socket.on("new_user_login", (data) => {
    io.emit("new_user_login", { message: data.message });
  });
});

global.io = io;


module.exports = server;
