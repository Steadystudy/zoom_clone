const frontsocket = io();
const welcome = document.querySelector("#welcome");
const room_name = welcome.querySelector("#room_name");
const chat_room = document.querySelector("#chat_room");
const nameForm = welcome.querySelector("#name");

chat_room.hidden = true;

let roomName;
let nick;

function addMessage(message) {
  const ul = chat_room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

function handleMessageSubmit(event) {
  const roomInput = chat_room.querySelector("#msg input");
  event.preventDefault();
  const value = roomInput.value;
  frontsocket.emit("new_message", roomInput.value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  roomInput.value = "";
}

function handleNicknameSubmit(event) {
  event.preventDefault();
  const nickname = welcome.querySelector("#name input");
  frontsocket.emit("nickname", nickname.value);
  nick = nickname.value;
  nickname.value = "";
}

function showRoom() {
  welcome.hidden = true;
  chat_room.hidden = false;
  const h3 = chat_room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  const msgForm = chat_room.querySelector("#msg");
  msgForm.addEventListener("submit", handleMessageSubmit);
}

function handleWelcomeForm(event) {
  event.preventDefault();
  if (nick) {
    const room_name_input = room_name.querySelector("input");
    frontsocket.emit("enter_room", room_name_input.value, showRoom);
    roomName = room_name_input.value;
    room_name_input.value = "";
  } else {
    alert("nickname is required");
  }
}

nameForm.addEventListener("submit", handleNicknameSubmit);
room_name.addEventListener("submit", handleWelcomeForm);

function countUsers(newCount) {
  const h3 = chat_room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
}

frontsocket.on("welcome", (user, newCount) => {
  countUsers(newCount);
  addMessage(`${user} joined`);
});

frontsocket.on("bye", (left, newCount) => {
  countUsers(newCount);
  addMessage(`${left} left`);
});

frontsocket.on("new_message", addMessage);

frontsocket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul");
  roomList.innerHTML = "";
  if (rooms.length === 0) {
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});
