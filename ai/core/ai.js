/**
 * =====================================
 * DJGST AI Core
 * Main Coordinator
 * =====================================
 */

import selectBus from "../actions/select-bus.js";
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

        const memory =
            memoryStore.getAll();


        // -------------------------
        // STEP 1 : BUS SELECTION
        // Number OR Bus Name
        // -------------------------

        const trimmedMessage =
            userMessage.trim();


        // NUMBER SELECTION
        if (/^[1-9]\d*$/.test(trimmedMessage)) {

            const selectedBus =
                selectBus(
                    Number(trimmedMessage)
                );


            if (!selectedBus) {

                return {

                    intent: {
                        intent: "bus_selected"
                    },

                    entities: {},

                    memory:
                        memoryStore.getAll(),

                    reply:
`❌ Invalid bus number.

Please choose a valid bus.`

                };

            }


            return {

                intent: {
                    intent: "bus_selected"
                },

                entities: {
                    selectedBus
                },

                memory:
                    memoryStore.getAll(),

                reply:
`✅ ${selectedBus.name} selected.

💺 Opening Seat Selection...`

            };

        }


        // -------------------------
        // BUS NAME SELECTION
        // -------------------------

        const selectedBusByName =
            parseBus(
                trimmedMessage,
                memory
            );


        if (selectedBusByName) {

            memoryStore.save(
                "selectedBus",
                selectedBusByName
            );

            memoryStore.save(
                "bookingStage",
                "seat_selection"
            );


            return {

                intent: {
                    intent: "bus_selected"
                },

                entities: {
                    selectedBus:
                        selectedBusByName
                },

                memory:
                    memoryStore.getAll(),

                reply:
`✅ ${selectedBusByName.name} selected.

💺 Opening Seat Selection...`

            };

        }


        // -------------------------
        // STEP 2 : YES
        // Use Previous Date
        // -------------------------

        if (
            trimmedMessage.toLowerCase() === "yes" &&
            memory.date
        ) {

            userMessage +=
                " " + memory.date;

        }


        // -------------------------
        // STEP 3 : Detect Intent
        // -------------------------

        let intent =
            intentEngine.detect(
                userMessage
            );


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
            entityEngine.extract(
                userMessage
            );


        console.log(
            "📦 Entities:",
            entities
        );


        // -------------------------
        // STEP 5 : Save Entities
        // -------------------------

        Object.entries(
            entities
        ).forEach(
            ([key, value]) => {

                if (
                    value !== null
                ) {

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

        const slotResult =
            slotEngine.check(
                intent.intent,
                memoryStore.getAll()
            );


        if (
            !slotResult.complete
        ) {

            switch (
                slotResult.missing
            ) {


                case "transport":

                    return {

                        intent,
                        entities,

                        memory:
                            memoryStore.getAll(),

                        reply:
"🚌 Which transport would you like to book?\nBus, Train or Flight?"

                    };


                case "from":

                    return {

                        intent,
                        entities,

                        memory:
                            memoryStore.getAll(),

                        reply:
"📍 Where are you travelling from?"

                    };


                case "to":

                    return {

                        intent,
                        entities,

                        memory:
                            memoryStore.getAll(),

                        reply:
"📍 Where are you travelling to?"

                    };


                case "date":

                    return {

                        intent,
                        entities,

                        memory:
                            memoryStore.getAll(),

                        reply:
"📅 What date would you like to travel?"

                    };

            }

        }


        // -------------------------
        // STEP 7 : BOOKING
        // -------------------------

        if (
            intent.intent ===
            "book_ticket"
        ) {

            const currentMemory =
                memoryStore.getAll();


            // -------------------------
            // BUS
            // -------------------------

            if (
                currentMemory.transport ===
                "Bus"
            ) {

                const buses =
                    busSearch.search(
                        currentMemory
                    );


                if (
                    buses.length === 0
                ) {

                    return {

                        intent,
                        entities,

                        memory:
                            currentMemory,

                        reply:
`😔 Sorry!

No buses found.

📍 ${currentMemory.from} ➜ ${currentMemory.to}`

                    };

                }


                // Save buses
                memoryStore.save(
                    "availableBuses",
                    buses
                );


                // Set selection stage
                memoryStore.save(
                    "bookingStage",
                    "bus_selection"
                );


                let reply =
`🚌 I found ${buses.length} buses.

`;


                buses.forEach(
                    (bus, index) => {

                        reply +=
`${index + 1}. ${bus.name}
🛏 ${bus.type}
🕒 ${bus.departure} → ${bus.arrival}
💰 ₹${bus.price}

`;

                    }
                );


                reply +=
`Reply with:

• Bus number
OR
• Bus name

Example:
Orange Travels
APSRTC Garuda
Book VRL`;


                return {

                    intent,
                    entities,

                    memory:
                        memoryStore.getAll(),

                    reply

                };

            }


            // -------------------------
            // TRAIN
            // -------------------------

            if (
                currentMemory.transport ===
                "Train"
            ) {

                setTimeout(
                    () => {

                        window.location.href =
                            "trainapplication.html";

                    },
                    1500
                );


                return {

                    intent,
                    entities,

                    memory:
                        currentMemory,

                    reply:
"🚆 Opening Train Booking..."

                };

            }


            // -------------------------
            // FLIGHT
            // -------------------------

            if (
                currentMemory.transport ===
                "Flight"
            ) {

                setTimeout(
                    () => {

                        window.location.href =
                            "flight_ticket_booking.html";

                    },
                    1500
                );


                return {

                    intent,
                    entities,

                    memory:
                        currentMemory,

                    reply:
"✈️ Opening Flight Booking..."

                };

            }

        }


        // -------------------------
        // DEFAULT
        // -------------------------

        return {

            intent,
            entities,

            memory:
                memoryStore.getAll(),

            reply:
"😊 I'm still learning how to help with that."

        };

    }

}


const djgstAI =
    new DJGSTAI();


export default djgstAI;
