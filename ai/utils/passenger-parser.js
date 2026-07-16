function parsePassengers(text) {

    const passengers = {

        adults: null,
        children: null

    };

    // Adults

    const adultMatch = text.match(/(\d+)\s*adults?/);

    if (adultMatch) {

        passengers.adults = parseInt(adultMatch[1]);

    }

    // Children

    const childMatch = text.match(/(\d+)\s*children|(\d+)\s*child/);

    if (childMatch) {

        passengers.children = parseInt(
            childMatch[1] || childMatch[2]
        );

    }

    return passengers;

}

export default parsePassengers;
