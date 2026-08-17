/**
 * =====================================
 * DJGST AI Nearby Route Search
 * =====================================
 *
 * Finds nearby alternative routes ONLY
 * when an actual bus exists in buses.js.
 */

import buses from "../data/buses.js";
import nearbyRoutes from "../data/nearby-routes.js";


function normalize(value) {

    return String(value || "")
        .trim()
        .toLowerCase();

}


/**
 * -------------------------------------
 * Check whether buses exist
 * for a particular route
 * -------------------------------------
 */

function getBusesForRoute(from, to) {

    const source = normalize(from);
    const destination = normalize(to);

    return buses.filter(bus => {

        return (
            normalize(bus.from) === source &&
            normalize(bus.to) === destination
        );

    });

}


/**
 * -------------------------------------
 * Main Nearby Route Search
 * -------------------------------------
 */

function findNearbyRoutes(from, to) {

    const source = normalize(from);
    const destination = normalize(to);

    const results = [];

    const seen = new Set();


    /**
     * ---------------------------------
     * 1. Nearby departure cities
     *
     * Example:
     *
     * Rajahmundry → Vizag
     *
     * Check:
     * Anakapalle → Vizag
     * Samalkota → Vizag
     * ---------------------------------
     */

    const nearbyFrom =
        nearbyRoutes[source] || [];


    for (const alternativeFrom of nearbyFrom) {

        const routeBuses =
            getBusesForRoute(
                alternativeFrom,
                destination
            );


        // IMPORTANT:
        // Only suggest the route if
        // an actual bus exists.
        if (routeBuses.length === 0) {

            continue;

        }


        const key =
            normalize(alternativeFrom) +
            "→" +
            destination;


        if (seen.has(key)) {

            continue;

        }


        seen.add(key);


        results.push({

            from: alternativeFrom,

            to: destination,

            reason:
                `${alternativeFrom} is near ${from}`,

            buses: routeBuses

        });

    }


    /**
     * ---------------------------------
     * 2. Nearby destination cities
     *
     * Example:
     *
     * Rajahmundry → Vizag
     *
     * Check:
     * Rajahmundry → nearby Vizag city
     * ---------------------------------
     */

    const nearbyTo =
        nearbyRoutes[destination] || [];


    for (const alternativeTo of nearbyTo) {

        const routeBuses =
            getBusesForRoute(
                source,
                alternativeTo
            );


        if (routeBuses.length === 0) {

            continue;

        }


        const key =
            source +
            "→" +
            normalize(alternativeTo);


        if (seen.has(key)) {

            continue;

        }


        seen.add(key);


        results.push({

            from: source,

            to: alternativeTo,

            reason:
                `${alternativeTo} is near ${to}`,

            buses: routeBuses

        });

    }


    /**
     * ---------------------------------
     * 3. Nearby departure AND
     *    nearby destination
     *
     * Example:
     *
     * nearby A → nearby B
     * ---------------------------------
     */

    for (const alternativeFrom of nearbyFrom) {

        for (const alternativeTo of nearbyTo) {

            const routeBuses =
                getBusesForRoute(
                    alternativeFrom,
                    alternativeTo
                );


            if (routeBuses.length === 0) {

                continue;

            }


            const key =
                normalize(alternativeFrom) +
                "→" +
                normalize(alternativeTo);


            if (seen.has(key)) {

                continue;

            }


            seen.add(key);


            results.push({

                from: alternativeFrom,

                to: alternativeTo,

                reason:
                    `${alternativeFrom} is near ${from} and ${alternativeTo} is near ${to}`,

                buses: routeBuses

            });

        }

    }


    return results;

}


export default findNearbyRoutes;
