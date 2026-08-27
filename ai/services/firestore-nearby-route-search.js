/**
 * =====================================
 * DJGST AI Firestore Nearby Route Search
 * =====================================
 *
 * Finds nearby alternative routes that
 * actually have ACTIVE buses in Firestore.
 *
 * Important:
 * This does NOT blindly suggest routes.
 * Every returned route comes from an active
 * bus currently stored in Firestore.
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
 * Find alternative bus routes based on
 * routes that actually exist in Firestore.
 *
 * @param {string} from
 * @param {string} to
 * @returns {Promise<Array>}
 */
async function findNearbyRoutes(from, to) {

    try {

        // =====================================
        // STEP 1 : NORMALIZE REQUESTED ROUTE
        // =====================================

        const requestedFrom =
            String(from || "")
                .trim()
                .toLowerCase();

        const requestedTo =
            String(to || "")
                .trim()
                .toLowerCase();


        if (
            !requestedFrom ||
            !requestedTo
        ) {

            console.warn(
                "⚠️ Nearby Route Search: Missing from/to"
            );

            return [];

        }


        console.log(
            `🔎 Finding Firestore alternatives for: ${requestedFrom} → ${requestedTo}`
        );


        // =====================================
        // STEP 2 : GET ACTIVE BUSES
        // =====================================

        const busesRef =
            collection(
                db,
                "busRoutes"
            );


        const activeBusQuery =
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
                activeBusQuery
            );


        // =====================================
        // STEP 3 : CONVERT FIRESTORE DATA
        // =====================================

        const buses =
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
                            String(
                                data.from || ""
                            )
                                .trim()
                                .toLowerCase(),

                        to:
                            String(
                                data.to || ""
                            )
                                .trim()
                                .toLowerCase(),

                        departure:
                            data.departure || "",

                        arrival:
                            data.arrival || "",

                        price:
                            data.price ?? 0,

                        active:
                            data.active === true

                    };

                }
            );


        console.log(
            `🚌 Active Firestore buses found: ${buses.length}`
        );


        // =====================================
        // STEP 4 : CREATE UNIQUE BUS ROUTES
        // =====================================

        const routeMap =
            new Map();


        buses.forEach(
            bus => {

                // Ignore incomplete Firestore records
                if (
                    !bus.from ||
                    !bus.to
                ) {

                    return;

                }


                // Never suggest the exact route
                if (
                    bus.from === requestedFrom &&
                    bus.to === requestedTo
                ) {

                    return;

                }


                const routeKey =
                    `${bus.from}→${bus.to}`;


                if (
                    !routeMap.has(
                        routeKey
                    )
                ) {

                    routeMap.set(
                        routeKey,
                        {

                            from:
                                bus.from,

                            to:
                                bus.to,

                            buses: []

                        }
                    );

                }


                routeMap
                    .get(routeKey)
                    .buses
                    .push(bus);

            }
        );


        // =====================================
        // STEP 5 : FIND RELEVANT ALTERNATIVES
        // =====================================
        //
        // Example:
        //
        // User:
        // Rajahmundry → Vizag
        //
        // Firestore:
        // Anakapalle → Vizag
        // Samalkota → Vizag
        //
        // These can be suggested because:
        //
        //     alternative.to === requested.to
        //
        // OR
        //
        //     alternative.from === requested.from
        //
        // =====================================

        const nearbyRoutes =
            Array.from(
                routeMap.values()
            )
            .filter(
                route => {

                    return (

                        route.from ===
                            requestedFrom

                        ||

                        route.to ===
                            requestedTo

                    );

                }
            );


        // =====================================
        // STEP 6 : CONVERT TO AI-FRIENDLY DATA
        // =====================================

        const results =
            nearbyRoutes.map(
                route => {

                    return {

                        from:
                            route.from,

                        to:
                            route.to,

                        reason:
                            `Active buses available on ${route.from} → ${route.to}`,

                        buses:
                            route.buses

                    };

                }
            );


        console.log(
            "📍 Firestore nearby routes:",
            results
        );


        // =====================================
        // STEP 7 : RETURN RESULTS
        // =====================================

        return results;

    }

    catch (error) {

        console.error(
            "❌ Firestore Nearby Route Search Error:",
            error
        );

        return [];

    }

}


// =====================================
// EXPORT
// =====================================

export default findNearbyRoutes;
