#!/bin/bash

# Enhanced Upload System Setup Script
# This script helps set up the credit report upload system

echo "🚀 Setting up Enhanced Credit Report Upload System..."
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp env-template.txt .env.local
    echo "✅ .env.local created from template"
    echo "⚠️  Please edit .env.local with your actual credentials"
else
    echo "✅ .env.local already exists"
fi

# Check environment variables
echo "🔍 Checking environment variables..."
if [ -f .env.local ]; then
    if grep -q "NEON_DATABASE_URL" .env.local; then
        echo "✅ NEON_DATABASE_URL is configured"
    else
        echo "⚠️  NEON_DATABASE_URL is not configured"
    fi
    
    if grep -q "OPENAI_API_KEY" .env.local; then
        echo "✅ OPENAI_API_KEY is configured"
    else
        echo "⚠️  OPENAI_API_KEY is not configured"
    fi
fi

# Create types directory if it doesn't exist
if [ ! -d "types" ]; then
    echo "📁 Creating types directory..."
    mkdir -p types
fi

# Check if types/pdf-parse.d.ts exists
if [ ! -f "types/pdf-parse.d.ts" ]; then
    echo "📝 Creating pdf-parse type definitions..."
    cat > types/pdf-parse.d.ts << 'EOF'
declare module 'pdf-parse' {
  interface PDFData {
    text: string
    numpages: number
    info: any
    metadata: any
    version: string
  }

  interface PDFParseOptions {
    normalizeWhitespace?: boolean
    disableCombineTextItems?: boolean
  }

  function pdfParse(buffer: Buffer | ArrayBuffer, options?: PDFParseOptions): Promise<PDFData>
  
  export = pdfParse
}
EOF
    echo "✅ pdf-parse type definitions created"
fi

# Check if database schema script exists
if [ -f "scripts/fix-upload-system-schema.sql" ]; then
    echo "✅ Database schema script found"
    echo "📋 Please run the following SQL script in your Neon database:"
    echo "   scripts/fix-upload-system-schema.sql"
else
    echo "❌ Database schema script not found"
fi

# Check if test page exists
if [ -f "app/test-upload-system/page.tsx" ]; then
    echo "✅ Upload system test page found"
    echo "🧪 Test the system at: /test-upload-system"
else
    echo "❌ Upload system test page not found"
fi

echo ""
echo "🎯 Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your database and API credentials"
echo "2. Run the database schema script in your Neon SQL Editor"
echo "3. Start the development server: npm run dev"
echo "4. Test the system at: /test-upload-system"
echo ""
echo "For detailed documentation, see: README-UPLOAD-SYSTEM-ENHANCED.md"
echo ""
echo "Happy coding! 🚀"
