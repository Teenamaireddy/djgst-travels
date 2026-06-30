
const aiHTML = `
<div id="djgst-ai-button">
    🤖
</div>
`;

document.body.insertAdjacentHTML("beforeend", aiHTML);

const button = document.getElementById("djgst-ai-button");

button.addEventListener("click", () => {
    alert("🤖 DJGST AI is waking up...");
});
