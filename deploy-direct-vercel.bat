@echo off
echo 🚀 DIRECT VERCEL DEPLOYMENT
echo ===========================
echo.

echo Step 1: Installing Vercel CLI...
npm install -g vercel
echo ✅ Vercel CLI installed
echo.

echo Step 2: Clearing cache...
if exist .next rmdir /s /q .next
echo ✅ Cache cleared
echo.

echo Step 3: Deploying to Vercel...
echo This will open your browser to login to Vercel
vercel --prod
echo.

echo Step 4: Setting environment variables...
echo After deployment, you'll need to set these in Vercel dashboard:
echo.
echo NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
echo SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
echo SHIPENGINE_API_KEY=your_shipengine_key
echo STRIPE_SECRET_KEY=your_stripe_secret_key
echo STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
echo SMTP_HOST=your_smtp_host
echo SMTP_PORT=your_smtp_port
echo SMTP_USER=your_smtp_user
echo SMTP_PASS=your_smtp_password
echo FROM_EMAIL=your_from_email
echo FROM_NAME=your_from_name
echo.

echo 🎉 DEPLOYMENT COMPLETE!
echo Your app will be live at the Vercel URL provided above.
echo.
pause
