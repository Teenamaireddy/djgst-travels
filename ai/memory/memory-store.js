/**
 * =====================================
 * DJGST AI Memory Engine
 * =====================================
 */

class MemoryStore {

    constructor() {

        this.memory = {
    intent: null,
    transport: null,
    from: null,
    to: null,
    date: null,
    adults: null,
    children: null,

    availableBuses: [],   // 👈 ADD THIS

    selectedBus: null,
    selectedSeat: null,
    bookingStage: "start"
};
    }

    save(key, value) {

        this.memory[key] = value;

    }

    get(key) {

        return this.memory[key];

    }

    getAll() {

        return { ...this.memory };

    }

    remove(key) {

        delete this.memory[key];

    }

    clear() {

        this.memory = {
    intent: null,
    transport: null,
    from: null,
    to: null,
    date: null,
    adults: null,
    children: null,

    availableBuses: [],   // 👈 ADD THIS

    selectedBus: null,
    selectedSeat: null,
    bookingStage: "start"
};

    }

}

export default new MemoryStore();
