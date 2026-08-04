import buses from "../data/buses.js";

function selectBus(number, memory) {

    const results = buses.filter(bus =>

        bus.from === memory.from &&
        bus.to === memory.to

    );

    return results[number - 1];

}

export default selectBus;
