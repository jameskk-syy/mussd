const axios = require('axios');

class UserModel {
    static async authenticate(username, password) {
        try {
            const payload = {
                username: username,
                password: password
            };

            const response = await axios.post(process.env.AUTH_API_URL, payload);

            if (response.data && response.data.entity && response.data.entity.token) {
                return {
                    success: true,
                    token: response.data.entity.token,
                    entityId: response.data.entity.entityId,
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
            console.error('Auth API Error:', error.response ? error.response.data : error.message);
            return {
                success: false,
                message: 'Authentication service unavailable'
            };
        }
    }
}

module.exports = UserModel;
