import buses from "../data/buses.js";

function search(memory) {

    let results = buses.filter(bus =>

        bus.from.toLowerCase() === memory.from.toLowerCase() &&
        bus.to.toLowerCase() === memory.to.toLowerCase()

    );

    // AC filter
    if (memory.ac === true) {

        results = results.filter(bus =>
            bus.type.toLowerCase().includes("ac")
        );

    }

    // Sleeper filter
    if (memory.sleeper === true) {

        results = results.filter(bus =>
            bus.type.toLowerCase().includes("sleeper")
        );

    }

    // Luxury filter
    if (memory.luxury === true) {

        results = results.filter(bus =>
            bus.type.toLowerCase().includes("luxury")
        );

    }

    // Cheapest first
    if (memory.cheapest) {

        results.sort((a, b) => a.price - b.price);

    }

    return results;

}

export default { search };
