const express = require('express');
const ussdMenu = require('../viewmodels/ussdMenu');

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).send('USSD Endpoint is active. Send a POST request to this URL.');
});

router.post('/', (req, res) => {
    console.log('USSD Route Matched: POST /ussd');
    // Basic Input Validation for USSD payload
    const { sessionId, phoneNumber, text } = req.body;

    if (!sessionId || typeof sessionId !== 'string') {
        return res.status(400).send('Bad Request: Missing or invalid sessionId');
    }
    if (!phoneNumber || typeof phoneNumber !== 'string') {
        return res.status(400).send('Bad Request: Missing or invalid phoneNumber');
    }
    if (text === undefined || typeof text !== 'string') {
        return res.status(400).send('Bad Request: Missing or invalid text');
    }

    // Process valid USSD request
    ussdMenu.run(req.body, ussdResult => {
        res.send(ussdResult);
    });
});

module.exports = router;
