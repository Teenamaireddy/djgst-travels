
class ActionRegistry {

    execute(intent, memory) {

        switch (intent) {

            case "book_ticket":

                return {

                    action: "search_bus",

                    data: memory

                };

            default:

                return {

                    action: null

                };

        }

    }

}

export default new ActionRegistry();


