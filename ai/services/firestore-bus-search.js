/**
 * =====================================
 * DJGST AI Firestore Bus Search
 * =====================================
 *
 * Searches active buses from Firestore.
 *
 * IMPORTANT:
 * We intentionally fetch active buses first
 * and filter the route in JavaScript.
 *
 * This avoids problems caused by compound
 * Firestore queries/indexes and also allows
 * flexible city-name matching.
 * =====================================
 */

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { db } from "../../firebase-config.js";


/**
 * =====================================
 * NORMALIZE CITY NAME
 * =====================================
 */

function normalizeCity(value) {

    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

}


/**
 * =====================================
 * CITY ALIASES
 * =====================================
 *
 * Allows DJGST AI to understand common
 * names such as Vizag / Visakhapatnam.
 * =====================================
 */

function normalizeCityForSearch(value) {

    const city =
        normalizeCity(value);


    const aliases = {

        "vizag":
            "vizag",

        "visakhapatnam":
            "vizag",

        "vizag city":
            "vizag",

        "rajahmundry":
            "rajahmundry",

        "rajamahendravaram":
            "rajahmundry",

        "vijayawada":
            "vijayawada",

        "hyderabad":
            "hyderabad",

        "tirupati":
            "tirupati",

        "chennai":
            "chennai",

        "bangalore":
            "bangalore",

        "bengaluru":
            "bangalore",

        "delhi":
            "delhi",

        "mumbai":
            "mumbai"

    };


    return aliases[city] || city;

}


/**
 * =====================================
 * SEARCH BUSES
 * =====================================
 */

async function searchBuses(memory) {

    try {

        const requestedFrom =
            normalizeCityForSearch(
                memory?.from
            );


        const requestedTo =
            normalizeCityForSearch(
                memory?.to
            );


        console.log(
            "🔎 DJGST AI Firestore Search"
        );

        console.log(
            "📍 Requested FROM:",
            requestedFrom
        );

        console.log(
            "📍 Requested TO:",
            requestedTo
        );


        // =================================
        // VALIDATION
        // =================================

        if (
            !requestedFrom ||
            !requestedTo
        ) {

            console.warn(
                "⚠️ Missing FROM or TO"
            );

            return [];

        }


        // =================================
        // FIRESTORE COLLECTION
        // =================================

        const busesRef =
            collection(
                db,
                "busRoutes"
            );


        // =================================
        // GET ACTIVE BUSES
        // =================================
        //
        // Only ONE Firestore where clause.
        // This avoids compound-query/index
        // problems.
        // =================================

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
                            data.id ?? doc.id,

                        name:
                            data.name || "",

                        type:
                            data.type || "",

                        from:
                            normalizeCity(
                                data.from
                            ),

                        to:
                            normalizeCity(
                                data.to
                            ),

                        departure:
                            data.departure || "",

                        arrival:
                            data.arrival || "",

                        price:
                            Number(
                                data.price ?? 0
                            ),

                        active:
                            data.active === true

                    };

                }
            );


        console.log(
            "🚌 All active buses:",
            allBuses
        );


        // =================================
        // FILTER REQUESTED ROUTE
        // =================================

        const matchingBuses =
            allBuses.filter(
                bus => {

                    const busFrom =
                        normalizeCityForSearch(
                            bus.from
                        );

                    const busTo =
                        normalizeCityForSearch(
                            bus.to
                        );


                    const matchesFrom =
                        busFrom ===
                        requestedFrom;


                    const matchesTo =
                        busTo ===
                        requestedTo;


                    console.log(
                        `🔍 ${busFrom} → ${busTo}`,
                        "FROM:",
                        matchesFrom,
                        "TO:",
                        matchesTo
                    );


                    return (
                        matchesFrom &&
                        matchesTo
                    );

                }
            );


        // =================================
        // RESULT
        // =================================

        console.log(
            `✅ Matching buses for ${requestedFrom} → ${requestedTo}:`,
            matchingBuses
        );


        return matchingBuses;

    }

    catch (error) {

        console.error(
            "❌ DJGST AI Firestore Bus Search FAILED"
        );

        console.error(
            "Error code:",
            error?.code
        );

        console.error(
            "Error message:",
            error?.message
        );

        console.error(
            "Full error:",
            error
        );


        return [];

    }

}


/**
 * =====================================
 * EXPORT
 * =====================================
 */

export default {

    search:
        searchBuses

};
