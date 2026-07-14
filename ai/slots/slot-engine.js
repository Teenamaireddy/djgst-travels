/**
 * =====================================
 * DJGST AI Slot Engine
 * =====================================
 */

class SlotEngine {

    check(intent, memory) {

        switch (intent) {

            case "book_ticket":

                if (!memory.transport) {

                    return {
                        complete: false,
                        missing: "transport"
                    };

                }

                if (!memory.from) {

                    return {
                        complete: false,
                        missing: "from"
                    };

                }

                if (!memory.to) {

                    return {
                        complete: false,
                        missing: "to"
                    };

                }

                if (!memory.date) {

                    return {
                        complete: false,
                        missing: "date"
                    };

                }

                return {
                    complete: true
                };

            default:

                return {
                    complete: true
                };

        }

    }

}

export default new SlotEngine();
