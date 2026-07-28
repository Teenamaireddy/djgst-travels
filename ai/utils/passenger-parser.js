function parsePassengers(text) {

    text = text.toLowerCase();

    const passengers = {

        adults: null,
        children: null

    };

    // -------------------------
    // Adults
    // -------------------------

    const adultMatch = text.match(/(\d+)\s*(adult|adults|person|persons|people|passengers?)/);

    if (adultMatch) {

        passengers.adults = parseInt(adultMatch[1]);

    }

    // -------------------------
    // Children
    // -------------------------

    const childMatch = text.match(/(\d+)\s*(child|children|kid|kids)/);

    if (childMatch) {

        passengers.children = parseInt(childMatch[1]);

    }

    // -------------------------
    // Just me
    // -------------------------

    if (
        text.includes("just me") ||
        text.includes("only me") ||
        text === "me"
    ) {

        passengers.adults = 1;

    }

    return passengers;

}

export default parsePassengers;
