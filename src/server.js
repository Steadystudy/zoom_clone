import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const sockets = [];

wss.on("connection", (backsocket) => {
  backsocket["nickname"] = "Anon";
  sockets.push(backsocket);
  console.log("Connected to Browser 👍");
  backsocket.on("close", () => console.log("Disconnected from the Browser 👎"));
  backsocket.on("message", (msg) => {
    const message = JSON.parse(msg);
    switch (message.type) {
      case "new_message":
        sockets.forEach((aSocket) =>
          aSocket.send(
            `${backsocket.nickname}: ${message.payload.toString("utf-8")}`
          )
        );
        break;
      case "nickname":
        backsocket["nickname"] = message.payload;
        break;
      default:
        console.log("There is something wrong");
    }
  });
});

server.listen(process.env.PORT, handleListen);
