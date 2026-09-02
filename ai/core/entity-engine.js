/**
 * =====================================
 * DJGST AI Entity Extraction Engine
 * =====================================
 */

import parsePassengers from "../utils/passenger-parser.js";
import parseDate from "../utils/date-parser.js";
import cities from "../data/cities.js";
import memoryStore from "../memory/memory-store.js";


class EntityEngine {

    extract(userMessage) {

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
        // EXTRA / NEW CITIES
        // =====================================
        //
        // These are needed immediately because
        // they are used by nearby-route search.
        //
        // We keep cities.js untouched for now.
        //

        const additionalCities = [

            "Anakapalle",

            "Samalkota"

        ];


        // Combine cities.js + additional cities
        // without creating duplicates.

        const allCities = [

            ...cities,

            ...additionalCities

        ].filter(
            (city, index, array) =>
                array.findIndex(
                    item =>
                        item.toLowerCase() ===
                        city.toLowerCase()
                ) === index
        );


        // =====================================
        // DETECT DATE
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
        // DETECT PASSENGERS
        // =====================================

        const passengerData =
            parsePassengers(text);


        if (
            passengerData &&
            passengerData.adults !== null
        ) {

            entities.adults =
                passengerData.adults;

        }


        if (
            passengerData &&
            passengerData.children !== null
        ) {

            entities.children =
                passengerData.children;

        }


        // =====================================
        // DETECT TRANSPORT
        // =====================================

        if (text.includes("bus")) {

            entities.transport =
                "Bus";

        }

        else if (text.includes("train")) {

            entities.transport =
                "Train";

        }

        else if (
            text.includes("flight") ||
            text.includes("plane")
        ) {

            entities.transport =
                "Flight";

        }


        // =====================================
        // DETECT FROM & TO CITIES
        // =====================================

        for (const city of allCities) {

            const cityName =
                city.toLowerCase();


            // ---------------------------------
            // "from city"
            // ---------------------------------

            const fromRegex =
                new RegExp(
                    `\\bfrom\\s+${escapeRegex(cityName)}\\b`,
                    "i"
                );


            if (
                fromRegex.test(text)
            ) {

                entities.from =
                    city;

            }


            // ---------------------------------
            // "to city"
            // ---------------------------------

            const toRegex =
                new RegExp(
                    `\\bto\\s+${escapeRegex(cityName)}\\b`,
                    "i"
                );


            if (
                toRegex.test(text)
            ) {

                entities.to =
                    city;

            }

        }


        // =====================================
        // STANDALONE CITY REPLY
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
        // We use memory to understand whether
        // the missing city should be FROM or TO.
        //

        if (
            !entities.from &&
            !entities.to
        ) {

            let matchedCity = null;


            for (const city of allCities) {

                const cityName =
                    city.toLowerCase();


                const cityRegex =
                    new RegExp(
                        `^${escapeRegex(cityName)}$`,
                        "i"
                    );


                if (
                    cityRegex.test(text)
                ) {

                    matchedCity =
                        city;

                    break;

                }

            }


            if (matchedCity) {

                const memory =
                    memoryStore.getAll();


                // If FROM is missing,
                // this city becomes FROM.

                if (!memory.from) {

                    entities.from =
                        matchedCity;

                }

                // Otherwise if TO is missing,
                // this city becomes TO.

                else if (!memory.to) {

                    entities.to =
                        matchedCity;

                }

            }

        }


        // =====================================
        // DEBUG
        // =====================================

        console.log(
            "📦 Extracted Entities:",
            entities
        );


        return entities;

    }

}


/**
 * =====================================
 * Escape text before putting it inside
 * a Regular Expression.
 * =====================================
 */

function escapeRegex(value) {

    return String(value)
        .replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

}


export default new EntityEngine();
