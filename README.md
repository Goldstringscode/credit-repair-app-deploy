# Credit Repair AI App

A comprehensive AI-powered credit repair platform with automated dispute letter generation, credit monitoring, and professional tools.

## Features

- 🤖 AI-powered credit report analysis
- 📄 Automated dispute letter generation
- 📊 Credit monitoring and analytics
- 🔍 OCR text extraction from PDFs and images
- 💾 Database integration with Neon
- 🎨 Modern UI with shadcn/ui components

## Quick Start

1. **Clone and Install**
   \`\`\`bash
   npm install --legacy-peer-deps
   \`\`\`

2. **Set up Environment Variables**
   - Copy `.env.local` and add your actual credentials:
   - `NEON_DATABASE_URL`: Your Neon database connection string
   - `OPENAI_API_KEY`: Your OpenAI API key for AI analysis

3. **Set up Database**
   - Run the SQL schema in your Neon database console:
   \`\`\`sql
   -- Copy and run scripts/complete-database-schema.sql
   \`\`\`

4. **Start Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Test the System**
   - Visit `/test-setup` to verify all connections
   - Upload a credit report at `/dashboard/reports/upload`

## Environment Setup

### Required Variables
- `DATABASE_URL`: Neon PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API key for AI analysis

### Optional Variables
- `RESEND_API_KEY`: For email functionality
- `NEXT_PUBLIC_SUPABASE_URL`: If using Supabase features
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key

## Database Schema

The app uses PostgreSQL with the following main tables:
- `users`: User accounts
- `credit_reports`: Uploaded credit reports and analysis
- `credit_accounts`: Individual credit accounts
- `negative_items`: Negative items found in reports
- `credit_inquiries`: Credit inquiries

## API Endpoints

- `POST /api/upload/credit-reports`: Upload and analyze credit reports
- `GET /api/dashboard/stats`: Dashboard statistics
- `GET /api/dashboard/analytics`: Analytics data
- `GET /api/dashboard/monitoring`: Monitoring data

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: Neon PostgreSQL
- **AI**: OpenAI GPT-4 for analysis
- **UI**: shadcn/ui + Tailwind CSS
- **File Processing**: PDF.js + Tesseract.js for OCR
- **Authentication**: Ready for Supabase Auth

## Troubleshooting

1. **Upload Errors**: Ensure DATABASE_URL and OPENAI_API_KEY are set correctly
2. **Database Errors**: Run the complete database schema in Neon console
3. **Build Issues**: Use `npm install --legacy-peer-deps` for dependency resolution

## Support

Visit `/test-setup` to verify your configuration and troubleshoot issues.
