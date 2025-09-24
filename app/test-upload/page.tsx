import { CreditReportUpload } from "@/components/credit-report-upload"

export default function TestUploadPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Credit Report Upload Test</h1>
          <p className="text-muted-foreground">
            Test the credit report upload and analysis system. Upload a PDF credit report to see the AI analysis in action.
          </p>
        </div>
        
        <CreditReportUpload />
        
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Test Instructions:</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>Prepare a credit report PDF file (or create a test one with credit information)</li>
            <li>Click "Choose File" and select your PDF</li>
            <li>Optionally select a credit bureau</li>
            <li>Click "Upload & Analyze"</li>
            <li>Wait for the AI analysis to complete</li>
            <li>Review the extracted credit scores, accounts, and recommendations</li>
          </ol>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-medium text-blue-900 mb-1">Sample Test Data:</h3>
            <p className="text-sm text-blue-800">
              For testing, you can create a simple text file with content like: "Your credit score is 720. 
              Chase Bank ending in 1234 has a balance of $2,500. Capital One ending in 5678 has a balance of $1,200."
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
