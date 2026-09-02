/**
 * =====================================
 * DJGST AI
 * Firestore Nearby Route Search
 * =====================================
 *
 * PURPOSE:
 *
 * Finds suitable nearby alternative routes
 * ONLY when active buses actually exist
 * in Firestore.
 *
 * Example:
 *
 * Rajahmundry → Vizag
 *
 * No direct bus
 *        ↓
 * Check nearby cities
 *        ↓
 * Anakapalle → Vizag
 * Samalkota → Vizag
 *        ↓
 * Check Firestore
 *        ↓
 * Suggest ONLY routes with active buses.
 *
 * IMPORTANT:
 *
 * All bus documents remain inside:
 *
 *      busRoutes
 *
 * We do NOT need a separate alternativeRoutes
 * collection.
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
// KNOWN NEARBY CITY RELATIONSHIPS
// =====================================
//
// These describe geographical alternatives.
//
// Firestore decides whether an actual bus
// exists.
//
// =====================================

const nearbyCities = {

    "rajahmundry": [
        "anakapalle",
        "samalkota"
    ],

    "anakapalle": [
        "rajahmundry"
    ],

    "samalkota": [
        "rajahmundry"
    ],

    "gadarada": [
        "narasapuram"
    ],

    "narasapuram": [
        "gadarada"
    ]

};


// =====================================
// NORMALIZE CITY
// =====================================

function normalizeCity(city) {

    return String(city || "")
        .trim()
        .toLowerCase();

}


// =====================================
// SEARCH ACTIVE BUSES
// =====================================
//
// IMPORTANT CHANGE:
//
// We query ACTIVE buses first.
//
// Then we normalize "from" and "to"
// ourselves.
//
// This means:
//
// "Anakapalle"
// "anakapalle"
// " ANAKAPALLE "
//
// can all be recognized correctly.
//
// =====================================

async function searchActiveBuses(from, to) {

    const requestedFrom =
        normalizeCity(from);

    const requestedTo =
        normalizeCity(to);


    try {

        console.log(
            `🔎 Checking Firestore:
${requestedFrom} → ${requestedTo}`
        );


        const busesRef =
            collection(
                db,
                "busRoutes"
            );


        // ---------------------------------
        // Get active buses
        // ---------------------------------

        const q =
            query(
                busesRef,

                where(
                    "active",
                    "==",
                    true
                )
            );


        const snapshot =
            await getDocs(q);


        console.log(
            `📦 Active bus documents found: ${snapshot.size}`
        );


        // ---------------------------------
        // Normalize + filter locally
        // ---------------------------------

        const matchingBuses =
            snapshot.docs
                .map(doc => {

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
                            data.active !== false

                    };

                })
                .filter(bus => {

                    return (
                        bus.from === requestedFrom &&
                        bus.to === requestedTo &&
                        bus.active === true
                    );

                });


        console.log(
            `🚌 Matching buses for ${requestedFrom} → ${requestedTo}:`,
            matchingBuses
        );


        return matchingBuses;

    }

    catch (error) {

        console.error(
            "❌ Firestore nearby bus search failed:",
            error
        );

        return [];

    }

}


// =====================================
// MAIN FUNCTION
// =====================================

async function findNearbyRoutes(from, to) {

    const requestedFrom =
        normalizeCity(from);

    const requestedTo =
        normalizeCity(to);


    // =================================
    // VALIDATION
    // =================================

    if (
        !requestedFrom ||
        !requestedTo
    ) {

        console.warn(
            "⚠️ Nearby route search: missing from/to"
        );

        return [];

    }


    console.log(
        `📍 Searching nearby alternatives:
${requestedFrom} → ${requestedTo}`
    );


    // =================================
    // FIND NEARBY CITIES
    // =================================

    const nearby =
        nearbyCities[
            requestedFrom
        ] || [];


    if (
        nearby.length === 0
    ) {

        console.log(
            `ℹ️ No nearby-city relationships for ${requestedFrom}`
        );

        return [];

    }


    console.log(
        "📍 Nearby cities:",
        nearby
    );


    // =================================
    // SEARCH POSSIBLE ALTERNATIVES
    // =================================

    const results = [];


    for (
        const nearbyCity
        of nearby
    ) {


        // =================================
        // OPTION A
        //
        // nearby city → destination
        //
        // Example:
        //
        // Anakapalle → Vizag
        //
        // Samalkota → Vizag
        // =================================

        const busesFromNearby =
            await searchActiveBuses(
                nearbyCity,
                requestedTo
            );


        if (
            busesFromNearby.length > 0
        ) {

            results.push({

                from:
                    nearbyCity,

                to:
                    requestedTo,

                reason:
                    `${nearbyCity} is near ${requestedFrom}, and active buses are available to ${requestedTo}.`,

                buses:
                    busesFromNearby

            });

        }


        // =================================
        // OPTION B
        //
        // origin → nearby city
        //
        // Example:
        //
        // Rajahmundry → Anakapalle
        // =================================

        const busesToNearby =
            await searchActiveBuses(
                requestedFrom,
                nearbyCity
            );


        if (
            busesToNearby.length > 0
        ) {

            results.push({

                from:
                    requestedFrom,

                to:
                    nearbyCity,

                reason:
                    `Active buses are available from ${requestedFrom} to nearby ${nearbyCity}.`,

                buses:
                    busesToNearby

            });

        }

    }


    // =================================
    // REMOVE DUPLICATES
    // =================================

    const uniqueRoutes = [];

    const seen = new Set();


    results.forEach(route => {

        const key =
            `${normalizeCity(route.from)}→${normalizeCity(route.to)}`;


        if (
            !seen.has(key)
        ) {

            seen.add(key);

            uniqueRoutes.push(route);

        }

    });


    // =================================
    // FINAL RESULT
    // =================================

    console.log(
        "✅ Nearby routes with ACTIVE buses:",
        uniqueRoutes
    );


    return uniqueRoutes;

}


// =====================================
// EXPORT
// =====================================

export default findNearbyRoutes;
