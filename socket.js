// const socketIo = require('socket.io');
const http = require('http');
const app = require('./app');



const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server,{
  cors: {
    origin: 'https://treatsdelight.vercel.app', 
    methods: ["GET", "POST"]
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

  socket.on("notification", (data) => {
    io.emit("notification", { message: data.message });
  });
});

global.io = io;


module.exports = server;
