// Mock data for savings accounts
const savingsAccounts = [
    { phoneNumber: '+1234567890', balance: 500.00, statements: ['Deposit $500.00'] },
    { phoneNumber: '+0987654321', balance: 150.50, statements: ['Deposit $150.50'] }
];

class SavingsModel {
    static async getBalance(phoneNumber) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const account = savingsAccounts.find(a => a.phoneNumber === phoneNumber);
                if (account) {
                    resolve({ success: true, balance: account.balance });
                } else {
                    resolve({ success: false, message: 'Account not found' });
                }
            }, 300);
        });
    }

    static async deposit(phoneNumber, amount) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const account = savingsAccounts.find(a => a.phoneNumber === phoneNumber);
                if (account) {
                    account.balance += parseFloat(amount);
                    account.statements.push(`Deposit $${parseFloat(amount).toFixed(2)}`);
                    resolve({ success: true, newBalance: account.balance });
                } else {
                    resolve({ success: false, message: 'Account not found' });
                }
            }, 300);
        });
    }

    static async getStatements(phoneNumber) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const account = savingsAccounts.find(a => a.phoneNumber === phoneNumber);
                if (account) {
                    resolve({ success: true, statements: account.statements });
                } else {
                    resolve({ success: false, message: 'Account not found' });
                }
            }, 300);
        });
    }
}

module.exports = SavingsModel;
