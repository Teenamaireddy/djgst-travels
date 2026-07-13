/**
 * =====================================
 * DJGST AI Core
 * Main Coordinator
 * =====================================
 */
import intentEngine from "./intent-engine.js";
import entityEngine from "./entity-engine.js";
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

    // Temporary response
    return "Processing completed...";
    }

}

const djgstAI = new DJGSTAI();

export default djgstAI;
