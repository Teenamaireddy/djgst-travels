
/**
 * ====================================
 * DJGST AI Intent Registry
 * ====================================
 */

const IntentRegistry = [

    {
        id: "book_ticket",
        description: "Book a bus, train or flight",

        keywords: [
            "book",
            "booking",
            "reserve",
            "ticket",
            "bus",
            "train",
            "flight"
        ]
    },

    {
        id: "cancel_booking",

        description: "Cancel existing booking",

        keywords: [
            "cancel",
            "refund"
        ]
    },

    {
        id: "view_history",

        description: "View booking history",

        keywords: [
            "history",
            "bookings",
            "my bookings",
            "previous trips"
        ]
    },

    {
        id: "travel_weather",

        description: "Weather information",

        keywords: [
            "weather",
            "rain",
            "temperature",
            "forecast"
        ]
    },

    {
        id: "plan_trip",

        description: "Trip planning",

        keywords: [
            "plan",
            "trip",
            "budget",
            "vacation"
        ]
    }

];

export default IntentRegistry;
