/**
 * =====================================
 * DJGST AI Intent Engine
 * =====================================
 */

import IntentRegistry from "../intents/intent-registry.js";

class IntentEngine {

    detect(userMessage) {

        const message = userMessage.toLowerCase();

        for (const intent of IntentRegistry) {

            for (const keyword of intent.keywords) {

                if (message.includes(keyword)) {

                    return {
                        intent: intent.id,
                        confidence: 0.95
                    };

                }

            }

        }

        return {
            intent: "unknown",
            confidence: 0
        };

    }

}

export default new IntentEngine();
