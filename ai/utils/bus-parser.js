import buses from "../data/buses.js";

function parseBus(text, memory) {

    text = text.toLowerCase();

    const availableBuses = buses.filter(bus =>

    bus.from.toLowerCase() === memory.from.toLowerCase() &&
    bus.to.toLowerCase() === memory.to.toLowerCase()

);

    for (const bus of availableBuses) {

    const name = bus.name.toLowerCase();

    // Full name
    if (text.includes(name)) {
        return bus;
    }

    // Every word in the name
    const words = name.split(" ");

    for (const word of words) {

        if (word.length > 2 && text.includes(word)) {
            return bus;
        }

    }

    }

    return null;

}

export default parseBus;
