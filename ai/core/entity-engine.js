/**
 * =====================================
 * DJGST AI Entity Extraction Engine
 * =====================================
 */

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

    // Detect Bus
    if (text.includes("bus")) {

        entities.transport = "Bus";

    }

    // Detect Train
    else if (text.includes("train")) {

        entities.transport = "Train";

    }

    // Detect Flight
    else if (
        text.includes("flight") ||
        text.includes("plane")
    ) {

        entities.transport = "Flight";

    }

    return entities;

    }
}

export default new EntityEngine();
