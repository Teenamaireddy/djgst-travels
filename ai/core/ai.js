/**
 * =====================================
 * DJGST AI Core
 * Main Coordinator
 * =====================================
 */

import findNearbyRoutes from "../services/firestore-nearby-route-search.js";
import selectBus from "../actions/select-bus.js";
import busSearch from "../services/firestore-bus-search.js";

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


        // =====================================
        // STEP 0 : CURRENT MEMORY
        // =====================================

        let memory =
            memoryStore.getAll();

        const trimmedMessage =
            String(userMessage || "").trim();

        const lowerMessage =
            trimmedMessage.toLowerCase();


        // =====================================
        // STEP 0.5 : NEW BOOKING REQUEST
        // =====================================
        //
        // If the user explicitly gives a new
        // FROM / TO route, don't allow an old
        // booking route to remain in memory.
        //
        // Example:
        //
        // Old:
        // Rajahmundry → Vizag
        //
        // New:
        // Samalkota → Vizag
        //
        // The new route must win.
        // =====================================

        const hasExplicitRoute =
            /\bfrom\b[\s\S]*\bto\b/i.test(
                trimmedMessage
            );


        if (hasExplicitRoute) {

            console.log(
                "🔄 New explicit route detected."
            );


            // Clear old route-related state.

            memoryStore.save(
                "from",
                null
            );

            memoryStore.save(
                "to",
                null
            );

            memoryStore.save(
                "availableBuses",
                []
            );

            memoryStore.save(
                "pendingNearbyRoutes",
                []
            );

            memoryStore.save(
                "selectedBus",
                null
            );

            memoryStore.save(
                "selectedSeat",
                null
            );

            memoryStore.save(
                "bookingStage",
                "start"
            );


            // Refresh memory.

            memory =
                memoryStore.getAll();

        }


        // =====================================
        // STEP 1 : NEARBY ROUTE CONFIRMATION
        // =====================================

        const pendingRoutes =
            memoryStore.get(
                "pendingNearbyRoutes"
            );


        const confirmationWords = [

            "yes",
            "yeah",
            "yep",
            "sure",
            "okay",
            "ok",
            "yes please",
            "check it",
            "check them",
            "check",
            "search it",
            "search them",
            "search",
            "go ahead",
            "do it",
            "please do",
            "please check"

        ];


        const wantsNearbyRoutes =
            confirmationWords.includes(
                lowerMessage
            );


        if (
            wantsNearbyRoutes &&
            Array.isArray(pendingRoutes) &&
            pendingRoutes.length > 0
        ) {

            memoryStore.save(
                "bookingStage",
                "nearby_route_selection"
            );


            let reply =
`👍 Sure! Here are the nearby route options:

`;


            pendingRoutes.forEach(
                (route, index) => {

                    reply +=
`${index + 1}. ${route.from} ➜ ${route.to}
📍 ${route.reason}

`;

                }
            );


            reply +=
`Reply with the route number you'd like me to search.`;


            return {

                intent: {
                    intent:
                        "select_nearby_route"
                },

                entities: {},

                memory:
                    memoryStore.getAll(),

                reply

            };

        }


        // =====================================
        // STEP 2 : NEARBY ROUTE NUMBER SELECTION
        // =====================================

        if (
            memoryStore.get("bookingStage") ===
            "nearby_route_selection"
        ) {

            const routes =
                Array.isArray(pendingRoutes)
                    ? pendingRoutes
                    : [];


            if (
                /^[1-9]\d*$/.test(
                    trimmedMessage
                )
            ) {

                const routeNumber =
                    Number(trimmedMessage);


                if (
                    routeNumber >= 1 &&
                    routeNumber <= routes.length
                ) {

                    const selectedRoute =
                        routes[
                            routeNumber - 1
                        ];


                    console.log(
                        "📍 Selected nearby route:",
                        selectedRoute
                    );


                    memoryStore.save(
                        "from",
                        selectedRoute.from
                    );


                    memoryStore.save(
                        "to",
                        selectedRoute.to
                    );


                    memoryStore.save(
                        "pendingNearbyRoutes",
                        []
                    );


                    // =================================
                    // IMPORTANT:
                    // Nearby-route search already found
                    // real ACTIVE Firestore buses.
                    //
                    // Use those buses directly.
                    // =================================

                    const buses =
                        Array.isArray(
                            selectedRoute.buses
                        )
                            ? selectedRoute.buses
                            : [];


                    if (
                        buses.length === 0
                    ) {

                        memoryStore.save(
                            "bookingStage",
                            "start"
                        );


                        return {

                            intent: {
                                intent:
                                    "select_nearby_route"
                            },

                            entities: {},

                            memory:
                                memoryStore.getAll(),

                            reply:
`😔 Sorry!

I couldn't find buses for:

📍 ${selectedRoute.from}
➜ ${selectedRoute.to}

Let's try another route.`

                        };

                    }


                    memoryStore.save(
                        "availableBuses",
                        buses
                    );


                    memoryStore.save(
                        "bookingStage",
                        "bus_selection"
                    );


                    let reply =
`✅ Route selected!

📍 ${selectedRoute.from}
➜ ${selectedRoute.to}

🚌 I found ${buses.length} buses:

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

                        intent: {
                            intent:
                                "book_ticket"
                        },

                        entities: {},

                        memory:
                            memoryStore.getAll(),

                        reply

                    };

                }


                return {

                    intent: {
                        intent:
                            "select_nearby_route"
                    },

                    entities: {},

                    memory:
                        memoryStore.getAll(),

                    reply:
`❌ Invalid route number.

Please choose a number from 1 to ${routes.length}.`

                };

            }


            return {

                intent: {
                    intent:
                        "select_nearby_route"
                },

                entities: {},

                memory:
                    memoryStore.getAll(),

                reply:
`📍 Please choose one of the nearby routes.

Reply with a number from 1 to ${routes.length}.`

            };

        }


        // =====================================
        // STEP 3 : BUS SELECTION
        // =====================================

        if (
            memoryStore.get("bookingStage") ===
            "bus_selection"
        ) {

            if (
                /^[1-9]\d*$/.test(
                    trimmedMessage
                )
            ) {

                const selectedBus =
                    parseBus(
                        trimmedMessage,
                        memoryStore.getAll()
                    );


                if (!selectedBus) {

                    return {

                        intent: {
                            intent:
                                "bus_selected"
                        },

                        entities: {},

                        memory:
                            memoryStore.getAll(),

                        reply:
`❌ Invalid bus number.

Please choose a valid bus.`

                    };

                }


                console.log(
                    "🚌 Selected bus:",
                    selectedBus
                );


                memoryStore.save(
                    "selectedBus",
                    selectedBus
                );


                memoryStore.save(
                    "bookingStage",
                    "seat_selection"
                );


                return {

                    intent: {
                        intent:
                            "bus_selected"
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


            const selectedBusByName =
                parseBus(
                    trimmedMessage,
                    memoryStore.getAll()
                );


            if (
                selectedBusByName
            ) {

                console.log(
                    "🚌 Selected bus by name:",
                    selectedBusByName
                );


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
                        intent:
                            "bus_selected"
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


            return {

                intent: {
                    intent:
                        "bus_selection"
                },

                entities: {},

                memory:
                    memoryStore.getAll(),

                reply:
`🚌 Please select a bus by:

• Bus number
OR
• Bus name

Example:
1
Orange Travels
Book VRL`

            };

        }


        // =====================================
        // STEP 4 : YES = USE PREVIOUS DATE
        // =====================================

        if (
            lowerMessage === "yes" &&
            memory.date
        ) {

            userMessage +=
                " " + memory.date;

        }


        // =====================================
        // STEP 5 : DETECT INTENT
        // =====================================

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


        // =====================================
        // STEP 6 : EXTRACT ENTITIES
        // =====================================

        const entities =
            entityEngine.extract(
                userMessage
            );


        console.log(
            "📦 Entities:",
            entities
        );


        // =====================================
        // STEP 7 : SAVE ENTITIES
        // =====================================

        Object.entries(
            entities
        ).forEach(
            ([key, value]) => {

                if (
                    value !== null &&
                    value !== undefined &&
                    value !== ""
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


        // =====================================
        // STEP 8 : SLOT CHECKING
        // =====================================

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
`🚌 Which transport would you like to book?

Bus, Train or Flight?`

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


        // =====================================
        // STEP 9 : BOOKING
        // =====================================

        if (
            intent.intent ===
            "book_ticket"
        ) {

            const currentMemory =
                memoryStore.getAll();


            // =================================
            // BUS BOOKING
            // =================================

            if (
                currentMemory.transport ===
                "Bus"
            ) {

                const buses =
                    await busSearch.search(
                        currentMemory
                    );


                // =================================
                // NO DIRECT BUS
                // =================================

                if (
                    !Array.isArray(buses) ||
                    buses.length === 0
                ) {

                    console.log(
                        `❌ No direct buses:
${currentMemory.from} → ${currentMemory.to}`
                    );


                    const nearbyRoutes =
                        await findNearbyRoutes(
                            currentMemory.from,
                            currentMemory.to
                        );


                    if (
                        Array.isArray(nearbyRoutes) &&
                        nearbyRoutes.length > 0
                    ) {

                        memoryStore.save(
                            "pendingNearbyRoutes",
                            nearbyRoutes
                        );


                        memoryStore.save(
                            "bookingStage",
                            "start"
                        );


                        let reply =
`😔 I couldn't find a direct bus for:

📍 ${currentMemory.from} ➜ ${currentMemory.to}

💡 But I found some nearby route options:

`;


                        nearbyRoutes.forEach(
                            (route, index) => {

                                reply +=
`${index + 1}. ${route.from} ➜ ${route.to}
📍 ${route.reason}

`;

                            }
                        );


                        reply +=
`Would you like me to search these nearby routes?

You can reply:
• Yes
• Yes please
• Check it
• Go ahead`;


                        return {

                            intent,
                            entities,

                            memory:
                                memoryStore.getAll(),

                            reply

                        };

                    }


                    return {

                        intent,
                        entities,

                        memory:
                            currentMemory,

                        reply:
`😔 Sorry!

I couldn't find buses for:

📍 ${currentMemory.from} ➜ ${currentMemory.to}`

                    };

                }


                // =================================
                // DIRECT BUSES FOUND
                // =================================

                memoryStore.save(
                    "availableBuses",
                    buses
                );


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
1
Orange Travels
Book VRL`;


                return {

                    intent,
                    entities,

                    memory:
                        memoryStore.getAll(),

                    reply

                };

            }


            // =================================
            // TRAIN BOOKING
            // =================================

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


            // =================================
            // FLIGHT BOOKING
            // =================================

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


        // =====================================
        // DEFAULT
        // =====================================

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
