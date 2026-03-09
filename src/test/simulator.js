const axios = require('axios');

const URL = 'http://localhost:3000/ussd';

async function sendUssd(text, sessionId = "12345") {
    try {
        const response = await axios.post(URL, {
            sessionId: sessionId,
            serviceCode: "*123#",
            phoneNumber: "+1234567890",
            text: text
        });
        console.log(`\nInput: '${text}'\nResponse:`);
        console.log(response.data);
        return response.data;
    } catch (err) {
        if (err.response) {
            console.error("Error response from server:", err.response.data);
        } else {
            console.error("Error communicating with USSD server:", err.message);
        }
    }
}

async function runTest() {
    const sessionId = Date.now().toString(); 
    
    console.log("=== Start Menu ===");
    await sendUssd("", sessionId);

    console.log("=== Login ===");
    await sendUssd("1234", sessionId);

    console.log("=== Open Savings Menu ===");
    await sendUssd("1234*1", sessionId);

    console.log("=== Check Balance ===");
    await sendUssd("1234*1*1", sessionId);
}

runTest();
