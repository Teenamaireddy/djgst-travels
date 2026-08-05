import buses from "../data/buses.js";

function parseBus(text, memory) {

    text = text.toLowerCase();

    const availableBuses = buses.filter(bus =>
        bus.from === memory.from &&
        bus.to === memory.to
    );

    for (const bus of availableBuses) {

        const name = bus.name.toLowerCase();

        if (text.includes(name)) {

            return bus;

        }

        // Allow first word
        const firstWord = name.split(" ")[0];

        if (text.includes(firstWord)) {

            return bus;

        }

    }

    return null;

}

export default parseBus;
