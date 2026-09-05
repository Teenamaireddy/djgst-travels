/**
 * =====================================
 * DJGST AI Firestore Bus Search
 * =====================================
 *
 * Robust route search.
 *
 * We fetch ALL busRoutes documents and
 * filter them in JavaScript.
 *
 * This makes the search tolerant of:
 *
 * Samalkota / samalkota
 * Vizag / vizag / Visakhapatnam
 * extra spaces
 * active boolean/string differences
 *
 * =====================================
 */

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { db } from "../../firebase-config.js";


/**
 * =====================================
 * NORMALIZE TEXT
 * =====================================
 */

function normalize(value) {

    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

}


/**
 * =====================================
 * NORMALIZE CITY
 * =====================================
 */

function normalizeCity(value) {

    const city = normalize(value);

    const aliases = {

        // Vizag
        "vizag": "vizag",
        "visakhapatnam": "vizag",
        "vizag city": "vizag",

        // Rajahmundry
        "rajahmundry": "rajahmundry",
        "rajamahendravaram": "rajahmundry",

        // Other cities
        "samalkota": "samalkota",
        "anakapalle": "anakapalle",
        "vijayawada": "vijayawada",
        "hyderabad": "hyderabad",
        "tirupati": "tirupati",
        "chennai": "chennai",
        "bangalore": "bangalore",
        "bengaluru": "bangalore",
        "delhi": "delhi",
        "mumbai": "mumbai"

    };

    return aliases[city] || city;

}


/**
 * =====================================
 * CHECK ACTIVE VALUE
 * =====================================
 *
 * Normally active is boolean true.
 *
 * We also accept "true" just in case
 * an older document was stored as text.
 * =====================================
 */

function isActive(value) {

    return (
        value === true ||
        normalize(value) === "true"
    );

}


/**
 * =====================================
 * SEARCH BUSES
 * =====================================
 */

async function searchBuses(memory) {

    try {

        console.log(
            "====================================="
        );

        console.log(
            "🔎 DJGST AI BUS SEARCH STARTED"
        );

        console.log(
            "====================================="
        );


        /**
         * ---------------------------------
         * REQUESTED ROUTE
         * ---------------------------------
         */

        const requestedFrom =
            normalizeCity(
                memory?.from
            );


        const requestedTo =
            normalizeCity(
                memory?.to
            );


        console.log(
            "📍 Requested FROM:",
            requestedFrom
        );

        console.log(
            "📍 Requested TO:",
            requestedTo
        );


        /**
         * ---------------------------------
         * VALIDATION
         * ---------------------------------
         */

        if (
            !requestedFrom ||
            !requestedTo
        ) {

            console.error(
                "❌ FROM or TO is missing"
            );

            return [];

        }


        /**
         * ---------------------------------
         * FIRESTORE COLLECTION
         * ---------------------------------
         */

        const busesRef =
            collection(
                db,
                "busRoutes"
            );


        /**
         * ---------------------------------
         * GET ALL BUS ROUTES
         * ---------------------------------
         *
         * IMPORTANT:
         *
         * We intentionally DON'T use:
         *
         * where("active", "==", true)
         *
         * We inspect active ourselves.
         * ---------------------------------
         */

        console.log(
            "🔥 Reading collection: busRoutes"
        );


        const snapshot =
            await getDocs(
                busesRef
            );


        console.log(
            "📦 Firestore documents found:",
            snapshot.size
        );


        /**
         * ---------------------------------
         * NO DOCUMENTS
         * ---------------------------------
         */

        if (snapshot.empty) {

            console.error(
                "❌ busRoutes collection returned ZERO documents"
            );

            return [];

        }


        /**
         * ---------------------------------
         * CONVERT DOCUMENTS
         * ---------------------------------
         */

        const allBuses =
            snapshot.docs.map(
                doc => {

                    const data =
                        doc.data();


                    const bus = {

                        firestoreId:
                            doc.id,

                        id:
                            data.id ?? doc.id,

                        name:
                            String(
                                data.name ?? ""
                            ).trim(),

                        type:
                            String(
                                data.type ?? ""
                            ).trim(),

                        from:
                            String(
                                data.from ?? ""
                            ).trim(),

                        to:
                            String(
                                data.to ?? ""
                            ).trim(),

                        departure:
                            String(
                                data.departure ?? ""
                            ).trim(),

                        arrival:
                            String(
                                data.arrival ?? ""
                            ).trim(),

                        price:
                            Number(
                                data.price ?? 0
                            ),

                        active:
                            isActive(
                                data.active
                            )

                    };


                    console.log(
                        "🚌 Firestore BUS:",
                        bus
                    );


                    return bus;

                }
            );


        /**
         * ---------------------------------
         * ACTIVE BUSES
         * ---------------------------------
         */

        const activeBuses =
            allBuses.filter(
                bus =>
                    bus.active === true
            );


        console.log(
            "🟢 Active buses:",
            activeBuses.length
        );


        /**
         * ---------------------------------
         * ROUTE MATCHING
         * ---------------------------------
         */

        const matchingBuses =
            activeBuses.filter(
                bus => {

                    const busFrom =
                        normalizeCity(
                            bus.from
                        );

                    const busTo =
                        normalizeCity(
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
${bus.from} → ${bus.to}

Normalized:
${busFrom} → ${busTo}

Requested:
${requestedFrom} → ${requestedTo}

FROM MATCH: ${matchesFrom}
TO MATCH: ${matchesTo}
ACTIVE: ${bus.active}
`
                    );


                    return (
                        matchesFrom &&
                        matchesTo
                    );

                }
            );


        /**
         * ---------------------------------
         * RESULT
         * ---------------------------------
         */

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
            "====================================="
        );

        console.error(
            "❌ DJGST AI BUS SEARCH FAILED"
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

        console.error(
            "====================================="
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
