
/**
 * =====================================
 * DJGST AI Memory Engine
 * =====================================
 */

class MemoryStore {

    constructor() {

        this.memory = {};

    }

    save(key, value) {

        this.memory[key] = value;

    }

    get(key) {

        return this.memory[key];

    }

    getAll() {

        return this.memory;

    }

    clear() {

        this.memory = {};

    }

}

export default new MemoryStore();
