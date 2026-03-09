const express = require('express');
const ussdMenu = require('../viewmodels/ussdMenu');

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).send('USSD Endpoint is active. Send a POST request to this URL.');
});

router.post('/', (req, res) => {
    console.log(`[USSD Request] Payload: ${JSON.stringify(req.body)}`);
    const { sessionId, phoneNumber, text } = req.body;

    if (!sessionId || !phoneNumber) {
        console.warn(`[USSD Warning] Missing required fields. SID: ${sessionId}, Phone: ${phoneNumber}`);
        // Note: Africa's Talking might send different field names in some environments
    }

    try {
        ussdMenu.run(req.body, ussdResult => {
            console.log(`[USSD Response] Result: ${ussdResult}`);
            res.send(ussdResult);
        });
    } catch (error) {
        console.error(`[USSD Error] Exception in ussdMenu.run:`, error);
        res.send("END A system error occurred. Please try again later.");
    }
});

module.exports = router;
