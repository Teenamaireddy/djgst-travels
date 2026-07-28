class BusSearch {

    search(memory) {

        // We'll connect Firebase later.
        // For now, return what AI is searching for.

        return {

            from: memory.from,

            to: memory.to,

            date: memory.date,

            transport: memory.transport

        };

    }

}

export default new BusSearch();
