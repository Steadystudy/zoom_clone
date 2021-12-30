import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();
const PORT = 5500;

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => {
  console.log(`Listening on http://localhost:${PORT}`);
};

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (backsocket) => {
  backsocket["nickname"] = "";
  backsocket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });
  backsocket.on("enter_room", (roomName, done) => {
    backsocket.join(roomName);
    done();
    backsocket
      .to(roomName)
      .emit("welcome", backsocket.nickname, countRoom(roomName));
    wsServer.sockets.emit("room_change", publicRooms());
  });
  backsocket.on("disconnecting", () => {
    backsocket.rooms.forEach((room) =>
      backsocket.to(room).emit("bye", backsocket.nickname, countRoom(room) - 1)
    );
  });
  backsocket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  });
  backsocket.on("new_message", (msg, room, done) => {
    backsocket.to(room).emit("new_message", `${backsocket.nickname}: ${msg}`);
    done();
  });
  backsocket.on("nickname", (nickname) => (backsocket["nickname"] = nickname));
});

httpServer.listen(PORT, handleListen);
