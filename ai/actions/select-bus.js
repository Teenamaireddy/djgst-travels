import buses from "../data/buses.js";
import memoryStore from "../memory/memory-store.js";

function selectBus(number) {

    const bus = buses[number - 1];

    if (!bus) return null;

    memoryStore.save({
        selectedBus: bus
    });

    return bus;

}

export default selectBus;
