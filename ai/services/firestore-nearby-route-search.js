/**
 * =====================================
 * DJGST AI
 * Firestore Nearby Route Search
 * =====================================
 *
 * Finds nearby alternative routes ONLY
 * when Firestore confirms that an ACTIVE
 * bus exists on that route.
 *
 * The buses found here are returned along
 * with the route so AI does not need to
 * search Firestore again after the user
 * selects a route.
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
// NORMALIZE
// =====================================

function normalizeCity(city) {

    return String(city || "")
        .trim()
        .toLowerCase();

}


// =====================================
// SEARCH ACTIVE BUSES
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
            `❌ Firestore nearby bus search failed: ${from} → ${to}`,
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


    if (
        !requestedFrom ||
        !requestedTo
    ) {

        return [];

    }


    console.log(
        `📍 Searching nearby alternatives:
        ${requestedFrom} → ${requestedTo}`
    );


    const nearby =
        nearbyCities[
            requestedFrom
        ] || [];


    if (
        nearby.length === 0
    ) {

        console.log(
            `ℹ️ No nearby cities known for ${requestedFrom}`
        );

        return [];

    }


    const results = [];


    // =====================================
    // CHECK EVERY NEARBY CITY
    // =====================================

    for (
        const nearbyCity
        of nearby
    ) {

        // ---------------------------------
        // OPTION A
        //
        // Nearby city → destination
        //
        // Example:
        // Anakapalle → Vizag
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
                    `${nearbyCity} is near ${requestedFrom}.`,

                buses:
                    busesFromNearby

            });

        }


        // ---------------------------------
        // OPTION B
        //
        // Origin → nearby city
        //
        // Example:
        // Rajahmundry → Anakapalle
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
                    `Buses are available from ${requestedFrom} to nearby ${nearbyCity}.`,

                buses:
                    busesToNearby

            });

        }

    }


    // =====================================
    // REMOVE DUPLICATES
    // =====================================

    const uniqueRoutes = [];

    const seen = new Set();


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


    console.log(
        "✅ Nearby routes with verified buses:",
        uniqueRoutes
    );


    return uniqueRoutes;

}


export default findNearbyRoutes;
