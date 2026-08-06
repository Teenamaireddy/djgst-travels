/**
 * =====================================
 * DJGST AI Core
 * Main Coordinator
 * =====================================
 */

import selectBus from "../actions/select-bus.js";
import actionRegistry from "../actions/action-registry.js";
import busSearch from "../services/bus-search.js";
import intentEngine from "./intent-engine.js";
import entityEngine from "./entity-engine.js";
import slotEngine from "../slots/slot-engine.js";
import memoryStore from "../memory/memory-store.js";
import parseBus from "../utils/bus-parser.js";

class DJGSTAI {

    constructor() {
        console.log("🧠 DJGST AI Initialized");
    }

    async process(userMessage) {

        console.log("👤 User:", userMessage);

        // -------------------------
        // STEP 0 : Current Memory
        // -------------------------

        const memory = memoryStore.getAll();

        // -------------------------
        // STEP 1 : User selected bus
        // (Number OR Bus Name)
        // -------------------------

        const selectedBus = parseBus(
            userMessage,
            memory
        );

        if (selectedBus) {

            memoryStore.save(
                "selectedBus",
                selectedBus
            );

            setTimeout(() => {

                const params = new URLSearchParams({
                    busId: selectedBus.id
                });

                window.location.href =
                    "busapplication.html?" +
                    params.toString();

            }, 1200);

            return {

                intent: {
                    intent: "select_bus"
                },

                entities: {
                    selectedBus
                },

                memory: memoryStore.getAll(),

                reply:
`✅ Great choice!

🚌 ${selectedBus.name}

💺 Opening Seat Selection...`

            };

        }

        // -------------------------
        // STEP 2 : YES means
        // use previous date
        // -------------------------

        if (
            userMessage.trim().toLowerCase() === "yes" &&
            memory.date
        ) {

            userMessage +=
                " " + memory.date;

        }

        // -------------------------
        // STEP 3 : Detect Intent
        // -------------------------

        let intent =
            intentEngine.detect(userMessage);

        if (
            intent.intent === "unknown" &&
            memory.intent
        ) {

            intent.intent =
                memory.intent;

        }

        if (
            intent.intent !== "unknown"
        ) {

            memoryStore.save(
                "intent",
                intent.intent
            );

        }

        // -------------------------
        // STEP 4 : Extract Entities
        // -------------------------

        const entities =
            entityEngine.extract(userMessage);

        console.log(
            "📦 Entities:",
            entities
        );

        // -------------------------
        // STEP 5 : Save Entities
        // -------------------------

        Object.entries(entities).forEach(
            ([key, value]) => {

                if (value !== null) {

                    memoryStore.save(
                        key,
                        value
                    );

                }

            }
        );
                console.log(
            "🧠 Memory:",
            memoryStore.getAll()
        );

        // -------------------------
        // STEP 6 : Slot Checking
        // -------------------------

        const slotResult = slotEngine.check(
            intent.intent,
            memoryStore.getAll()
        );

        if (!slotResult.complete) {

            switch (slotResult.missing) {

                case "transport":

                    return {
                        intent,
                        entities,
                        memory: memoryStore.getAll(),
                        reply:
"🚌 Which transport would you like to book?\nBus, Train or Flight?"
                    };

                case "from":

                    return {
                        intent,
                        entities,
                        memory: memoryStore.getAll(),
                        reply:
"📍 Where are you travelling from?"
                    };

                case "to":

                    return {
                        intent,
                        entities,
                        memory: memoryStore.getAll(),
                        reply:
"📍 Where are you travelling to?"
                    };

                case "date":

                    return {
                        intent,
                        entities,
                        memory: memoryStore.getAll(),
                        reply:
"📅 What date would you like to travel?"
                    };

            }

        }

        // -------------------------
        // STEP 7 : Execute Actions
        // -------------------------

        actionRegistry.execute(
            intent.intent,
            memoryStore.getAll()
        );

        // -------------------------
        // STEP 8 : Booking Logic
        // -------------------------

        if (intent.intent === "book_ticket") {

            const memory = memoryStore.getAll();

            if (memory.transport === "Bus") {

                const buses =
                    busSearch.search(memory);

                if (buses.length === 0) {

                    return {

                        intent,
                        entities,
                        memory,

                        reply:
`😔 Sorry!

No buses found.

📍 ${memory.from} ➜ ${memory.to}`

                    };

                }

                // Save available buses
                memoryStore.save(
                    "availableBuses",
                    buses
                );

                let reply =
`🚌 I found ${buses.length} buses.

`;

                buses.forEach((bus, index) => {

                    reply +=
`${index + 1}. ${bus.name}
🛏 ${bus.type}
🕒 ${bus.departure} → ${bus.arrival}
💰 ₹${bus.price}

`;

                });

                reply +=
`Reply with:

• Bus number (1,2,3...)
OR
• Bus name

Example:
Orange Travels
APSRTC Garuda
Book VRL`;

                return {

                    intent,
                    entities,
                    memory,
                    reply

                };

            }
                        // -------------------------
            // TRAIN BOOKING
            // -------------------------

            if (memory.transport === "Train") {

                setTimeout(() => {

                    window.location.href =
                        "trainapplication.html";

                }, 1500);

                return {

                    intent,
                    entities,
                    memory,

                    reply:
`🚆 Opening Train Booking...`

                };

            }

            // -------------------------
            // FLIGHT BOOKING
            // -------------------------

            if (memory.transport === "Flight") {

                setTimeout(() => {

                    window.location.href =
                        "flight_ticket_booking.html";

                }, 1500);

                return {

                    intent,
                    entities,
                    memory,

                    reply:
`✈️ Opening Flight Booking...`

                };

            }

        }

        // -------------------------
        // DEFAULT REPLY
        // -------------------------

        return {

            intent,
            entities,
            memory: memoryStore.getAll(),

            reply:
"😊 I'm still learning how to help with that."

        };

    }

}
const djgstAI = new DJGSTAI();

export default djgstAI;

        
