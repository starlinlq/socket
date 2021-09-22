require("dotenv");
const express = require("express");
const cors = require("cors");
const app = express();

//middleware
app.use(cors());

let server = app.listen(process.env.PORT || 3002, () => {
  console.log("server running");
});

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3001",
  },
});
let users = [];

const addUser = (user, socketId) => {
  !users.find((current) => current.id === user.id) &&
    users.push({ ...user, socketId });

  console.log("adding");
};

const getUser = (userId) => {
  return users.find((user) => user.id === userId);
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};
io.on("connection", (socket) => {
  //when connect
  console.log("user connected");

  //take userId and socketid from user
  socket.on("sendUser", (user) => {
    console.log(user);
    addUser(user, socket.id);
    io.emit("getUsers", users);
  });

  //send notification
  socket.on("sendNotification", (notification) => {
    let reciever = getUser(notification.reciever);
    console.log(reciever);

    if (reciever) {
      console.log("heloo");
      io.to(reciever.socketId).emit("getNotification", notification);
    }
  });

  //when disconenct
  socket.on("disconnect", () => {
    console.log("user disconnected");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });

  //take message from user
  socket.on("sendMessage", ({ sender, recieverId, text }) => {
    const reciver = getUser(recieverId);

    if (reciver) {
      io.to(reciver.socketId).emit("getMessage", {
        sender,
        text,
      });
    }
  });
  //io.to().emit("welcome", "hellos this is socket server");
});
