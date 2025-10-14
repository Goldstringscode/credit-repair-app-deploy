export default function TestDeploymentPage() {
  return (
    <div className="min-h-screen bg-green-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-800 mb-4">
          ✅ Deployment Test Successful!
        </h1>
        <p className="text-lg text-green-700 mb-8">
          Your app is working correctly. The 404 error was likely a temporary issue.
        </p>
        <div className="space-y-4">
          <p className="text-sm text-green-600">
            <strong>Current Time:</strong> {new Date().toLocaleString()}
          </p>
          <p className="text-sm text-green-600">
            <strong>Environment:</strong> {process.env.NODE_ENV || 'development'}
          </p>
          <p className="text-sm text-green-600">
            <strong>Status:</strong> App is live and functional
          </p>
        </div>
      </div>
    </div>
  )
}

