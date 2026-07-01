const blockedPages = [
  "index.html",
  "login.html",
  "amenities.html",
  "blog.html"
];

const currentPage = window.location.pathname.split("/").pop();

if (blockedPages.includes(currentPage)) {
  // Don't load DJGST AI on these pages
} else {
  const aiHTML = `
<div id="djgst-ai-button">
🤖
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

windowAI.style.display = "flex";

};

closeBtn.onclick = () => {

windowAI.style.display = "none";

};

}
