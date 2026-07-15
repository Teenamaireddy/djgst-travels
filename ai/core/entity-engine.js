/**
 * =====================================
 * DJGST AI Entity Extraction Engine
 * =====================================
 */
import cities from "../data/cities.js";

class EntityEngine {

    extract(userMessage) {

    const text = userMessage.toLowerCase();

    const entities = {

        transport: null,
        from: null,
        to: null,
        date: null,
        adults: null,
        children: null

    };

    // -------------------------
    // Detect Transport
    // -------------------------

    if (text.includes("bus")) {

        entities.transport = "Bus";

    }

    else if (text.includes("train")) {

        entities.transport = "Train";

    }

    else if (
        text.includes("flight") ||
        text.includes("plane")
    ) {

        entities.transport = "Flight";

    }

    // -------------------------
    // Detect From & To Cities
    // -------------------------

    for (const city of cities) {

        const cityName = city.toLowerCase();

        if (text.includes("from " + cityName)) {

            entities.from = city;

        }

        if (text.includes("to " + cityName)) {

            entities.to = city;

        }

    }

    return entities;

    }
}

export default new EntityEngine();
