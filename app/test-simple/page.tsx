'use client'

export default function TestSimplePage() {
  return (
    <div>
      <h1>Simple Test Page</h1>
      <p>This page should always show</p>
      <div style={{ border: '1px solid red', padding: '20px', margin: '20px' }}>
        <h2>AuthWrapper Test</h2>
        <p>If you can see this, the page is working</p>
      </div>
    </div>
  )
}