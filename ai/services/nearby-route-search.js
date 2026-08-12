/**
 * =====================================
 * DJGST AI Nearby Route Search
 * =====================================
 */

import nearbyRoutes from "../data/nearby-routes.js";

function findNearbyRoutes(from, to) {

    const source = String(from || "")
        .trim()
        .toLowerCase();

    const destination = String(to || "")
        .trim()
        .toLowerCase();

    if (!source || !destination) {
        return [];
    }

    const nearbyFrom = nearbyRoutes[source] || [];

    const nearbyTo = nearbyRoutes[destination] || [];

    const suggestions = [];

    // ---------------------------------
    // Alternative destination
    // ---------------------------------

    nearbyTo.forEach(place => {

        suggestions.push({
            from: source,
            to: place,
            reason: `${place} is near ${destination}`
        });

    });

    // ---------------------------------
    // Alternative starting point
    // ---------------------------------

    nearbyFrom.forEach(place => {

        suggestions.push({
            from: place,
            to: destination,
            reason: `${place} is near ${source}`
        });

    });

    // ---------------------------------
    // Remove duplicates
    // ---------------------------------

    const unique = [];

    suggestions.forEach(route => {

        const exists = unique.some(item =>
            item.from === route.from &&
            item.to === route.to
        );

        if (!exists) {
            unique.push(route);
        }

    });

    return unique;

}

export default findNearbyRoutes;
