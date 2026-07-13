import intentEngine from "./ai/core/intent-engine.js";
import entityEngine from "./ai/core/entity-engine.js";

const AI_DEVELOPER_MODE = true;
const allowedPages = [
  "busapplication.html",
  "trainapplication.html",
  "flight_ticket_booking.html"
];

const currentPage = window.location.pathname.split("/").pop();

if (!AI_DEVELOPER_MODE || !allowedPages.includes(currentPage)) {

}
else {

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

  const intent = intentEngine.detect(text);
const entities = entityEngine.extract(text);

console.log("Intent:", intent);
console.log("Entities:", entities);

    const div = document.createElement("div");

    div.className =
        type === "bot"
        ? "ai-bot-message"
        : "ai-user-message";

    div.innerHTML = text;

    messages.appendChild(div);

    messages.scrollTop = messages.scrollHeight;

}


let aiMemory = {

name: "",

lastPage: "",

language: "English"

};


function botReply(message){

const msg = message.toLowerCase();
  // Remember user's name

if(
msg.startsWith("my name is ") ||
msg.startsWith("i am ")
){

let name = message
.replace(/my name is/i,"")
.replace(/i am/i,"")
.trim();

aiMemory.name = name;

addMessage(

"😊 Nice to meet you <b>"+name+"</b>! I'll remember your name during this visit.",

"bot"

);

return;

}

const pages = {

home:"index.html",
bus:"busapplication.html",
train:"trainapplication.html",
flight:"flight_ticket_booking.html",
login:"login.html",
blog:"blog/index.html",
amenities:"amenities.html"

};


// HOME
if(
msg.includes("home") ||
msg.includes("main page") ||
msg.includes("homepage")
){

addMessage("🏠 Taking you to Home...","bot");

setTimeout(()=>{
window.location.href=pages.home;
},800);

}


// BUS
else if(

msg.includes("bus") ||
msg.includes("book bus") ||
msg.includes("bus booking") ||
msg.includes("travel by bus")

){

let greet = aiMemory.name
? "🚌 Sure " + aiMemory.name + ", opening Bus Booking..."
: "🚌 Opening Bus Booking...";

addMessage(greet,"bot");

if(currentPage==="busapplication.html"){

addMessage("😊 You're already on the Bus Booking page.","bot");

}
else{

setTimeout(()=>{

window.location.href=pages.bus;

},800);

}
}


// TRAIN
else if(

msg.includes("train") ||
msg.includes("book train") ||
msg.includes("train booking") ||
msg.includes("travel by train")

){

addMessage("🚆 Opening Train Booking...","bot");

if(currentPage==="trainapplication.html"){

addMessage("😊 You're already on the train Booking page.","bot");

}
else{

setTimeout(()=>{

window.location.href=pages.train;

},800);

}
}


// FLIGHT
else if(

msg.includes("flight") ||
msg.includes("plane") ||
msg.includes("air") ||
msg.includes("book flight")

){

addMessage("✈ Opening Flight Booking...","bot");

if(currentPage==="flight_ticket_booking.html"){

addMessage("😊 You're already on the flight Booking page.","bot");

}
else{

setTimeout(()=>{

window.location.href=pages.flight;

},800);

}

}


// LOGIN
else if(

msg.includes("login") ||
msg.includes("sign in") ||
msg.includes("log in")

){

addMessage("🔐 Opening Login...","bot");

setTimeout(()=>{
window.location.href=pages.login;
},800);

}


// BLOG
else if(

msg.includes("blog") ||
msg.includes("news") ||
msg.includes("articles")

){

addMessage("📖 Opening Blog...","bot");

setTimeout(()=>{
window.location.href=pages.blog;
},800);

}


// AMENITIES
else if(

msg.includes("amenities") ||
msg.includes("facilities") ||
msg.includes("features")

){

addMessage("🛋 Opening Amenities...","bot");

setTimeout(()=>{
window.location.href=pages.amenities;
},800);

}

else{

addMessage("😊 Sorry, I couldn't understand that yet. Try asking me to open Bus, Train, Flight, Home, Blog, Amenities or Login.","bot");

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

if(sendBtn){

    sendBtn.onclick = sendMessage;

}

if(input){

    input.addEventListener("keypress",(e)=>{

        if(e.key==="Enter"){

            sendMessage();

        }

    });

}
