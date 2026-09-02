/**
 * =====================================
 * DJGST AI Firestore Bus Search
 * =====================================
 *
 * Searches buses from Firestore.
 *
 * Firestore is the source of truth.
 *
 * The search:
 *
 * 1. Reads busRoutes.
 * 2. Normalizes city names.
 * 3. Supports city aliases.
 * 4. Checks active status safely.
 * 5. Filters the requested FROM → TO route.
 *
 * =====================================
 */

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "../../firebase-config.js";


/**
 * =====================================
 * NORMALIZE CITY
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
 * NORMALIZE CITY FOR SEARCH
 * =====================================
 *
 * Converts different names for the same
 * city into one standard search value.
 * =====================================
 */

function normalizeCityForSearch(value) {

    const city =
        normalizeCity(value);


    const aliases = {

        // -------------------------------
        // VIZAG
        // -------------------------------

        "vizag":
            "vizag",

        "visakhapatnam":
            "vizag",

        "vizag city":
            "vizag",


        // -------------------------------
        // RAJAHMUNDRY
        // -------------------------------

        "rajahmundry":
            "rajahmundry",

        "rajamahendravaram":
            "rajahmundry",


        // -------------------------------
        // VIJAYAWADA
        // -------------------------------

        "vijayawada":
            "vijayawada",


        // -------------------------------
        // HYDERABAD
        // -------------------------------

        "hyderabad":
            "hyderabad",


        // -------------------------------
        // TIRUPATI
        // -------------------------------

        "tirupati":
            "tirupati",


        // -------------------------------
        // CHENNAI
        // -------------------------------

        "chennai":
            "chennai",


        // -------------------------------
        // BANGALORE
        // -------------------------------

        "bangalore":
            "bangalore",

        "bengaluru":
            "bangalore",


        // -------------------------------
        // DELHI
        // -------------------------------

        "delhi":
            "delhi",


        // -------------------------------
        // MUMBAI
        // -------------------------------

        "mumbai":
            "mumbai",


        // -------------------------------
        // ANAKAPALLE
        // -------------------------------

        "anakapalle":
            "anakapalle",

        "anakapalli":
            "anakapalle",


        // -------------------------------
        // SAMALKOTA
        // -------------------------------

        "samalkota":
            "samalkota",

        "samalkot":
            "samalkota"

    };


    return aliases[city] || city;

}


/**
 * =====================================
 * NORMALIZE ACTIVE VALUE
 * =====================================
 *
 * Firestore should ideally contain:
 *
 * active: true
 *
 * But this also safely handles:
 *
 * active: "true"
 *
 * =====================================
 */

function isActiveBus(value) {

    if (value === true) {

        return true;

    }


    if (
        typeof value === "string" &&
        value.trim().toLowerCase() === "true"
    ) {

        return true;

    }


    return false;

}


/**
 * =====================================
 * CONVERT FIRESTORE BUS
 * =====================================
 */

function convertBus(doc) {

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
            isActiveBus(
                data.active
            )

    };

}


/**
 * =====================================
 * SEARCH BUSES
 * =====================================
 */

async function searchBuses(memory) {

    try {

        // =================================
        // REQUESTED ROUTE
        // =================================

        const requestedFrom =
            normalizeCityForSearch(
                memory?.from
            );


        const requestedTo =
            normalizeCityForSearch(
                memory?.to
            );


        console.log(
            "====================================="
        );

        console.log(
            "🔎 DJGST AI FIRESTORE BUS SEARCH"
        );

        console.log(
            "📍 Requested FROM:",
            memory?.from
        );

        console.log(
            "📍 Requested TO:",
            memory?.to
        );

        console.log(
            "📍 Normalized FROM:",
            requestedFrom
        );

        console.log(
            "📍 Normalized TO:",
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
        // GET ALL BUS DOCUMENTS
        // =================================
        //
        // We intentionally don't put
        // from/to/active in the Firestore
        // query.
        //
        // This gives us maximum flexibility
        // for city aliases and existing data.
        // =================================

        const snapshot =
            await getDocs(
                busesRef
            );


        console.log(
            "📦 Total Firestore bus documents:",
            snapshot.size
        );


        // =================================
        // CONVERT DOCUMENTS
        // =================================

        const allBuses =
            snapshot.docs.map(
                convertBus
            );


        console.log(
            "🚌 All Firestore buses:",
            allBuses
        );


        // =================================
        // ACTIVE BUSES
        // =================================

        const activeBuses =
            allBuses.filter(
                bus =>
                    bus.active === true
            );


        console.log(
            "🟢 Active buses:",
            activeBuses
        );


        // =================================
        // FILTER REQUESTED ROUTE
        // =================================

        const matchingBuses =
            activeBuses.filter(
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
                        `🔍 Checking:
${bus.from} → ${bus.to}`,
                        `| Normalized:
${busFrom} → ${busTo}`,
                        `| FROM: ${matchesFrom}`,
                        `| TO: ${matchesTo}`
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
            "====================================="
        );

        console.log(
            `✅ MATCHING BUSES:
${requestedFrom} → ${requestedTo}`
        );

        console.log(
            matchingBuses
        );

        console.log(
            "====================================="
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
