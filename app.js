const express = require("express");
const socketio = require("./socket");
const cors = require("cors");
const {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} = require("unique-names-generator");
// const randomProfile = require("random-profile-generator");
require("events").EventEmitter.defaultMaxListeners = 0;

const PORT = process.env.PORT || 4000;

const app = express();

app.use(cors());
const server = app.listen(PORT, () =>
  console.log(`Server listening on port ${PORT}`)
);

const io = socketio.init(server, {
  cors: {
    origin: "http://150.95.82.125:4200",
    // orign: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

let users = [];

io.on("connection", (socket) => {
  const shortname = uniqueNamesGenerator({
    dictionaries: [colors, adjectives, animals],
  });
  //   console.log(socket);
  //   const profile = randomProfile.profile();
  users.push({ shortname, id: socket.id });
  socket.emit("init", {
    shortname,
  });
  io.emit("users", users);
  console.log(users);
  socket.on("file:transfer", (reciverId, buffer, filename) => {
    console.log(reciverId);
    // const myBuffer = Buffer.from(dataurl, "base64");
    io.to(reciverId).emit("file:recieve", { buffer, filename });
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
    users = users.filter((user) => user.id != socket.id);
  });
});
