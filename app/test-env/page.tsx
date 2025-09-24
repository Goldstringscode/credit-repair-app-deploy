export default function TestEnvPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Test</h1>
      <div className="space-y-2">
        <p>
          <strong>Publishable Key:</strong>{" "}
          {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? "✅ Loaded" : "❌ Missing"}
        </p>
        <p>
          <strong>Key starts with:</strong>{" "}
          {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 10) || "Not found"}
        </p>
        <p>
          <strong>Domain:</strong> {process.env.NEXT_PUBLIC_DOMAIN || "Not set"}
        </p>
      </div>
    </div>
  )
}
