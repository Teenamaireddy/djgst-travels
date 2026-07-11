/**
 * =====================================
 * DJGST AI Entity Extraction Engine
 * =====================================
 */

class EntityEngine {

    extract(userMessage) {

        return {
            transport: null,
            from: null,
            to: null,
            date: null,
            adults: null,
            children: null
        };

    }

}

export default new EntityEngine();
