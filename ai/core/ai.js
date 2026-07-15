/**
 * =====================================
 * DJGST AI Core
 * Main Coordinator
 * =====================================
 */
import intentEngine from "./intent-engine.js";
import entityEngine from "./entity-engine.js";
import slotEngine from "../slots/slot-engine.js";
import memoryStore from "../memory/memory-store.js";
class DJGSTAI {

    constructor() {
        console.log("🧠 DJGST AI Initialized");
    }

    async process(userMessage) {

    console.log("👤 User:", userMessage);

    // Step 1 - Detect Intent
    const intent = intentEngine.detect(userMessage);
    console.log("🎯 Intent:", intent);

    // Step 2 - Extract Entities
    const entities = entityEngine.extract(userMessage);
    console.log("📦 Entities:", entities);

    // Step 3 - Save Entities to Memory
    Object.entries(entities).forEach(([key, value]) => {
        if (value !== null) {
            memoryStore.save(key, value);
        }
    });

    console.log("🧠 Memory:", memoryStore.getAll());
        // Step 4 - Check Required Slots

const slotResult = slotEngine.check(
    intent.intent,
    memoryStore.getAll()
);

console.log("🧩 Slot Result:", slotResult);

    // Temporary response
    let reply = "😊 I'm still learning how to help with that.";

if (!slotResult.complete) {

    switch (slotResult.missing) {

        case "transport":
            reply = "🚌 Which transport would you like to book? Bus, Train or Flight?";
            break;

        case "from":
            reply = "📍 Where are you travelling from?";
            break;

        case "to":
            reply = "📍 Where are you travelling to?";
            break;

        case "date":
            reply = "📅 What date would you like to travel?";
            break;

    }

}
        
if (
    intent.intent === "book_ticket" &&
    slotResult.complete
) {

    const memory = memoryStore.getAll();

    reply =
`✅ Perfect!

🚌 Transport : ${memory.transport}
📍 From : ${memory.from}
📍 To : ${memory.to}
📅 Date : ${memory.date}

Searching available ${memory.transport.toLowerCase()} tickets...`;
}

return {
    intent,
    entities,
    memory: memoryStore.getAll(),
    reply
};
    }

}

const djgstAI = new DJGSTAI();

export default djgstAI;
