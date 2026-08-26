/**
 * =====================================
 * DJGST AI Firestore Bus Search
 * =====================================
 *
 * Searches available buses directly
 * from Firestore.
 */

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "../../firebase-config.js";


async function searchBuses(memory) {

    try {

        const from =
            String(memory.from || "")
                .trim()
                .toLowerCase();

        const to =
            String(memory.to || "")
                .trim()
                .toLowerCase();


        // ---------------------------------
        // Validate route
        // ---------------------------------

        if (!from || !to) {

            console.warn(
                "⚠️ Firestore Bus Search: Missing from/to"
            );

            return [];

        }


        console.log(
            `🔎 Firestore Bus Search: ${from} → ${to}`
        );


        // ---------------------------------
        // Firestore Query
        // ---------------------------------

        const busesRef =
            collection(
                db,
                "busRoutes"
            );


        const q =
            query(
                busesRef,

                where(
                    "from",
                    "==",
                    from
                ),

                where(
                    "to",
                    "==",
                    to
                ),

                where(
                    "active",
                    "==",
                    true
                )
            );


        const snapshot =
            await getDocs(q);


        // ---------------------------------
        // Convert Firestore documents
        // into normal JS bus objects
        // ---------------------------------

        const buses =
            snapshot.docs.map(
                doc => {

                    const data =
                        doc.data();

                    return {

                        id:
                            data.id ?? doc.id,

                        name:
                            data.name || "",

                        type:
                            data.type || "",

                        from:
                            data.from || "",

                        to:
                            data.to || "",

                        departure:
                            data.departure || "",

                        arrival:
                            data.arrival || "",

                        price:
                            data.price ?? 0,

                        active:
                            data.active !== false

                    };

                }
            );


        console.log(
            "🚌 Firestore buses found:",
            buses
        );


        return buses;

    }

    catch (error) {

        console.error(
            "❌ Firestore Bus Search Error:",
            error
        );

        return [];

    }

}


export default {
    search: searchBuses
};
