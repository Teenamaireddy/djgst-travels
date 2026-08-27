/**
 * =====================================
 * DJGST AI Firestore Nearby Route Search
 * =====================================
 *
 * Finds nearby alternative routes that
 * actually have active buses in Firestore.
 * =====================================
 */

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "../../firebase-config.js";


async function findNearbyRoutes(from, to) {

    try {

        const requestedFrom =
            String(from || "")
                .trim()
                .toLowerCase();

        const requestedTo =
            String(to || "")
                .trim()
                .toLowerCase();


        if (!requestedFrom || !requestedTo) {

            console.warn(
                "⚠️ Nearby Route Search: Missing from/to"
            );

            return [];

        }


        console.log(
            `🔎 Finding nearby routes for: ${requestedFrom} → ${requestedTo}`
        );


        // =====================================
        // GET ALL ACTIVE BUS ROUTES
        // =====================================

        const busesRef =
            collection(
                db,
                "busRoutes"
            );


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

                        type:
                            data.type || "",

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


        console.log(
            "🚌 Active Firestore buses:",
            buses
        );


        // =====================================
        // GET UNIQUE ROUTES
        // =====================================

        const routesMap =
            new Map();


        buses.forEach(bus => {

            // Don't suggest the exact same route
            if (
                bus.from === requestedFrom &&
                bus.to === requestedTo
            ) {

                return;

            }


            const routeKey =
                `${bus.from}→${bus.to}`;


            if (
                !routesMap.has(routeKey)
            ) {

                routesMap.set(
                    routeKey,
                    {
                        from: bus.from,
                        to: bus.to,
                        buses: []
                    }
                );

            }


            routesMap
                .get(routeKey)
                .buses
                .push(bus);

        });


        // =====================================
        // FIND RELEVANT ALTERNATIVES
        // =====================================

        const nearbyRoutes =
            Array.from(
                routesMap.values()
            )
            .filter(route => {

                /*
                 * For now we consider a route
                 * relevant when either:
                 *
                 * 1. It starts from the requested
                 *    destination area
                 *
                 * OR
                 *
                 * 2. It ends at the requested
                 *    destination area.
                 *
                 * This is the first Firestore-based
                 * version. We can make the
                 * geographical matching smarter
                 * later.
                 */

                return (
                    route.from === requestedFrom ||
                    route.to === requestedTo
                );

            });


        // =====================================
        // CREATE USER-FRIENDLY RESULT
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
            "📍 Nearby routes found:",
            results
        );


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


export default findNearbyRoutes;
