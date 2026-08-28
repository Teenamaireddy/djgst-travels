/**
 * =====================================
 * DJGST AI Firestore Nearby Route Search
 * =====================================
 *
 * Finds nearby alternative routes by:
 *
 * 1. Checking our known nearby-city
 *    relationships.
 *
 * 2. Checking Firestore to make sure
 *    an ACTIVE bus actually exists
 *    on that alternative route.
 *
 * Therefore AI never suggests a route
 * that has no available bus.
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
// These are geographical relationships.
// Firestore decides whether buses actually
// exist for the suggested route.
//
// Example:
//
// Rajahmundry
//      ↓
// Anakapalle
// Samalkota
//
// Gadarada
//      ↓
// Narasapuram
//

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
// NORMALIZE CITY NAME
// =====================================

function normalizeCity(city) {

    return String(city || "")
        .trim()
        .toLowerCase();

}


// =====================================
// SEARCH FIRESTORE FOR ACTIVE BUSES
// =====================================

async function searchActiveBuses(from, to) {

    try {

        const busesRef =
            collection(
                db,
                "busRoutes"
            );


        const q =
            query(

                busesRef,

                where(
                    "from",
                    "==",
                    from
                ),

                where(
                    "to",
                    "==",
                    to
                ),

                where(
                    "active",
                    "==",
                    true
                )

            );


        const snapshot =
            await getDocs(q);


        return snapshot.docs.map(
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
                        data.price ?? 0,

                    active:
                        data.active !== false

                };

            }
        );

    }

    catch (error) {

        console.error(
            `❌ Firestore route search failed: ${from} → ${to}`,
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
        `📍 Nearby route search:
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
            `ℹ️ No nearby-city data for ${requestedFrom}`
        );

        return [];

    }


    console.log(
        "📍 Nearby cities:",
        nearby
    );


    // =================================
    // CHECK EACH POSSIBLE ROUTE
    // =================================
    //
    // Important:
    //
    // We do NOT simply suggest:
    //
    // Rajahmundry → Anakapalle
    //
    // We check whether:
    //
    // Anakapalle → Vizag
    //
    // actually has an active bus.
    //
    // =================================

    const results = [];


    for (
        const nearbyCity
        of nearby
    ) {


        // ---------------------------------
        // OPTION A
        //
        // Nearby city → requested destination
        //
        // Example:
        //
        // Anakapalle → Vizag
        // Samalkota → Vizag
        // ---------------------------------

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


        // ---------------------------------
        // OPTION B
        //
        // Requested origin → nearby city
        //
        // Example:
        //
        // Rajahmundry → Anakapalle
        //
        // This is also useful when the
        // actual bus goes toward the nearby
        // city rather than from it.
        // ---------------------------------

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
    // REMOVE DUPLICATE ROUTES
    // =================================

    const uniqueRoutes =
        [];

    const seen =
        new Set();


    results.forEach(
        route => {

            const key =
                `${route.from}→${route.to}`;


            if (
                !seen.has(key)
            ) {

                seen.add(key);

                uniqueRoutes.push(
                    route
                );

            }

        }
    );


    // =================================
    // LOG FINAL RESULTS
    // =================================

    console.log(
        "✅ Nearby routes with ACTIVE buses:",
        uniqueRoutes
    );


    return uniqueRoutes;

}


export default findNearbyRoutes;
