import buses from "../data/buses.js";  
  
function parseBus(text, memory) {  
  
    const userText = text.trim().toLowerCase();  
  
    // ---------------------------------  
    // STEP 1 : Get buses currently shown  
    // ---------------------------------  
  
    let availableBuses = memory.availableBuses;  
  
    // Safety fallback  
    if (!Array.isArray(availableBuses) || availableBuses.length === 0) {  
  
        availableBuses = buses.filter(bus => {  
  
            return (  
                bus.from.toLowerCase() ===  
                String(memory.from || "").toLowerCase()  
                &&  
                bus.to.toLowerCase() ===  
                String(memory.to || "").toLowerCase()  
            );  
  
        });  
  
    }  
  
    // No buses available  
    if (availableBuses.length === 0) {  
        return null;  
    }  
  
  
    // ---------------------------------  
    // STEP 2 : Number selection  
    // ---------------------------------  
  
    if (/^[1-9]\d*$/.test(userText)) {  
  
        const number = Number(userText);  
  
        if (  
            number >= 1 &&  
            number <= availableBuses.length  
        ) {  
  
            return availableBuses[number - 1];  
  
        }  
  
        return null;  
    }  
  
  
    // ---------------------------------  
    // STEP 3 : Clean common words  
    // ---------------------------------  
  
    const cleanedText = userText  
        .replace(/\b(book|select|choose|want|the|please|me)\b/g, " ")  
        .replace(/\s+/g, " ")  
        .trim();  
  
  
    // ---------------------------------  
    // STEP 4 : Exact bus-name matching  
    // ---------------------------------  
  
    for (const bus of availableBuses) {  
  
        const busName =  
            bus.name.toLowerCase();  
  
        // Example:  
        // "orange travels"  
        if (cleanedText === busName) {  
  
            return bus;  
  
        }  
  
    }  
  
  
    // ---------------------------------  
    // STEP 5 : Bus-name contained in text  
    // ---------------------------------  
  
    for (const bus of availableBuses) {  
  
        const busName =  
            bus.name.toLowerCase();  
  
        // Example:  
        // "i want orange travels"  
        // "book orange travels"  
        // "select apsrtc garuda"  
  
        if (cleanedText.includes(busName)) {  
  
            return bus;  
  
        }  
  
    }  
  
  
    // ---------------------------------  
    // STEP 6 : Special shorthand  
    // ---------------------------------  
    // "Book VRL"  
    // "VRL"  
    //  
    // We check the beginning/company word  
    // only when it uniquely identifies a bus.  
  
    const matchingBuses = availableBuses.filter(bus => {  
  
        const words =  
            bus.name.toLowerCase().split(" ");  
  
        return words.some(word => {  
  
            return (  
                word.length >= 3 &&  
                cleanedText === word  
            );  
  
        });  
  
    });  
  
  
    if (matchingBuses.length === 1) {  
  
        return matchingBuses[0];  
  
    }  
  
  
    // ---------------------------------  
    // Nothing matched  
    // ---------------------------------  
  
    return null;  
  
}  
  
export default parseBus;  
