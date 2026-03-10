const UssdMenu = require('ussd-builder');
const UserModel = require('../models/userModel');
const SavingsModel = require('../models/savingsModel');
const LoanModel = require('../models/loanModel');

let menu = new UssdMenu();

const sessions = {};
menu.sessionConfig({
    start: (sessionId, callback) => {
        if (!(sessionId in sessions)) sessions[sessionId] = {};
        callback();
    },
    end: (sessionId, callback) => {
        delete sessions[sessionId];
        callback();
    },
    set: (sessionId, key, value, callback) => {
        if (!sessions[sessionId]) sessions[sessionId] = {};
        sessions[sessionId][key] = value;
        if (callback) callback();
    },
    get: (sessionId, key, callback) => {
        const value = sessions[sessionId] ? sessions[sessionId][key] : null;
        callback(null, value);
    }
});
menu.startState({
    run: () => {
        menu.con('Welcome to Kolenge Sacco.\nPlease enter your password:');
    },
    next: {
        '*': 'login'
    }
});

menu.state('login', {
    run: async () => {
        const password = menu.val;
        const rawPhone = menu.args.phoneNumber || '';
        const username = rawPhone.replace('+', '');

        try {
            const result = await UserModel.authenticate(username, password);
            if (result.success) {
                if (!sessions[menu.args.sessionId]) sessions[menu.args.sessionId] = {};
                sessions[menu.args.sessionId]['token'] = result.token;
                sessions[menu.args.sessionId]['entityId'] = result.entityId;

                console.log(`[Login] Success. SID: ${menu.args.sessionId}, EntityId: ${result.entityId}`);

                menu.con(`Welcome back \n1. Deposit\n2. Withdrawal\n3. Check Balance\n4. Statement\n5. Repay Loan\n6. Apply Loan`);
            } else {
                console.log(`[Login] Failed. SID: ${menu.args.sessionId}, Message: ${result.message}`);
                menu.end('Login failed. ' + result.message);
            }
        } catch (error) {
            console.error(`[Login] Error SID: ${menu.args.sessionId}`, error);
            menu.end('An error occurred during login. Please try again later.');
        }
    },
    next: {
        '1': 'savings_deposit',
        '2': 'savings_withdrawal',
        '3': 'balanceMenu',
        '4': 'statementMenu',
        '5': 'loans_repay',
        '6': 'loans_apply'
    }
});


menu.state('mainMenu', {
    run: () => {
        menu.con(`Main Menu:\n1. Deposit\n2. Withdrawal\n3. Check Balance\n4. Statement\n5. Repay Loan\n6. Apply Loan`);
    },
    next: {
        '1': 'savings_deposit',
        '2': 'savings_withdrawal',
        '3': 'balanceMenu',
        '4': 'statementMenu',
        '5': 'loans_repay',
        '6': 'loans_apply'
    }
});

menu.state('balanceMenu', {
    run: () => {
        menu.con('Check Balance:\n1. Savings\n2. Loan\n0. Back');
    },
    next: {
        '1': 'savings_balance',
        '2': 'loans_active',
        '0': 'mainMenu'
    }
});

menu.state('statementMenu', {
    run: () => {
        menu.con('Statement:\n1. Savings\n2. Loans\n0. Back');
    },
    next: {
        '1': 'savings_statement',
        '2': 'loans_statement',
        '0': 'mainMenu'
    }
});

menu.state('savings_withdrawal', {
    run: () => {
        menu.con('Enter amount to withdraw:');
    },
    next: {
        '*\\d+': 'savings_withdrawal_process'
    }
});

menu.state('savings_withdrawal_process', {
    run: async () => {
        const amount = menu.val;
        const phoneNumber = menu.args.phoneNumber;

        // Reverting to direct sessions object for stability
        const entityId = sessions[menu.args.sessionId] ? sessions[menu.args.sessionId]['entityId'] : null;

        console.log(`[Withdrawal] Request. SID: ${menu.args.sessionId}, EntityId: ${entityId}, Amount: ${amount}`);

        const result = await SavingsModel.withdraw(phoneNumber, amount, entityId);
        if (result.success) {
            menu.con(`Successfully withdrew KSH ${amount}. New balance is KSH ${result.newBalance.toFixed(2)}\n0. Back to Main Menu`);
        } else {
            menu.con(`Error: ${result.message}\n0. Back to Main Menu`);
        }
    },
    next: {
        '0': 'mainMenu'
    }
});

menu.state('loans_repay', {
    run: () => {
        menu.con('Enter amount to repay:');
    },
    next: {
        '*\\d+': 'loans_repay_process'
    }
});

menu.state('loans_repay_process', {
    run: async () => {
        menu.end('Loan repayment functionality coming soon!');
    }
});

menu.state('savings_balance', {
    run: async () => {
        const phoneNumber = menu.args.phoneNumber;
        const entityId = sessions[menu.args.sessionId] ? sessions[menu.args.sessionId]['entityId'] : null;

        const result = await SavingsModel.getBalance(phoneNumber, entityId);
        if (result.success) {
            menu.con(`Your savings balance is KSH ${result.balance.toFixed(2)}\n0. Back to Main Menu`);
        } else {
            menu.con(`Error: ${result.message}\n0. Back to Main Menu`);
        }
    },
    next: {
        '0': 'mainMenu'
    }
});

menu.state('savings_deposit', {
    run: async () => {
        menu.con('Enter amount to deposit:');
    },
    next: {
        '*\\d+': 'savings_deposit_process'
    }
});

menu.state('savings_deposit_process', {
    run: async () => {
        const amount = menu.val;
        const phoneNumber = menu.args.phoneNumber;

        // Reverting to direct sessions object for stability
        const entityId = sessions[menu.args.sessionId] ? sessions[menu.args.sessionId]['entityId'] : null;

        console.log(`[Deposit] Request. SID: ${menu.args.sessionId}, EntityId: ${entityId}, Amount: ${amount}`);

        const result = await SavingsModel.deposit(phoneNumber, amount, entityId);
        if (result.success) {
            menu.con(`Successfully deposited KSH ${amount}. New balance is KSH ${result.newBalance.toFixed(2)}\n0. Back to Main Menu`);
        } else {
            menu.con(`Error: ${result.message}\n0. Back to Main Menu`);
        }
    },
    next: {
        '0': 'mainMenu'
    }
});

menu.state('savings_statement', {
    run: async () => {
        const phoneNumber = menu.args.phoneNumber;
        const result = await SavingsModel.getStatements(phoneNumber);
        if (result.success) {
            const statements = result.statements.slice(-3).join('\\n');
            menu.con(`Recent Statements:\\n${statements || 'No statements available.'}\n0. Back to Main Menu`);
        } else {
            menu.con(`Error: ${result.message}\n0. Back to Main Menu`);
        }
    },
    next: {
        '0': 'mainMenu'
    }
});

menu.state('loans_active', {
    run: async () => {
        const phoneNumber = menu.args.phoneNumber;
        const entityId = sessions[menu.args.sessionId] ? sessions[menu.args.sessionId]['entityId'] : null;

        const result = await SavingsModel.getBalance(phoneNumber, entityId);
        if (result.success) {
            menu.con(`Your total active loan balance is KSH ${result.loanBalance.toFixed(2)}\n0. Back to Main Menu`);
        } else {
            menu.con(`Error: ${result.message}\n0. Back to Main Menu`);
        }
    },
    next: {
        '0': 'mainMenu'
    }
});

menu.state('loans_statement', {
    run: async () => {
        const phoneNumber = menu.args.phoneNumber;
        const result = await LoanModel.getStatements(phoneNumber);
        if (result.success) {
            const statements = result.statements.slice(-3).join('\\n');
            menu.con(`Recent Loan Statements:\\n${statements || 'No statements available.'}\n0. Back to Main Menu`);
        } else {
            menu.con(`Error: ${result.message}\n0. Back to Main Menu`);
        }
    },
    next: {
        '0': 'mainMenu'
    }
});

menu.state('loans_apply', {
    run: () => {
        menu.con('Enter loan amount to apply for:');
    },
    next: {
        '*\\d+': 'loans_apply_process'
    }
});

menu.state('loans_apply_process', {
    run: async () => {
        const amount = menu.val;
        const phoneNumber = menu.args.phoneNumber;
        const result = await LoanModel.applyLoan(phoneNumber, amount);
        if (result.success) {
            menu.con(`Your loan application for KSH ${amount} was successful. Total active loans: KSH ${result.newTotal.toFixed(2)}.\n0. Back to Main Menu`);
        } else {
            menu.con(`Error: ${result.message}\n0. Back to Main Menu`);
        }
    },
    next: {
        '0': 'mainMenu'
    }
});

menu.state('account_change_password', {
    run: () => {
        menu.con('Enter new password:');
    },
    next: {
        '*[0-9a-zA-Z]+': 'account_change_password_process'
    }
});

menu.state('account_change_password_process', {
    run: async () => {
        const newPassword = menu.val;
        const phoneNumber = menu.args.phoneNumber;
        const result = await UserModel.updatePassword(phoneNumber, newPassword);
        if (result.success) {
            menu.con(`Your password has been changed successfully.\n0. Back to Main Menu`);
        } else {
            menu.con(`Error: ${result.message}\n0. Back to Main Menu`);
        }
    },
    next: {
        '0': 'mainMenu'
    }
});

module.exports = menu;
