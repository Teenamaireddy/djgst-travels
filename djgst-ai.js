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
const pages = {

    home: "index.html",

    bus: "busapplication.html",

    train: "trainapplication.html",

    flight: "flight_ticket_booking.html",

    login: "login.html",

    blog: "blog.html",

    amenities: "amenities.html"

};

function botReply(message){
  const pages = {

    home: "index.html",

    bus: "busapplication.html",

    train: "trainapplication.html",

    flight: "flight_ticket_booking.html",

    login: "login.html",

    blog: "blog.html",

    amenities: "amenities.html"

};

    const msg = message.toLowerCase();

    // HOME
    if(msg.includes("home")){

        addMessage("🏠 Opening Home Page...", "bot");

        setTimeout(()=>{

            window.location.href = pages.home;

        },1000);

    }

    // BUS
    else if(msg.includes("bus")){

        addMessage("🚌 Opening Bus Booking...", "bot");

        setTimeout(()=>{

            window.location.href = pages.bus;

        },1000);

    }

    // TRAIN
    else if(msg.includes("train")){

        addMessage("🚆 Opening Train Booking...", "bot");

        setTimeout(()=>{

            window.location.href = pages.train;

        },1000);

    }

    // FLIGHT
    else if(msg.includes("flight")){

        addMessage("✈️ Opening Flight Booking...", "bot");

        setTimeout(()=>{

            window.location.href = pages.flight;

        },1000);

    }

    // LOGIN
    else if(msg.includes("login")){

        addMessage("🔐 Opening Login Page...", "bot");

        setTimeout(()=>{

            window.location.href = pages.login;

        },1000);

    }

    // BLOG
    else if(msg.includes("blog")){

        addMessage("📖 Opening Blog...", "bot");

        setTimeout(()=>{

            window.location.href = pages.blog;

        },1000);

    }

    // AMENITIES
    else if(msg.includes("amenities")){

        addMessage("🛋 Opening Amenities...", "bot");

        setTimeout(()=>{

            window.location.href = pages.amenities;

        },1000);

    }

    else{

        addMessage("🤔 I don't know that yet, but I'm learning every day!", "bot");

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

