/**
 * =====================================
 * DJGST AI Firestore Bus Search
 * =====================================
 *
 * Searches buses directly from Firestore.
 *
 * IMPORTANT:
 * We intentionally query only ACTIVE buses
 * from Firestore and perform route matching
 * in JavaScript.
 *
 * This avoids Firestore composite-index
 * problems with:
 *
 * from + to + active
 *
 * =====================================
 */

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "../../firebase-config.js";


// =====================================
// NORMALIZE CITY NAME
// =====================================

function normalizeCity(city) {

    if (!city) {
        return "";
    }

    let value =
        String(city)
            .trim()
            .toLowerCase();

    // Common city aliases
    const aliases = {

        "visakhapatnam": "vizag",
        "vizag city": "vizag",

        "rajahmundry city": "rajahmundry",
        "rajamahendravaram": "rajahmundry",

        "vijayawada city": "vijayawada",

        "hyderabad city": "hyderabad",

        "tirupati city": "tirupati",

        "bangalore": "bangalore",
        "bengaluru": "bangalore",

        "chennai city": "chennai"

    };

    return aliases[value] || value;

}


// =====================================
// SEARCH BUSES
// =====================================

async function searchBuses(memory = {}) {

    try {

        // ---------------------------------
        // Requested route
        // ---------------------------------

        const requestedFrom =
            normalizeCity(
                memory.from
            );

        const requestedTo =
            normalizeCity(
                memory.to
            );


        // ---------------------------------
        // Validate
        // ---------------------------------

        if (
            !requestedFrom ||
            !requestedTo
        ) {

            console.warn(
                "⚠️ Firestore Bus Search: Missing route",
                {
                    from: memory.from,
                    to: memory.to
                }
            );

            return [];

        }


        console.log(
            "====================================="
        );

        console.log(
            "🔎 DJGST AI FIRESTORE BUS SEARCH"
        );

        console.log(
            "Requested FROM:",
            requestedFrom
        );

        console.log(
            "Requested TO:",
            requestedTo
        );

        console.log(
            "====================================="
        );


        // =================================
        // GET ACTIVE BUSES
        // =================================

        const busesRef =
            collection(
                db,
                "busRoutes"
            );


        /*
         * IMPORTANT:
         *
         * We query ONLY active == true.
         *
         * We do NOT query:
         *
         * where("from", ...)
         * where("to", ...)
         * where("active", ...)
         *
         * together.
         *
         * This prevents composite-index problems.
         */

        const activeQuery =
            query(
                busesRef,
                where(
                    "active",
                    "==",
                    true
                )
            );


        const snapshot =
            await getDocs(
                activeQuery
            );


        console.log(
            "📦 Firestore documents:",
            snapshot.size
        );


        // =================================
        // CONVERT FIRESTORE DATA
        // =================================

        const allBuses =
            snapshot.docs.map(
                doc => {

                    const data =
                        doc.data();

                    return {

                        id:
                            data.id ??
                            doc.id,

                        name:
                            data.name ||
                            "Unknown Bus",

                        type:
                            data.type ||
                            "Bus",

                        from:
                            normalizeCity(
                                data.from
                            ),

                        to:
                            normalizeCity(
                                data.to
                            ),

                        departure:
                            data.departure ||
                            "",

                        arrival:
                            data.arrival ||
                            "",

                        price:
                            Number(
                                data.price ?? 0
                            ),

                        active:
                            data.active !== false

                    };

                }
            );


        console.log(
            "🚌 ALL ACTIVE BUSES:",
            allBuses
        );


        // =================================
        // FILTER REQUESTED ROUTE
        // =================================

        const matchingBuses =
            allBuses.filter(
                bus => {

                    return (

                        bus.active === true &&

                        bus.from ===
                            requestedFrom &&

                        bus.to ===
                            requestedTo

                    );

                }
            );


        // =================================
        // LOG RESULT
        // =================================

        console.log(
            "🎯 MATCHING BUSES:",
            matchingBuses
        );


        if (
            matchingBuses.length > 0
        ) {

            console.log(
                `✅ ${matchingBuses.length} bus(es) found for ${requestedFrom} → ${requestedTo}`
            );

        } else {

            console.warn(
                `⚠️ No active buses found for ${requestedFrom} → ${requestedTo}`
            );

            console.log(
                "Available routes in Firestore:"
            );


            // Show available routes in console
            const routeSet =
                new Set();


            allBuses.forEach(
                bus => {

                    routeSet.add(
                        `${bus.from} → ${bus.to}`
                    );

                }
            );


            console.log(
                Array.from(routeSet)
            );

        }


        return matchingBuses;

    }

    catch (error) {

        console.error(
            "❌ FIRESTORE BUS SEARCH FAILED"
        );

        console.error(
            error
        );


        // Very important:
        // Don't hide the actual Firebase error.

        return [];

    }

}


// =====================================
// EXPORT
// =====================================

export default {

    search:
        searchBuses

};
