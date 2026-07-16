function parseDate(text) {

    text = text.toLowerCase();

    const today = new Date();

    // Today
    if (text.includes("today")) {

        return formatDate(today);

    }

    // Tomorrow
    if (text.includes("tomorrow")) {

        const tomorrow = new Date(today);

        tomorrow.setDate(today.getDate() + 1);

        return formatDate(tomorrow);

    }

    // Day after tomorrow
    if (text.includes("day after tomorrow")) {

        const date = new Date(today);

        date.setDate(today.getDate() + 2);

        return formatDate(date);

    }
    // -------------------------
// Next Weekday
// -------------------------

const weekDays = {

    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6

};

for (const day in weekDays) {

    if (text.includes("next " + day)) {

        const targetDay = weekDays[day];

        const date = new Date(today);

        let diff = targetDay - today.getDay();

        if (diff <= 0) {

            diff += 7;

        }

        date.setDate(today.getDate() + diff);

        return formatDate(date);

    }

}

    return null;

}

function formatDate(date) {

    return date.toISOString().split("T")[0];

}

export default parseDate;
