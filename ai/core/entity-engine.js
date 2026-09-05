/**
 * =====================================
 * DJGST AI Entity Extraction Engine
 * =====================================
 */

import parsePassengers from "../utils/passenger-parser.js";
import parseDate from "../utils/date-parser.js";
import cities from "../data/cities.js";


class EntityEngine {


    extract(userMessage, memory = {}) {

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
        // DATE
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
        // PASSENGERS
        // =====================================

        const passengerData =
            parsePassengers(text);


        if (
            passengerData.adults !== null
        ) {

            entities.adults =
                passengerData.adults;

        }


        if (
            passengerData.children !== null
        ) {

            entities.children =
                passengerData.children;

        }


        // =====================================
        // TRANSPORT
        // =====================================

        if (
            text.includes("bus")
        ) {

            entities.transport =
                "Bus";

        }

        else if (
            text.includes("train")
        ) {

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
        // CITY MATCHING
        // =====================================

        const cityList =
            Array.isArray(cities)
                ? cities
                : [];


        for (
            const city of cityList
        ) {

            const cityName =
                String(city)
                    .trim()
                    .toLowerCase();


            if (
                text.includes(
                    "from " + cityName
                )
            ) {

                entities.from =
                    city;

            }


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
        // CONTEXT-AWARE CITY ANSWER
        // =====================================
        //
        // This fixes:
        //
        // AI:
        // "Where are you travelling from?"
        //
        // User:
        // "Samalkota"
        //
        // Memory says:
        // from is missing.
        //
        // Therefore:
        // from = Samalkota
        // =====================================


        const cleanText =
            text
                .replace(/[.,!?]/g, "")
                .trim();


        // -------------------------------------
        // If AI is waiting for FROM
        // -------------------------------------

        if (
            !entities.from &&
            !memory.from &&
            cleanText
        ) {

            const matchingCity =
                findCity(
                    cleanText,
                    cityList
                );


            if (matchingCity) {

                entities.from =
                    matchingCity;

            }

        }


        // -------------------------------------
        // If AI already knows FROM but TO
        // is missing, a standalone city means TO.
        // -------------------------------------

        if (
            !entities.to &&
            memory.from &&
            !memory.to &&
            cleanText
        ) {

            const matchingCity =
                findCity(
                    cleanText,
                    cityList
                );


            if (matchingCity) {

                entities.to =
                    matchingCity;

            }

        }


        return entities;

    }

}


// =====================================
// FIND CITY
// =====================================

function findCity(
    text,
    cityList
) {

    for (
        const city of cityList
    ) {

        const cityName =
            String(city)
                .trim()
                .toLowerCase();


        if (
            text === cityName
        ) {

            return city;

        }

    }


    return null;

}


export default new EntityEngine();
