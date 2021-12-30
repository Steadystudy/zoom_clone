const frontsocket = io();
const welcome = document.querySelector("#welcome");
const welcomeForm = welcome.querySelector("form");
const room = document.querySelector("#room");

room.hidden = true;

function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

function handleMessageSubmit(event) {
  const roomInput = room.querySelector("#msg input");
  event.preventDefault();
  const value = roomInput.value;
  frontsocket.emit("new_message", roomInput.value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  roomInput.value = "";
}

function handleNicknameSubmit(event) {
  event.preventDefault();
  const nickname = room.querySelector("#name input");
  frontsocket.emit("nickname", nickname.value);
}

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  const msgForm = room.querySelector("#msg");
  const nameForm = room.querySelector("#name");
  msgForm.addEventListener("submit", handleMessageSubmit);
  nameForm.addEventListener("submit", handleNicknameSubmit);
}

let roomName;

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  frontsocket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value = "";
}

welcomeForm.addEventListener("submit", handleRoomSubmit);

frontsocket.on("welcome", (user) => {
  addMessage(`${user} joined`);
});

frontsocket.on("bye", (left) => {
  addMessage(`${left} left`);
});

frontsocket.on("new_message", addMessage);
