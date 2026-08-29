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
        // STEP 1 : NEARBY ROUTE CONFIRMATION
        // =====================================
        //
        // Example:
        //
        // AI:
        // "I found nearby route options.
        //  Would you like me to search them?"
        //
        // User:
        // "yes please"
        //
        // Then we show the numbered routes.
        //
        // =====================================

        const pendingRoutes =
            memoryStore.get("pendingNearbyRoutes");


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
        //
        // IMPORTANT:
        //
        // If bookingStage is
        // "nearby_route_selection",
        //
        // then "1" means ROUTE #1.
        //
        // It must NOT be interpreted
        // as BUS #1.
        //
        // =====================================

        if (
            memoryStore.get("bookingStage") ===
            "nearby_route_selection"
        ) {

            const routes =
                Array.isArray(pendingRoutes)
                    ? pendingRoutes
                    : [];


            // ---------------------------------
            // User selected a route number
            // ---------------------------------

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


                    // ---------------------------------
                    // Save selected route
                    // ---------------------------------

                    memoryStore.save(
                        "from",
                        selectedRoute.from
                    );


                    memoryStore.save(
                        "to",
                        selectedRoute.to
                    );


                    // ---------------------------------
                    // Clear old suggestions
                    // ---------------------------------

                    memoryStore.save(
                        "pendingNearbyRoutes",
                        []
                    );


                    // ---------------------------------
                    // Search buses for selected route
                    // ---------------------------------

                    const routeMemory =
                        memoryStore.getAll();


                    const buses =
                        await busSearch.search(
                            routeMemory
                        );


                    // ---------------------------------
                    // Safety check
                    // ---------------------------------

                    if (
                        !Array.isArray(buses) ||
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


                    // ---------------------------------
                    // Save buses
                    // ---------------------------------

                    memoryStore.save(
                        "availableBuses",
                        buses
                    );


                    // ---------------------------------
                    // Move to BUS selection
                    // ---------------------------------

                    memoryStore.save(
                        "bookingStage",
                        "bus_selection"
                    );


                    // ---------------------------------
                    // Display buses
                    // ---------------------------------

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
1
Orange Travels
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


                // ---------------------------------
                // Invalid route number
                // ---------------------------------

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


            // ---------------------------------
            // User did not give a number
            // ---------------------------------

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
        //
        // This section runs ONLY when:
        //
        // bookingStage === "bus_selection"
        //
        // Therefore:
        //
        // 1 = bus #1
        // 2 = bus #2
        //
        // =====================================

        if (
            memoryStore.get("bookingStage") ===
            "bus_selection"
        ) {


            // =================================
            // 3A : BUS NUMBER SELECTION
            // =================================

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


                // ---------------------------------
                // Save selected bus
                // ---------------------------------

                memoryStore.save(
                    "selectedBus",
                    selectedBus
                );


                // ---------------------------------
                // Move to seat selection
                // ---------------------------------

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


            // =================================
            // 3B : BUS NAME SELECTION
            // =================================

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


                // ---------------------------------
                // Save selected bus
                // ---------------------------------

                memoryStore.save(
                    "selectedBus",
                    selectedBusByName
                );


                // ---------------------------------
                // Move to seat selection
                // ---------------------------------

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


            // ---------------------------------
            // User is still selecting a bus
            // ---------------------------------

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


        // =====================================
        // CONTINUE PREVIOUS INTENT
        // =====================================

        if (
            intent.intent === "unknown" &&
            memory.intent
        ) {

            intent.intent =
                memory.intent;

        }


        // =====================================
        // SAVE INTENT
        // =====================================

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


                // ---------------------------------
                // TRANSPORT
                // ---------------------------------

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


                // ---------------------------------
                // FROM
                // ---------------------------------

                case "from":

                    return {

                        intent,
                        entities,

                        memory:
                            memoryStore.getAll(),

                        reply:
"📍 Where are you travelling from?"

                    };


                // ---------------------------------
                // TO
                // ---------------------------------

                case "to":

                    return {

                        intent,
                        entities,

                        memory:
                            memoryStore.getAll(),

                        reply:
"📍 Where are you travelling to?"

                    };


                // ---------------------------------
                // DATE
                // ---------------------------------

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


                // ---------------------------------
                // SEARCH FIRESTORE
                // ---------------------------------

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


                    // ---------------------------------
                    // SEARCH NEARBY ROUTES
                    // ---------------------------------

                    const nearbyRoutes =
                        await findNearbyRoutes(
                            currentMemory.from,
                            currentMemory.to
                        );


                    // ---------------------------------
                    // ALTERNATIVES FOUND
                    // ---------------------------------

                    if (
                        Array.isArray(nearbyRoutes) &&
                        nearbyRoutes.length > 0
                    ) {


                        // Save alternatives
                        memoryStore.save(
                            "pendingNearbyRoutes",
                            nearbyRoutes
                        );


                        // ---------------------------------
                        // Reset selection stage
                        // ---------------------------------

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


                    // =================================
                    // NO DIRECT OR NEARBY BUS
                    // =================================

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


                // Save buses
                memoryStore.save(
                    "availableBuses",
                    buses
                );


                // Move to bus selection
                memoryStore.save(
                    "bookingStage",
                    "bus_selection"
                );


                // ---------------------------------
                // Display buses
                // ---------------------------------

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
        // STEP 10 : DEFAULT
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


// =====================================
// CREATE AI
// =====================================

const djgstAI =
    new DJGSTAI();


export default djgstAI;
