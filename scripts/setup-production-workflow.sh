#!/bin/bash

# Production Workflow Setup Script
# Run this to set up your production development workflow

echo "🚀 Setting up Production Development Workflow..."

# 1. Create staging environment
echo "📦 Creating staging environment..."
vercel --target staging --name staging-credit-repair

# 2. Set up environment variables for staging
echo "🔧 Setting up staging environment variables..."
# Copy production env vars to staging (you'll need to do this manually in Vercel dashboard)

# 3. Create deployment scripts
echo "📝 Creating deployment scripts..."

# Create staging deployment script
cat > deploy-staging.sh << 'EOF'
#!/bin/bash
echo "🚀 Deploying to staging..."
git checkout develop
git pull origin develop
vercel --target staging
echo "✅ Staging deployment complete!"
EOF

# Create production deployment script
cat > deploy-production.sh << 'EOF'
#!/bin/bash
echo "🚀 Deploying to production..."
git checkout main
git pull origin main
vercel --prod
echo "✅ Production deployment complete!"
EOF

# Make scripts executable
chmod +x deploy-staging.sh
chmod +x deploy-production.sh

# 4. Set up monitoring
echo "📊 Setting up monitoring..."
npm install --save-dev @sentry/nextjs

# 5. Create git hooks
echo "🔗 Setting up git hooks..."
mkdir -p .git/hooks

# Pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "🔍 Running pre-commit checks..."
npm run lint
npm run test:run
echo "✅ Pre-commit checks passed!"
EOF

chmod +x .git/hooks/pre-commit

# 6. Create branch protection rules (instructions)
echo "🛡️  Branch Protection Setup Instructions:"
echo "1. Go to your GitHub repository settings"
echo "2. Navigate to 'Branches'"
echo "3. Add rule for 'main' branch:"
echo "   - Require pull request reviews"
echo "   - Require status checks to pass"
echo "   - Require branches to be up to date"
echo "   - Restrict pushes to main branch"

# 7. Create monitoring script
echo "📈 Creating monitoring script..."
cat > monitor-production.sh << 'EOF'
#!/bin/bash
echo "🔍 Monitoring production environment..."
node scripts/production-monitoring.js
EOF

chmod +x monitor-production.sh

echo "✅ Production workflow setup complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Set up staging environment variables in Vercel dashboard"
echo "2. Configure branch protection rules in GitHub"
echo "3. Set up Sentry for error monitoring"
echo "4. Test staging deployment: ./deploy-staging.sh"
echo "5. Test production deployment: ./deploy-production.sh"
echo ""
echo "🔧 Available Commands:"
echo "- ./deploy-staging.sh     - Deploy to staging"
echo "- ./deploy-production.sh  - Deploy to production"
echo "- ./monitor-production.sh - Monitor production health"
echo "- node scripts/emergency-rollback.js - Emergency rollback"
