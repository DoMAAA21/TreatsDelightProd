const socketIo = require('socket.io');
const http = require('http');
const app = require('./app');

const server = http.createServer(app);
const io = socketIo(server);

io.on("connection", (socket) => {
  console.log("user connected");


  socket.on("disconnect", () => {
    console.log("User disconnected");
  });


  socket.on("new_user_login", (data) => {
    console.log("ran 2nd");
    io.emit("new_user_login", { message: data.message });
  });
});

module.exports = { io, server };
