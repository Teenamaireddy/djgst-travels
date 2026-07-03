const allowedPages = [
  "busapplication.html",
  "trainapplication.html",
  "flight_ticket_booking.html"
];

const currentPage = window.location.pathname.split("/").pop();

if (!allowedPages.includes(currentPage)) {
  // Don't load DJGST AI on this page
} else {

  const aiHTML = `
<div id="djgst-ai-button">

<img
src="ai_face.png"
id="djgst-ai-avatar"
alt="DJGST AI">

</div>

<div id="djgst-ai-window">

<div id="djgst-ai-header">

<div id="djgst-ai-title">

🤖 DJGST AI

<div id="djgst-ai-status">
🟢 Online
</div>

</div>

<div id="djgst-ai-close">
✖
</div>

</div>

<div id="djgst-ai-messages">

<div class="ai-bot-message">

👋 Hello!

I'm <b>DJGST AI</b>.

How can I help you today?

</div>

</div>

<div id="djgst-ai-input-area">

<input
id="djgst-ai-input"
placeholder="Ask anything..."
>

<button id="djgst-ai-send">

➤

</button>

</div>

</div>
`;

document.body.insertAdjacentHTML("beforeend", aiHTML);

const button = document.getElementById("djgst-ai-button");

const windowAI =
document.getElementById("djgst-ai-window");

const closeBtn =
document.getElementById("djgst-ai-close");

button.onclick = () => {

windowAI.classList.add("show");

};

closeBtn.onclick = () => {

windowAI.classList.remove("show");

};


}
const input = document.getElementById("djgst-ai-input");
const sendBtn = document.getElementById("djgst-ai-send");
const messages = document.getElementById("djgst-ai-messages");

function addMessage(text, type){

    const div = document.createElement("div");

    div.className =
        type === "bot"
        ? "ai-bot-message"
        : "ai-user-message";

    div.innerHTML = text;

    messages.appendChild(div);

    messages.scrollTop = messages.scrollHeight;

}

function botReply(msg){

    const m = msg.toLowerCase();

    if(m.includes("hello") || m.includes("hi")){

        addMessage("👋 Hello! Welcome to DJGST Travels.", "bot");

    }

    else if(m.includes("bus")){

        addMessage("🚌 I can help you book buses.", "bot");

    }

    else if(m.includes("train")){

        addMessage("🚆 I can help you book trains.", "bot");

    }

    else if(m.includes("flight")){

        addMessage("✈️ I can help you book flights.", "bot");

    }

    else{

        addMessage("🤖 I'm still learning. More abilities coming soon!", "bot");

    }

}

function sendMessage(){

    const text = input.value.trim();

    if(text==="") return;

    addMessage(text,"user");

    input.value="";

    setTimeout(()=>{

        botReply(text);

    },500);

}

sendBtn.onclick = sendMessage;

input.addEventListener("keypress",(e)=>{

    if(e.key==="Enter"){

        sendMessage();

    }

});
