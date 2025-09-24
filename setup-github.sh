#!/bin/bash

echo "🔗 GITHUB SETUP SCRIPT"
echo "======================"
echo

echo "Step 1: Initializing Git repository..."
git init
echo "✅ Git initialized"
echo

echo "Step 2: Adding all files..."
git add .
echo "✅ Files added"
echo

echo "Step 3: Creating initial commit..."
git commit -m "Initial commit: Credit Repair App with Certified Mail System"
echo "✅ Initial commit created"
echo

echo "Step 4: Setting up GitHub remote..."
echo "Please replace YOUR_USERNAME with your actual GitHub username"
echo
echo "Run these commands manually:"
echo
echo "git remote add origin https://github.com/YOUR_USERNAME/credit-repair-app.git"
echo "git branch -M main"
echo "git push -u origin main"
echo

echo "Step 5: Deploy to Vercel"
echo "1. Go to https://vercel.com"
echo "2. Sign up/Login with GitHub"
echo "3. Import your repository"
echo "4. Set environment variables"
echo "5. Deploy!"
echo

echo "🎉 SETUP COMPLETE!"
echo "Your app will be live at the Vercel URL."
