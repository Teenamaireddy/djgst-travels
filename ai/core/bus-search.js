import buses from "../data/buses.js";

function searchBuses(memory) {

    return buses.filter(bus => {

        return (

            bus.from === memory.from &&
            bus.to === memory.to

        );

    });

}

export default searchBuses;
