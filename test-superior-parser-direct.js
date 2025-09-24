// Test the Superior Credit Parser directly without database
const { SuperiorCreditParser } = require('./lib/superior-credit-parser.ts');

// Test data that matches the actual test data format
const testData = `CREDIT REPORT SUMMARY
EXPERIAN: 745
EQUIFAX: 738
TRANSUNION: 752

REVOLVING ACCOUNTS
CHASE BANK USA NA ****1234
Account Type: Credit Card
Status: Open
Balance: $1,500.00
Credit Limit: $5,000.00
Payment Status: Current
Opened: 03/2018
Last Activity: 12/2024

CAPITAL ONE BANK USA NA ****5678
Account Type: Credit Card
Status: Open
Balance: $750.00
Credit Limit: $3,000.00
Payment Status: Current
Opened: 06/2019
Last Activity: 12/2024

WELLS FARGO BANK NA ****9012
Account Type: Credit Card
Status: Open
Balance: $2,200.00
Credit Limit: $7,500.00
Payment Status: Current
Opened: 09/2017
Last Activity: 12/2024

CITIBANK NA ****3456
Account Type: Credit Card
Status: Open
Balance: $0.00
Credit Limit: $4,000.00
Payment Status: Current
Opened: 11/2016
Last Activity: 12/2024

DISCOVER BANK ****7890
Account Type: Credit Card
Status: Open
Balance: $3,100.00
Credit Limit: $8,000.00
Payment Status: Current
Opened: 05/2018
Last Activity: 12/2024

AMERICAN EXPRESS ****2345
Account Type: Credit Card
Status: Open
Balance: $1,800.00
Credit Limit: $6,000.00
Payment Status: Current
Opened: 08/2019
Last Activity: 12/2024

BARCLAYS BANK DELAWARE ****6789
Account Type: Credit Card
Status: Open
Balance: $950.00
Credit Limit: $3,500.00
Payment Status: Current
Opened: 12/2017
Last Activity: 12/2024

SYNCHRONY BANK ****0123
Account Type: Credit Card
Status: Open
Balance: $2,500.00
Credit Limit: $5,500.00
Payment Status: Current
Opened: 04/2018
Last Activity: 12/2024

US BANK NA ****4567
Account Type: Credit Card
Status: Open
Balance: $1,200.00
Credit Limit: $4,500.00
Payment Status: Current
Opened: 07/2019
Last Activity: 12/2024

INSTALLMENT ACCOUNTS
WELLS FARGO AUTO LOAN ****2345
Account Type: Auto Loan
Status: Open
Balance: $8,500.00
Original Amount: $25,000.00
Payment Status: Current
Opened: 06/2020
Last Activity: 12/2024

NAVY FEDERAL CREDIT UNION ****6789
Account Type: Personal Loan
Status: Open
Balance: $3,200.00
Original Amount: $10,000.00
Payment Status: Current
Opened: 03/2021
Last Activity: 12/2024

SALLIE MAE ****0123
Account Type: Student Loan
Status: Open
Balance: $12,000.00
Original Amount: $15,000.00
Payment Status: Current
Opened: 09/2015
Last Activity: 12/2024

QUICKEN LOANS ****4567
Account Type: Mortgage
Status: Open
Balance: $180,000.00
Original Amount: $250,000.00
Payment Status: Current
Opened: 12/2016
Last Activity: 12/2024

NEGATIVE ITEMS SECTION
Collection Account - MEDICAL BILLS
Creditor: ABC MEDICAL CENTER
Amount: $250.00
Date Reported: 08/2023
Status: Active

Late Payment - 30 Days
Creditor: CAPITAL ONE BANK
Account: ****5678
Date Reported: 11/2023
Status: Active

Charge Off Account
Creditor: XYZ STORE CREDIT
Amount: $450.00
Date Reported: 06/2023
Status: Active

Public Record - Tax Lien
Creditor: STATE TAX AUTHORITY
Amount: $1,200.00
Date Filed: 03/2023
Status: Active`;

async function testSuperiorParser() {
  console.log('🧪 Testing Superior Credit Parser Directly...');
  console.log(`📄 Test data length: ${testData.length} characters`);
  
  try {
    const parser = new SuperiorCreditParser(testData);
    const result = await parser.parse();
    
    console.log('\n📊 PARSING RESULTS:');
    console.log(`✅ Credit Scores: ${result.scores.length}`);
    console.log(`✅ Credit Accounts: ${result.accounts.length}`);
    console.log(`✅ Negative Items: ${result.negativeItems.length}`);
    console.log(`✅ Confidence: ${result.confidence}`);
    console.log(`✅ Method: ${result.parsingMethod}`);
    
    console.log('\n🏦 ACCOUNTS FOUND:');
    result.accounts.forEach((account, index) => {
      console.log(`${index + 1}. ${account.creditor} - ${account.accountType} - $${account.balance}`);
    });
    
    console.log('\n⚠️ NEGATIVE ITEMS FOUND:');
    result.negativeItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.type} - ${item.creditor} - $${item.amount}`);
    });
    
    console.log('\n📈 SUMMARY:');
    console.log(`Total Accounts: ${result.summary.totalAccounts}`);
    console.log(`Total Debt: $${result.summary.totalDebt}`);
    console.log(`Utilization Rate: ${result.summary.utilizationRate.toFixed(1)}%`);
    
    // Check if we're getting close to 29 accounts
    if (result.accounts.length >= 25) {
      console.log('\n🎉 SUCCESS: Parser is detecting most accounts!');
    } else if (result.accounts.length >= 15) {
      console.log('\n🟡 PARTIAL: Parser is detecting some accounts, but needs improvement');
    } else {
      console.log('\n❌ ISSUE: Parser is not detecting enough accounts');
    }
    
    // Show what we're missing
    if (result.accounts.length < 29) {
      console.log(`\n🔍 Missing ${29 - result.accounts.length} accounts. Expected 29, found ${result.accounts.length}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing parser:', error);
  }
}

testSuperiorParser();
