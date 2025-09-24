@echo off
chcp 65001 >nul
echo 🚀 Setting up Enhanced Credit Report Upload System...
echo ==================================================

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check Node.js version
for /f "tokens=1,2 delims=." %%a in ('node -v') do (
    set NODE_VERSION=%%a
    set NODE_VERSION=!NODE_VERSION:~1!
)
if %NODE_VERSION% lss 18 (
    echo ❌ Node.js version 18+ is required. Current version: 
    node -v
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node -v

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ npm version: 
npm -v

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Check if .env.local exists
if not exist ".env.local" (
    echo 📝 Creating .env.local file...
    copy "env-template.txt" ".env.local" >nul
    echo ✅ .env.local created from template
    echo ⚠️  Please edit .env.local with your actual credentials
) else (
    echo ✅ .env.local already exists
)

REM Check environment variables
echo 🔍 Checking environment variables...
if exist ".env.local" (
    findstr "NEON_DATABASE_URL" ".env.local" >nul
    if %errorlevel% equ 0 (
        echo ✅ NEON_DATABASE_URL is configured
    ) else (
        echo ⚠️  NEON_DATABASE_URL is not configured
    )
    
    findstr "OPENAI_API_KEY" ".env.local" >nul
    if %errorlevel% equ 0 (
        echo ✅ OPENAI_API_KEY is configured
    ) else (
        echo ⚠️  OPENAI_API_KEY is not configured
    )
)

REM Create types directory if it doesn't exist
if not exist "types" (
    echo 📁 Creating types directory...
    mkdir "types"
)

REM Check if types/pdf-parse.d.ts exists
if not exist "types\pdf-parse.d.ts" (
    echo 📝 Creating pdf-parse type definitions...
    (
        echo declare module 'pdf-parse' {
        echo   interface PDFData {
        echo     text: string
        echo     numpages: number
        echo     info: any
        echo     metadata: any
        echo     version: string
        echo   }
        echo.
        echo   interface PDFParseOptions {
        echo     normalizeWhitespace?: boolean
        echo     disableCombineTextItems?: boolean
        echo   }
        echo.
        echo   function pdfParse^(buffer: Buffer ^| ArrayBuffer, options?: PDFParseOptions^): Promise^<PDFData^>
        echo.  
        echo   export = pdfParse
        echo }
    ) > "types\pdf-parse.d.ts"
    echo ✅ pdf-parse type definitions created
)

REM Check if database schema script exists
if exist "scripts\ultra-minimal-upload-system-schema.sql" (
    echo ✅ Ultra-minimal database schema script found (Most Safe)
    echo 📋 Please run the following SQL script in your Neon database:
    echo    scripts\ultra-minimal-upload-system-schema.sql
) else if exist "scripts\minimal-upload-system-schema.sql" (
    echo ✅ Minimal database schema script found (Recommended)
    echo 📋 Please run the following SQL script in your Neon database:
    echo    scripts\minimal-upload-system-schema.sql
) else if exist "scripts\safe-upload-system-schema.sql" (
    echo ✅ Safe database schema script found
    echo 📋 Please run the following SQL script in your Neon database:
    echo    scripts\safe-upload-system-schema.sql
) else if exist "scripts\fix-upload-system-schema.sql" (
    echo ✅ Database schema script found
    echo 📋 Please run the following SQL script in your Neon database:
    echo    scripts\fix-upload-system-schema.sql
) else (
    echo ❌ Database schema script not found
)

REM Check if diagnostic script exists
if exist "scripts\check-current-database.sql" (
    echo.
    echo 🔍 If you're getting column errors, run this diagnostic script first:
    echo    scripts\check-current-database.sql
)

REM Check if test page exists
if exist "app\test-upload-system\page.tsx" (
    echo ✅ Upload system test page found
    echo 🧪 Test the system at: /test-upload-system
) else (
    echo ❌ Upload system test page not found
)

echo.
echo 🎯 Setup Complete!
echo ==================
echo.
echo Next steps:
echo 1. Edit .env.local with your database and API credentials
echo 2. Run the database schema script in your Neon SQL Editor
echo 3. Start the development server: npm run dev
echo 4. Test the system at: /test-upload-system
echo.
echo For detailed documentation, see: README-UPLOAD-SYSTEM-ENHANCED.md
echo.
echo Happy coding! 🚀
pause
