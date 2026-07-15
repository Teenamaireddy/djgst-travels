/**
 * =====================================
 * DJGST AI Entity Extraction Engine
 * =====================================
 */
import parseDate from "../utils/date-parser.js";
import cities from "../data/cities.js";

class EntityEngine {

    extract(userMessage) {

    const text = userMessage.toLowerCase();
    const today = new Date();

const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);

const dayAfterTomorrow = new Date();
dayAfterTomorrow.setDate(today.getDate() + 2);

        

    const entities = {

        transport: null,
        from: null,
        to: null,
        date: null,
        adults: null,
        children: null

    };
        // Exact date (YYYY-MM-DD)
const dateRegex = /\d{4}-\d{2}-\d{2}/;
const dateMatch = text.match(dateRegex);

if (dateMatch) {

    entities.date = dateMatch[0];

}

// Tomorrow
else if (text.includes("tomorrow")) {

    entities.date =
        tomorrow.toISOString().split("T")[0];

}

// Today
else if (text.includes("today")) {

    entities.date =
        today.toISOString().split("T")[0];

}

// Day after tomorrow
else if (text.includes("day after tomorrow")) {

    entities.date =
        dayAfterTomorrow.toISOString().split("T")[0];

}

        

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
