const axios = require('axios');

class UserModel {
    static async authenticate(username, password) {
        try {
            const payload = {
                username: username,
                password: password
            };

            //console.log(`[Auth Tracing] Sending request to ${process.env.AUTH_API_URL}`);

            const response = await axios.post(process.env.AUTH_API_URL, payload, {
                timeout: 15000 // 15 seconds timeout
            });

            //console.log(`[Auth Tracing] Response received. Status: ${response.status}`);

            if (response.data && response.data.entity && response.data.entity.token) {
                return {
                    success: true,
                    token: response.data.entity.token,
                    entityId: response.data.entity.id, // Using .id as seen in your sample response
                    user: {
                        name: response.data.entity.firstName + ' ' + response.data.entity.lastName
                    }
                };
            } else {
                //console.warn(`[Auth Tracing] Invalid response structure: ${JSON.stringify(response.data)}`);
                return {
                    success: false,
                    message: response.data.message || 'Invalid credentials'
                };
            }
        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                //console.error('[Auth Tracing] Request timed out (15s)');
                return { success: false, message: 'Authentication timed out' };
            }
            //console.error('[Auth Tracing] API Error:', error.response ? JSON.stringify(error.response.data) : error.message);
            return {
                success: false,
                message: 'Authentication service unavailable'
            };
        }
    }
}

module.exports = UserModel;
