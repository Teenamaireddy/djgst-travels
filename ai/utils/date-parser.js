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

    return null;

}

function formatDate(date) {

    return date.toISOString().split("T")[0];

}

export default parseDate;
