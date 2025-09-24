import { NextRequest, NextResponse } from "next/server"
import { SuperiorCreditParser } from "@/lib/superior-credit-parser"

export async function POST(request: NextRequest) {
  try {
    const { testType } = await request.json()
    
    console.log("🧪 Testing Superior Parser Performance...")
    
    // Different test scenarios
    const testScenarios = {
      "basic": `CREDIT REPORT SUMMARY
EXPERIAN: 745
EQUIFAX: 738
TRANSUNION: 752

REVOLVING ACCOUNTS
CHASE BANK USA NA ****1234
Account Type: Credit Card
Balance: $1,500.00
Credit Limit: $5,000.00
Payment Status: Current

CAPITAL ONE BANK USA NA ****5678
Account Type: Credit Card
Balance: $750.00
Credit Limit: $3,000.00
Payment Status: Current`,

      "complex": `CREDIT REPORT SUMMARY
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
Status: Active`
    }
    
    const testData = testScenarios[testType as keyof typeof testScenarios] || testScenarios.complex
    
    console.log(`📄 Testing with ${testType} scenario (${testData.length} characters)`)
    
    const startTime = Date.now()
    const parser = new SuperiorCreditParser(testData)
    const result = await parser.parse()
    const endTime = Date.now()
    
    const performance = {
      parsingTime: endTime - startTime,
      textLength: testData.length,
      accountsPerSecond: result.accounts.length / ((endTime - startTime) / 1000),
      scoresPerSecond: result.scores.length / ((endTime - startTime) / 1000)
    }
    
    console.log("🎯 Performance test completed:", performance)
    
    return NextResponse.json({
      success: true,
      message: "Parser performance test completed successfully",
      testType,
      performance,
      result: {
        scores: result.scores,
        accounts: result.accounts,
        negativeItems: result.negativeItems,
        summary: result.summary,
        confidence: result.confidence,
        parsingMethod: result.parsingMethod
      }
    })
    
  } catch (error) {
    console.error("❌ Parser performance test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    )
  }
}
