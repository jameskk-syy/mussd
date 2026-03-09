// Mock data for loans
const loanAccounts = [
    { phoneNumber: '+1234567890', activeLoans: [{ id: 'L1', amount: 100.00 }], statements: ['Borrowed $100.00', 'Repaid $20.00'] },
    { phoneNumber: '+0987654321', activeLoans: [], statements: [] }
];

class LoanModel {
    static async getActiveLoans(phoneNumber) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const account = loanAccounts.find(a => a.phoneNumber === phoneNumber);
                if (account) {
                    const totalActive = account.activeLoans.reduce((sum, loan) => sum + loan.amount, 0);
                    resolve({ success: true, activeLoans: account.activeLoans, totalActive });
                } else {
                    resolve({ success: false, message: 'Account not found' });
                }
            }, 300);
        });
    }

    static async getStatements(phoneNumber) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const account = loanAccounts.find(a => a.phoneNumber === phoneNumber);
                if (account) {
                    resolve({ success: true, statements: account.statements });
                } else {
                    resolve({ success: false, message: 'Account not found' });
                }
            }, 300);
        });
    }

    static async applyLoan(phoneNumber, amount) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const account = loanAccounts.find(a => a.phoneNumber === phoneNumber);
                if (account) {
                    const loan = { id: `L${Date.now()}`, amount: parseFloat(amount) };
                    account.activeLoans.push(loan);
                    account.statements.push(`Borrowed $${parseFloat(amount).toFixed(2)}`);
                    resolve({ success: true, newTotal: account.activeLoans.reduce((sum, i) => sum + i.amount, 0) });
                } else {
                    resolve({ success: false, message: 'Account not found' });
                }
            }, 300);
        });
    }
}

module.exports = LoanModel;
