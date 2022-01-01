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

wsServer.on("connection", (backsocket) => {
  backsocket.on("join_room", (roomName, done) => {
    backsocket.join(roomName);
    done();
    backsocket.to(roomName).emit("welcome");
  });
  backsocket.on("offer", (offer, roomName) => {
    backsocket.to(roomName).emit("offer", offer);
  });
});

httpServer.listen(PORT, handleListen);
