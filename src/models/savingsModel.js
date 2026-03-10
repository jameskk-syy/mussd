const axios = require('axios');
const xml2js = require('xml2js');

const DEPOSIT_URL = process.env.SAVINGS_DEPOSIT_URL;
const WITHDRAWAL_URL = process.env.SAVINGS_WITHDRAWAL_URL;

class SavingsModel {
    static async getBalance(phoneNumber) {
        return { success: true, balance: 1000.00 };
    }

    static async deposit(phoneNumber, amount, entityId) {
        const username = phoneNumber.replace('+', '');
        const ref = 'REF' + Date.now();
        const msgId = 'MSG' + Date.now();
        const bankCode = entityId || '2001';

        const xml = `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:vmt="http://VMTComponentModel/InterfaceSpecification/Interfaces/C4/VMTtoFSPService" xmlns:c4="http://VMTComponentModel/InterfaceSpecification/FSPDefined/Messages/C4/" xmlns:vmt1="http://schemas.datacontract.org/2004/07/VMT.BankingIntegration.FSIC4Simulator.Common">
   <soapenv:Body>
      <vmt:VMTInitiatedSavingsDeposit>
         <vmt:request>
            <c4:BankShortCode>${bankCode}</c4:BankShortCode>
            <c4:FSIIdentityId>
               <vmt1:MSISDN>${username}</vmt1:MSISDN>
               <vmt1:VmtReferenceNumber>${ref}</vmt1:VmtReferenceNumber>
            </c4:FSIIdentityId>
            <c4:MessageId>
               <vmt1:Id>${msgId}</vmt1:Id>
               <vmt1:TimeStamp>${new Date().toISOString()}</vmt1:TimeStamp>
            </c4:MessageId>
            <c4:TransactionId>0</c4:TransactionId>
            <c4:TransactionReceiptNumber>${ref}</c4:TransactionReceiptNumber>
            <c4:TransactionTypeName>SavingsDeposit</c4:TransactionTypeName>
            <c4:FSILinkType>Third-Party FI Link Type</c4:FSILinkType>
            <c4:FIAccountNumber>${username}</c4:FIAccountNumber>
            <c4:Amount>${amount}</c4:Amount>
         </vmt:request>
      </vmt:VMTInitiatedSavingsDeposit>
   </soapenv:Body>
</soapenv:Envelope>`;

        try {
            const response = await axios.post(DEPOSIT_URL, xml, {
                headers: { 'Content-Type': 'text/xml' },
                timeout: 15000
            });

            const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: true });
            const result = await parser.parseStringPromise(response.data);
            const body = result['soapenv:Envelope']['soapenv:Body']['vmt:VMTInitiatedSavingsDepositResponse']['vmt:VMTInitiatedSavingsDepositResult'];

            if (body['c4:BankResponseCode'] === 'S0') {
                return { success: true, newBalance: parseFloat(body['c4:Balance']) };
            } else {
                return { success: false, message: body['c4:AdditionalInformation'] || 'Deposit failed' };
            }
        } catch (error) {
            console.error('Savings Deposit Error:', error.message);
            return { success: false, message: 'Deposit service unavailable' };
        }
    }

    static async withdraw(phoneNumber, amount, entityId) {
        const username = phoneNumber.replace('+', '');
        const ref = 'REF' + Date.now();
        const msgId = 'MSG' + Date.now();
        const bankCode = entityId || '2001';

        const xml = `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:vmt="http://VMTComponentModel/InterfaceSpecification/Interfaces/C4/VMTtoFSPService" xmlns:c4="http://VMTComponentModel/InterfaceSpecification/FSPDefined/Messages/C4/" xmlns:vmt1="http://schemas.datacontract.org/2004/07/VMT.BankingIntegration.FSIC4Simulator.Common">
   <soapenv:Body>
      <vmt:VMTInitiatedSavingsWithdrawal>
         <vmt:request>
            <c4:BankShortCode>${bankCode}</c4:BankShortCode>
            <c4:FSIIdentityId>
               <vmt1:MSISDN>${username}</vmt1:MSISDN>
               <vmt1:VmtReferenceNumber>${ref}</vmt1:VmtReferenceNumber>
            </c4:FSIIdentityId>
            <c4:MessageId>
               <vmt1:Id>${msgId}</vmt1:Id>
               <vmt1:TimeStamp>${new Date().toISOString()}</vmt1:TimeStamp>
            </c4:MessageId>
            <c4:TransactionId>0</c4:TransactionId>
            <c4:TransactionReceiptNumber>${ref}</c4:TransactionReceiptNumber>
            <c4:TransactionTypeName>SavingsWithdrawal</c4:TransactionTypeName>
            <c4:FSILinkType>Third-Party FI Link Type</c4:FSILinkType>
            <c4:FIAccountNumber>${username}</c4:FIAccountNumber>
            <c4:Amount>${amount}</c4:Amount>
         </vmt:request>
      </vmt:VMTInitiatedSavingsWithdrawal>
   </soapenv:Body>
</soapenv:Envelope>`;

        try {
            const response = await axios.post(WITHDRAWAL_URL, xml, {
                headers: { 'Content-Type': 'text/xml' },
                timeout: 15000
            });

            const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: true });
            const result = await parser.parseStringPromise(response.data);
            const body = result['soapenv:Envelope']['soapenv:Body']['vmt:VMTInitiatedSavingsWithdrawalResponse']['vmt:VMTInitiatedSavingsWithdrawalResult'];

            if (body['c4:BankResponseCode'] === 'S0') {
                return { success: true, newBalance: parseFloat(body['c4:Balance']) };
            } else {
                return { success: false, message: body['c4:AdditionalInformation'] || 'Withdrawal failed' };
            }
        } catch (error) {
            console.error('Savings Withdrawal Error:', error.message);
            return { success: false, message: 'Withdrawal service unavailable' };
        }
    }

    static async getStatements(phoneNumber) {
        return { success: true, statements: [] };
    }
}

module.exports = SavingsModel;
