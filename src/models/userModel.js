const axios = require('axios');

class UserModel {
    static async authenticate(username, password) {
        try {
            const payload = {
                username: username,
                password: password
            };

            const response = await axios.post(process.env.AUTH_API_URL, payload, {
                timeout: 9000
            });

            console.log('[Auth] Response Data:', JSON.stringify(response.data));

            if (response.data && response.data.entity && response.data.entity.token) {
                return {
                    success: true,
                    token: response.data.entity.token,
                    entityId: response.data.entity.id,
                    user: {
                        name: response.data.entity.firstName + ' ' + response.data.entity.lastName
                    }
                };
            } else {
                return {
                    success: false,
                    message: response.data.message || 'Invalid credentials'
                };
            }
        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                return { success: false, message: 'Authentication timed out (Backend slow)' };
            }
            return {
                success: false,
                message: 'Authentication service unavailable'
            };
        }
    }
}

module.exports = UserModel;
