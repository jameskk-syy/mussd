// Mock data for users (Normally this would come from an API/Database)
const users = [
    { phoneNumber: '+1234567890', password: '1234', name: 'John Doe' },
    { phoneNumber: '+0987654321', password: '0000', name: 'Jane Smith' }
];

class UserModel {
    static async authenticate(phoneNumber, password) {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = users.find(u => u.phoneNumber === phoneNumber && u.password === password);
                if (user) {
                    resolve({ success: true, user });
                } else {
                    resolve({ success: false, message: 'Invalid password' });
                }
            }, 300);
        });
    }

    static async updatePassword(phoneNumber, newPassword) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = users.find(u => u.phoneNumber === phoneNumber);
                if (user) {
                    user.password = newPassword;
                    resolve({ success: true, message: 'Password updated successfully' });
                } else {
                    resolve({ success: false, message: 'User not found' });
                }
            }, 300);
        });
    }
}

module.exports = UserModel;
