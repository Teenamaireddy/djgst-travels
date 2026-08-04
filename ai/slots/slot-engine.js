/**
 * =====================================
 * DJGST AI Slot Engine
 * =====================================
 */

class SlotEngine {

    check(intent, memory) {

        // If user is already selecting a bus,
        // don't ask booking questions again.
        if (memory.bookingStage === "bus_selection") {

            return {
                complete: true
            };

        }

        // If user is selecting seats,
        // booking details are already complete.
        if (memory.bookingStage === "seat_selection") {

            return {
                complete: true
            };

        }

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
