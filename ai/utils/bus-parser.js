/**
 * =====================================
 * DJGST AI Bus Parser
 * Understands:
 *
 * 1
 * 2
 * 3
 * Orange Travels
 * APSRTC Garuda
 * Book VRL
 * Book Orange Travels
 * I want APSRTC Garuda
 * =====================================
 */

import buses from "../data/buses.js";

function parseBus(text, memory) {

    const userText = String(text || "")
        .trim()
        .toLowerCase();

    // ---------------------------------
    // STEP 1 : Get currently available buses
    // ---------------------------------

    let availableBuses = memory.availableBuses;

    // Safety fallback
    if (
        !Array.isArray(availableBuses) ||
        availableBuses.length === 0
    ) {

        availableBuses = buses.filter(bus => {

            return (
                bus.from.toLowerCase() ===
                String(memory.from || "").toLowerCase()
                &&
                bus.to.toLowerCase() ===
                String(memory.to || "").toLowerCase()
            );

        });

    }

    if (availableBuses.length === 0) {

        return null;

    }


    // ---------------------------------
    // STEP 2 : NUMBER SELECTION
    // ---------------------------------

    if (/^[1-9]\d*$/.test(userText)) {

        const number = Number(userText);

        if (
            number >= 1 &&
            number <= availableBuses.length
        ) {

            return availableBuses[number - 1];

        }

        return null;

    }


    // ---------------------------------
    // STEP 3 : Remove common sentences
    // ---------------------------------

    const cleanedText = userText
        .replace(
            /\b(book|select|choose|want|the|please|me|i|would|like|to|give|show)\b/g,
            " "
        )
        .replace(/\s+/g, " ")
        .trim();


    // ---------------------------------
    // STEP 4 : EXACT BUS NAME
    // ---------------------------------

    for (const bus of availableBuses) {

        const busName =
            bus.name.toLowerCase().trim();

        if (cleanedText === busName) {

            return bus;

        }

    }


    // ---------------------------------
    // STEP 5 : BUS NAME INSIDE SENTENCE
    // ---------------------------------

    for (const bus of availableBuses) {

        const busName =
            bus.name.toLowerCase();

        if (
            userText.includes(busName)
        ) {

            return bus;

        }

    }


    // ---------------------------------
    // STEP 6 : COMPANY / SHORT NAME
    // ---------------------------------
    //
    // Example:
    //
    // "VRL"
    // "Book VRL"
    //
    // But only accept it when exactly
    // ONE bus matches.
    // ---------------------------------

    const possibleMatches = [];

    for (const bus of availableBuses) {

        const words =
            bus.name
                .toLowerCase()
                .split(/\s+/);

        for (const word of words) {

            if (
                word.length >= 3 &&
                cleanedText === word
            ) {

                possibleMatches.push(bus);

                break;

            }

        }

    }


    if (
        possibleMatches.length === 1
    ) {

        return possibleMatches[0];

    


    // ---------------------------------
    // STEP 7 : Nothing matched
    // ---------------------------------

    return null;

}

export default parseBus;
