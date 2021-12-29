const messageList = document.querySelector("ul");
const messageForm = document.querySelector("#message");
const nickForm = document.querySelector("#nick");
const frontsocket = new WebSocket(`ws://${window.location.host}`);

function makeMessage(type, payload) {
  const msg = { type, payload };
  return JSON.stringify(msg);
}

frontsocket.addEventListener("open", () => {
  console.log("Connected to Browser 👍");
});

frontsocket.addEventListener("message", (message) => {
  const li = document.createElement("li");
  li.innerText = message.data;
  messageList.append(li);
});

frontsocket.addEventListener("close", () => {
  console.log("Disconnected from the Browser 👎");
});

function handleForm(event) {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  frontsocket.send(makeMessage("new_message", input.value));
  input.value = "";
}

function handleNickSubmit(event) {
  event.preventDefault();
  const input = nickForm.querySelector("input");
  frontsocket.send(makeMessage("nickname", input.value));
  input.value = "";
}

messageForm.addEventListener("submit", handleForm);
nickForm.addEventListener("submit", handleNickSubmit);
