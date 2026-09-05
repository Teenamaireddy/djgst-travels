/**
 * =====================================
 * DJGST AI Entity Extraction Engine
 * =====================================
 */

import parsePassengers from "../utils/passenger-parser.js";
import parseDate from "../utils/date-parser.js";
import cities from "../data/cities.js";


class EntityEngine {

    extract(userMessage, context = {}) {

        const text =
            String(userMessage || "")
                .trim()
                .toLowerCase();


        const entities = {

            transport: null,
            from: null,
            to: null,
            date: null,
            adults: null,
            children: null,
            selectedBus: null

        };


        // =====================================
        // 1. DATE
        // =====================================

        const dateRegex =
            /\d{4}-\d{2}-\d{2}/;

        const dateMatch =
            text.match(dateRegex);


        if (dateMatch) {

            entities.date =
                dateMatch[0];

        }

        else {

            const parsedDate =
                parseDate(text);

            if (parsedDate) {

                entities.date =
                    parsedDate;

            }

        }


        // =====================================
        // 2. PASSENGERS
        // =====================================

        const passengerData =
            parsePassengers(text);


        if (
            passengerData.adults !== null &&
            passengerData.adults !== undefined
        ) {

            entities.adults =
                passengerData.adults;

        }


        if (
            passengerData.children !== null &&
            passengerData.children !== undefined
        ) {

            entities.children =
                passengerData.children;

        }


        // =====================================
        // 3. TRANSPORT
        // =====================================

        if (
            text.includes("bus") ||
            text.includes("buses")
        ) {

            entities.transport =
                "Bus";

        }

        else if (
            text.includes("train") ||
            text.includes("trains")
        ) {

            entities.transport =
                "Train";

        }

        else if (
            text.includes("flight") ||
            text.includes("flights") ||
            text.includes("plane")
        ) {

            entities.transport =
                "Flight";

        }


        // =====================================
        // 4. CITY DETECTION
        // =====================================
        //
        // First try:
        //
        // "from rajahmundry"
        // "to vizag"
        //
        // =====================================

        for (const city of cities) {

            const cityName =
                String(city)
                    .trim()
                    .toLowerCase();


            if (!cityName) {
                continue;
            }


            // -------------------------------
            // Explicit FROM
            // -------------------------------

            if (
                text.includes(
                    "from " + cityName
                )
            ) {

                entities.from =
                    city;

            }


            // -------------------------------
            // Explicit TO
            // -------------------------------

            if (
                text.includes(
                    "to " + cityName
                )
            ) {

                entities.to =
                    city;

            }

        }


        // =====================================
        // 5. SINGLE-CITY ANSWERS
        // =====================================
        //
        // Example:
        //
        // AI:
        // "Where are you travelling from?"
        //
        // User:
        // "Samalkota"
        //
        // =====================================

        const cleanText =
            text
                .replace(/[.,!?]/g, "")
                .trim();


        const matchingCity =
            cities.find(
                city =>
                    String(city)
                        .trim()
                        .toLowerCase() ===
                    cleanText
            );


        if (matchingCity) {

            // -------------------------------
            // If AI is asking for FROM
            // -------------------------------

            if (
                context.missingSlot ===
                "from"
            ) {

                entities.from =
                    matchingCity;

            }


            // -------------------------------
            // If AI is asking for TO
            // -------------------------------

            else if (
                context.missingSlot ===
                "to"
            ) {

                entities.to =
                    matchingCity;

            }

        }


        return entities;

    }

}


export default new EntityEngine();
