function parseBusPreferences(text) {

    text = text.toLowerCase();

    const prefs = {
        ac: null,
        sleeper: null,
        luxury: false,
        cheapest: false,
        morning: false,
        evening: false,
        night: false
    };

    if (text.includes("ac"))
        prefs.ac = true;

    if (text.includes("non ac"))
        prefs.ac = false;

    if (text.includes("sleeper"))
        prefs.sleeper = true;

    if (text.includes("seater"))
        prefs.sleeper = false;

    if (text.includes("luxury"))
        prefs.luxury = true;

    if (
        text.includes("cheap") ||
        text.includes("cheapest") ||
        text.includes("low price")
    )
        prefs.cheapest = true;

    if (text.includes("morning"))
        prefs.morning = true;

    if (text.includes("evening"))
        prefs.evening = true;

    if (text.includes("night"))
        prefs.night = true;

    return prefs;
}

export default parseBusPreferences;
