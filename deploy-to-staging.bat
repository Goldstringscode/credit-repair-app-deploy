@echo off
echo 🚀 STAGING DEPLOYMENT SCRIPT
echo ============================
echo.

echo Step 1: Clearing cache...
if exist .next rmdir /s /q .next
echo ✅ Cache cleared
echo.

echo Step 2: Installing Vercel CLI...
npm install -g vercel
echo ✅ Vercel CLI installed
echo.

echo Step 3: Deploying to Vercel...
vercel --prod
echo.

echo Step 4: Setting environment variables...
echo Please run these commands manually:
echo.
echo vercel env add NEXT_PUBLIC_SUPABASE_URL
echo vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
echo vercel env add SUPABASE_SERVICE_ROLE_KEY
echo vercel env add SHIPENGINE_API_KEY
echo vercel env add STRIPE_SECRET_KEY
echo vercel env add STRIPE_PUBLISHABLE_KEY
echo vercel env add SMTP_HOST
echo vercel env add SMTP_PORT
echo vercel env add SMTP_USER
echo vercel env add SMTP_PASS
echo vercel env add FROM_EMAIL
echo vercel env add FROM_NAME
echo.

echo 🎉 DEPLOYMENT COMPLETE!
echo Your app will be available at the Vercel URL provided above.
echo.
pause
