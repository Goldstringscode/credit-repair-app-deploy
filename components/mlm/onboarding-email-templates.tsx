"use client"

interface EmailTemplate {
  id: string
  name: string
  subject: string
  trigger: string
  delay: string
  content: string
}

const earnings = "$100" // Declare the earnings variable

export const onboardingEmailTemplates: EmailTemplate[] = [
  {
    id: "welcome",
    name: "Welcome Email",
    subject: "🎉 Welcome to Your MLM Journey - Let's Get Started!",
    trigger: "User completes onboarding wizard",
    delay: "Immediate",
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to Your MLM Success Journey! 🚀</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">You're about to transform your financial future</p>
        </div>
        
        <div style="padding: 30px 20px; background: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi {{firstName}},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Congratulations on taking the first step toward financial freedom! You've just joined thousands of successful entrepreneurs who are building their dream lifestyle through our proven MLM system.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Your Welcome Bonus: $50 Credit! 🎁</h3>
            <p style="color: #666; margin-bottom: 0;">We've added $50 to your account to help you get started. Use it for marketing materials, training courses, or your first product order.</p>
          </div>
          
          <h3 style="color: #333; margin-bottom: 15px;">Your Next Steps:</h3>
          <div style="margin-bottom: 20px;">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <div style="width: 24px; height: 24px; background: #667eea; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px; font-weight: bold; font-size: 12px;">1</div>
              <span style="color: #333;">Complete your profile and upload a professional photo</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <div style="width: 24px; height: 24px; background: #667eea; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px; font-weight: bold; font-size: 12px;">2</div>
              <span style="color: #333;">Connect with your sponsor: {{sponsorName}}</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <div style="width: 24px; height: 24px; background: #667eea; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px; font-weight: bold; font-size: 12px;">3</div>
              <span style="color: #333;">Complete the MLM Basics training course</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <div style="width: 24px; height: 24px; background: #667eea; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px; font-weight: bold; font-size: 12px;">4</div>
              <span style="color: #333;">Make your first referral and earn your first commission</span>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{dashboardUrl}}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Access Your Dashboard</a>
          </div>
          
          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745;">
            <p style="margin: 0; color: #155724;"><strong>Success Tip:</strong> The most successful MLM entrepreneurs complete their onboarding within the first 48 hours. Don't wait - start building your empire today!</p>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px;">
          <p>Questions? Reply to this email or contact support at support@creditaipro.com</p>
          <p>© 2024 CreditAI Pro MLM. All rights reserved.</p>
        </div>
      </div>
    `,
  },
  {
    id: "day-1-followup",
    name: "Day 1 Follow-up",
    subject: "🎯 Your MLM Success Plan - Day 1 Check-in",
    trigger: "24 hours after onboarding",
    delay: "24 hours",
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 30px 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">Day 1 Complete! 🎉</h1>
          <p style="color: #666; margin: 10px 0 0 0;">Let's keep the momentum going</p>
        </div>
        
        <div style="padding: 30px 20px; background: white;">
          <h2 style="color: #333;">Hi {{firstName}},</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Congratulations on completing your first day as an MLM entrepreneur! You're already ahead of 80% of people who never take action on their dreams.
          </p>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <h3 style="color: #856404; margin-top: 0;">Your Progress So Far:</h3>
            <ul style="color: #856404; margin: 0; padding-left: 20px;">
              <li>✅ Onboarding completed</li>
              <li>✅ Welcome bonus claimed</li>
              <li>{{#if profileComplete}}✅{{else}}⏳{{/if}} Profile setup</li>
              <li>{{#if trainingStarted}}✅{{else}}⏳{{/if}} Training started</li>
            </ul>
          </div>
          
          <h3 style="color: #333;">Today's Focus: Complete Your Training</h3>
          <p style="color: #666;">
            The most successful MLM entrepreneurs invest in their education first. Our MLM Basics course will give you the foundation you need to succeed.
          </p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="{{trainingUrl}}" style="background: #28a745; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Start Training Now</a>
          </div>
          
          <div style="background: #d1ecf1; padding: 15px; border-radius: 8px; border-left: 4px solid #17a2b8;">
            <p style="margin: 0; color: #0c5460;"><strong>Quick Win:</strong> Share your MLM journey on social media and tag 3 friends. This simple action often leads to your first referral!</p>
          </div>
        </div>
      </div>
    `,
  },
  {
    id: "training-reminder",
    name: "Training Reminder",
    subject: "⏰ Don't Miss Out - Complete Your MLM Training",
    trigger: "User hasn't started training after 3 days",
    delay: "72 hours",
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc3545; padding: 30px 20px; text-align: center; color: white;">
          <h1 style="margin: 0;">Don't Let Success Slip Away! ⚠️</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your training is waiting for you</p>
        </div>
        
        <div style="padding: 30px 20px; background: white;">
          <h2 style="color: #333;">Hi {{firstName}},</h2>
          
          <p style="color: #666; line-height: 1.6;">
            I noticed you haven't started your MLM training yet. I understand life gets busy, but I don't want you to miss out on the success that's waiting for you.
          </p>
          
          <div style="background: #f8d7da; padding: 15px; border-radius: 8px; border-left: 4px solid #dc3545; margin: 20px 0;">
            <h3 style="color: #721c24; margin-top: 0;">Here's What You're Missing:</h3>
            <ul style="color: #721c24; margin: 0; padding-left: 20px;">
              <li>Proven strategies that generate $1,000+ monthly</li>
              <li>Scripts that convert prospects into customers</li>
              <li>Team building techniques from top earners</li>
              <li>Social media marketing blueprints</li>
            </ul>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            <strong>The training takes just 45 minutes</strong> and could be the difference between struggling and thriving in your MLM business.
          </p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="{{trainingUrl}}" style="background: #dc3545; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Start Training Now</a>
          </div>
          
          <p style="color: #666; font-style: italic; text-align: center;">
            "The best time to plant a tree was 20 years ago. The second best time is now." - Chinese Proverb
          </p>
        </div>
      </div>
    `,
  },
  {
    id: "first-week-celebration",
    name: "First Week Celebration",
    subject: "🎊 One Week Strong - You're Crushing It!",
    trigger: "7 days after onboarding",
    delay: "7 days",
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 40px 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">One Week Anniversary! 🎊</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">You're building something amazing</p>
        </div>
        
        <div style="padding: 30px 20px; background: white;">
          <h2 style="color: #333;">Congratulations {{firstName}}!</h2>
          
          <p style="color: #666; line-height: 1.6;">
            It's been one week since you started your MLM journey, and I wanted to take a moment to celebrate your commitment and progress!
          </p>
          
          <div style="background: #d4edda; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
            <h3 style="color: #155724; margin-top: 0;">Your Week 1 Achievements:</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
              <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #28a745;">{{tasksCompleted}}</div>
                <div style="color: #155724; font-size: 14px;">Tasks Completed</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #28a745;">{{pointsEarned}}</div>
                <div style="color: #155724; font-size: 14px;">Points Earned</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #28a745;">{{currentRank}}</div>
                <div style="color: #155724; font-size: 14px;">Current Rank</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 24px; font-weight: bold; color: #28a745;">${earnings}</div>
                <div style="color: #155724; font-size: 14px;">Earnings</div>
              </div>
            </div>
          </div>
          
          <h3 style="color: #333;">Week 2 Goals:</h3>
          <ul style="color: #666; line-height: 1.8;">
            <li>Complete advanced training modules</li>
            <li>Make your first 3 referrals</li>
            <li>Set up your social media marketing</li>
            <li>Connect with 5 potential prospects</li>
          </ul>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="{{dashboardUrl}}" style="background: #28a745; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Continue Your Journey</a>
          </div>
          
          <div style="background: #cce5ff; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff;">
            <p style="margin: 0; color: #004085;"><strong>Success Story:</strong> Sarah from Texas made her first $500 in week 2 by following our proven system. You're on the same path to success!</p>
          </div>
        </div>
      </div>
    `,
  },
]

export function OnboardingEmailTemplates() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">MLM Onboarding Email Sequence</h2>
        <p className="text-gray-600 mb-6">
          Automated email templates that guide new MLM users through their first week and beyond.
        </p>
      </div>

      {onboardingEmailTemplates.map((template, index) => (
        <div key={template.id} className="border rounded-lg p-6 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">{template.name}</h3>
              <p className="text-sm text-gray-600">
                Trigger: {template.trigger} • Delay: {template.delay}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-blue-600">Email #{index + 1}</div>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700 mb-1">Subject Line:</div>
            <div className="text-sm bg-gray-50 p-2 rounded border">{template.subject}</div>
          </div>

          <div className="text-sm text-gray-600">
            <div className="font-medium mb-2">Preview:</div>
            <div
              className="bg-gray-50 p-4 rounded border max-h-40 overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: template.content.substring(0, 500) + "..." }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
