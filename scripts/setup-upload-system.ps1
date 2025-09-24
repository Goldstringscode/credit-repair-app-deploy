# Enhanced Upload System Setup Script for Windows PowerShell
# This script helps set up the credit report upload system

Write-Host "🚀 Setting up Enhanced Credit Report Upload System..." -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check Node.js version
$nodeMajorVersion = [int]($nodeVersion -replace 'v', '' -split '\.')[0]
if ($nodeMajorVersion -lt 18) {
    Write-Host "❌ Node.js version 18+ is required. Current version: $nodeVersion" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed. Please install npm first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "📝 Creating .env.local file..." -ForegroundColor Yellow
    if (Test-Path "env-template.txt") {
        Copy-Item "env-template.txt" ".env.local"
        Write-Host "✅ .env.local created from template" -ForegroundColor Green
        Write-Host "⚠️  Please edit .env.local with your actual credentials" -ForegroundColor Yellow
    } else {
        Write-Host "❌ env-template.txt not found" -ForegroundColor Red
    }
} else {
    Write-Host "✅ .env.local already exists" -ForegroundColor Green
}

# Check environment variables
Write-Host "🔍 Checking environment variables..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local"
    
    if ($envContent -match "NEON_DATABASE_URL") {
        Write-Host "✅ NEON_DATABASE_URL is configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  NEON_DATABASE_URL is not configured" -ForegroundColor Yellow
    }
    
    if ($envContent -match "OPENAI_API_KEY") {
        Write-Host "✅ OPENAI_API_KEY is configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  OPENAI_API_KEY is not configured" -ForegroundColor Yellow
    }
}

# Create types directory if it doesn't exist
if (-not (Test-Path "types")) {
    Write-Host "📁 Creating types directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "types" -Force | Out-Null
}

# Check if types/pdf-parse.d.ts exists
if (-not (Test-Path "types\pdf-parse.d.ts")) {
    Write-Host "📝 Creating pdf-parse type definitions..." -ForegroundColor Yellow
    $typeContent = @"
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
"@
    $typeContent | Out-File -FilePath "types\pdf-parse.d.ts" -Encoding UTF8
    Write-Host "✅ pdf-parse type definitions created" -ForegroundColor Green
}

# Check if database schema script exists
if (Test-Path "scripts\ultra-minimal-upload-system-schema.sql") {
    Write-Host "✅ Ultra-minimal database schema script found (Most Safe)" -ForegroundColor Green
    Write-Host "📋 Please run the following SQL script in your Neon database:" -ForegroundColor Yellow
    Write-Host "   scripts\ultra-minimal-upload-system-schema.sql" -ForegroundColor Cyan
} elseif (Test-Path "scripts\minimal-upload-system-schema.sql") {
    Write-Host "✅ Minimal database schema script found (Recommended)" -ForegroundColor Green
    Write-Host "📋 Please run the following SQL script in your Neon database:" -ForegroundColor Yellow
    Write-Host "   scripts\minimal-upload-system-schema.sql" -ForegroundColor Cyan
} elseif (Test-Path "scripts\safe-upload-system-schema.sql") {
    Write-Host "✅ Safe database schema script found" -ForegroundColor Green
    Write-Host "📋 Please run the following SQL script in your Neon database:" -ForegroundColor Yellow
    Write-Host "   scripts\safe-upload-system-schema.sql" -ForegroundColor Cyan
} elseif (Test-Path "scripts\fix-upload-system-schema.sql") {
    Write-Host "✅ Database schema script found" -ForegroundColor Green
    Write-Host "📋 Please run the following SQL script in your Neon database:" -ForegroundColor Yellow
    Write-Host "   scripts\fix-upload-system-schema.sql" -ForegroundColor Cyan
} else {
    Write-Host "❌ Database schema script not found" -ForegroundColor Red
}

# Check if diagnostic script exists
if (Test-Path "scripts\check-current-database.sql") {
    Write-Host ""
    Write-Host "🔍 If you're getting column errors, run this diagnostic script first:" -ForegroundColor Yellow
    Write-Host "   scripts\check-current-database.sql" -ForegroundColor Cyan
}

# Check if test page exists
if (Test-Path "app\test-upload-system\page.tsx") {
    Write-Host "✅ Upload system test page found" -ForegroundColor Green
    Write-Host "🧪 Test the system at: /test-upload-system" -ForegroundColor Cyan
} else {
    Write-Host "❌ Upload system test page not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Setup Complete!" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env.local with your database and API credentials" -ForegroundColor White
Write-Host "2. Run the database schema script in your Neon SQL Editor" -ForegroundColor White
Write-Host "3. Start the development server: npm run dev" -ForegroundColor White
Write-Host "4. Test the system at: /test-upload-system" -ForegroundColor White
Write-Host ""
Write-Host "For detailed documentation, see: README-UPLOAD-SYSTEM-ENHANCED.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green

Read-Host "Press Enter to exit"
