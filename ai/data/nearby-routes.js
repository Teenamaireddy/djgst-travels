/**
 * =====================================
 * DJGST AI Nearby Route Data
 * =====================================
 *
 * Places that can be considered nearby
 * alternatives when a direct route
 * is unavailable.
 */

const nearbyRoutes = {

    "gadarada": [
        "narasapuram"
    ],

    "narasapuram": [
        "gadarada"
    ],

    "rajahmundry": [
        "anakapalle",
        "samalkota"
    ],

    "anakapalle": [
        "rajahmundry"
    ],

    "samalkota": [
        "rajahmundry"
    ]

};

export default nearbyRoutes;
