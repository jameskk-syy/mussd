const express = require('express');
const ussdMenu = require('../viewmodels/ussdMenu');

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).send('USSD Endpoint is active. Send a POST request to this URL.');
});

router.post('/', (req, res) => {
    const { sessionId, phoneNumber, text } = req.body;

    // Set header for Africa's Talking compatibility
    res.set('Content-Type', 'text/plain');

    try {
        ussdMenu.run(req.body, ussdResult => {
            res.send(ussdResult);
        });
    } catch (error) {
        res.send("END A system error occurred. Please try again later.");
    }
});

module.exports = router;
