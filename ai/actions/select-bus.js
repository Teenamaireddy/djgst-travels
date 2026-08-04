import buses from "../data/buses.js";
import memoryStore from "../memory/memory-store.js";

function selectBus(number) {

    const bus = buses[number - 1];

    if (!bus) {

        return null;

    }

    // Save selected bus
    memoryStore.save("selectedBus", bus);

    // Move AI to seat selection stage
    memoryStore.save("bookingStage", "seat_selection");

    return bus;

}

export default selectBus;
