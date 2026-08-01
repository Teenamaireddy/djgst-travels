class BusRecommender {

    recommend(buses) {

        if (!buses || buses.length === 0) {
            return null;
        }

        let bestBus = buses[0];

        for (const bus of buses) {

            if (bus.rating > bestBus.rating) {

                bestBus = bus;

            }

        }

        return bestBus;

    }

}

export default new BusRecommender();
