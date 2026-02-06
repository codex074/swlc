const { onRequest } = require("firebase-functions/v2/https");
const textToSpeech = require("@google-cloud/text-to-speech");
const logger = require("firebase-functions/logger");

// Creates a client
const client = new textToSpeech.TextToSpeechClient();

exports.synthesizeSpeech = onRequest({ cors: true }, async (request, response) => {
    try {
        const { ssml } = request.body;

        if (!ssml) {
            response.status(400).send("Missing SSML in request body.");
            return;
        }

        const requestData = {
            input: { ssml: ssml },
            // Select the language and SSML voice gender (optional)
            voice: { languageCode: "th-TH", ssmlGender: "FEMALE" },
            // select the type of audio encoding
            audioConfig: { audioEncoding: "MP3" },
        };

        // Performs the text-to-speech request
        const [apiResponse] = await client.synthesizeSpeech(requestData);

        // Returns the audio content as base64
        response.json({ audioContent: apiResponse.audioContent.toString("base64") });

    } catch (error) {
        logger.error("Error synthesizing speech:", error);
        response.status(500).send(error.message);
    }
});
