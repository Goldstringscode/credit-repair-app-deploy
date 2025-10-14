"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Scale,
  Target,
  FileText,
  Clock,
  Shield,
  AlertCircle,
  CheckCircle,
  Calendar,
  DollarSign,
  Download,
  MessageSquare,
  Phone,
  Video,
  Map,
  Lightbulb,
  Zap,
} from "lucide-react"

export default function LegalStrategyPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [strategyData, setStrategyData] = useState({
    caseType: "",
    currentSituation: "",
    goals: [] as string[],
    timeline: "",
    budget: "",
    riskTolerance: "",
    previousActions: "",
    obstacles: "",
    resources: "",
    preferredApproach: "",
    consultationType: "comprehensive",
  })

  const [generatedStrategy, setGeneratedStrategy] = useState({
    executiveSummary: "",
    phaseBreakdown: [] as Array<{ phase: string; duration: string; objectives: string[]; deliverables: string[]; cost: string; successMetrics: string[] }>,
    riskAssessment: "",
    costBenefit: "",
    timeline: "",
    nextSteps: "",
    contingencyPlans: "",
  })

  const strategyTypes = [
    {
      id: "comprehensive",
      name: "Comprehensive Legal Strategy",
      description: "Complete strategic plan with multiple phases and contingencies",
      price: 299,
      duration: "5-7 business days",
      includes: [
        "Multi-phase strategic plan",
        "Risk assessment & mitigation",
        "Cost-benefit analysis",
        "Timeline with milestones",
        "Contingency planning",
        "Implementation roadmap",
        "30-day follow-up consultation",
      ],
    },
    {
      id: "focused",
      name: "Focused Strategy Session",
      description: "Targeted strategy for specific legal issue or challenge",
      price: 199,
      duration: "2-3 business days",
      includes: [
        "Focused strategic analysis",
        "Specific action plan",
        "Risk evaluation",
        "Resource requirements",
        "Success metrics",
        "Implementation guide",
      ],
    },
    {
      id: "litigation-prep",
      name: "Litigation Strategy",
      description: "Comprehensive litigation preparation and strategy development",
      price: 499,
      duration: "7-10 business days",
      includes: [
        "Case strength analysis",
        "Discovery strategy",
        "Settlement evaluation",
        "Trial preparation plan",
        "Expert witness strategy",
        "Evidence compilation plan",
        "Ongoing strategic support",
      ],
    },
  ]

  const goalOptions = [
    "Remove inaccurate credit report items",
    "Increase credit score by specific amount",
    "Prepare for mortgage application",
    "Stop collection harassment",
    "Resolve identity theft issues",
    "File FCRA lawsuit",
    "Negotiate debt settlements",
    "Rebuild credit after bankruptcy",
    "Establish legal precedent",
    "Recover damages from violations",
  ]

  const progressPercentage = (currentStep / 4) * 100

  const generateStrategy = async () => {
    setLoading(true)
    // Simulate AI strategy generation
    await new Promise((resolve) => setTimeout(resolve, 4000))

    const strategy = {
      executiveSummary: `EXECUTIVE SUMMARY

Client: [Client Name]
Case Type: ${strategyData.caseType}
Strategic Objective: ${strategyData.goals.join(", ")}
Timeline: ${strategyData.timeline}
Budget: ${strategyData.budget}

STRATEGIC OVERVIEW:
Based on comprehensive analysis of your case, we recommend a multi-phase approach that maximizes success probability while minimizing legal risks and costs. This strategy leverages current consumer protection laws, recent court precedents, and proven tactics that have achieved favorable outcomes in similar cases.

KEY SUCCESS FACTORS:
• Strong legal foundation under FCRA, FDCPA, and state consumer protection laws
• Documented evidence of violations and damages
• Strategic timing of legal actions to maximize leverage
• Professional presentation that commands respect from opposing parties
• Clear escalation path with defined success metrics

PROBABILITY OF SUCCESS: 87% based on case analysis and historical data
ESTIMATED TIMELINE: ${strategyData.timeline}
TOTAL INVESTMENT: ${strategyData.budget}
EXPECTED ROI: 450-800% based on credit score improvement and damage recovery`,

      phaseBreakdown: [
        {
          phase: "Phase 1: Foundation & Documentation",
          duration: "Weeks 1-2",
          objectives: [
            "Comprehensive case documentation and evidence compilation",
            "Legal research and precedent analysis",
            "Initial demand letters and formal notices",
            "Establish attorney-client relationship and legal privilege",
          ],
          deliverables: [
            "Complete case file with organized evidence",
            "Legal research memorandum",
            "Formal demand letters",
            "Documentation tracking system",
          ],
          cost: "$500-750",
          successMetrics: [
            "All evidence properly documented",
            "Legal foundation established",
            "Initial responses received",
          ],
        },
        {
          phase: "Phase 2: Strategic Enforcement",
          duration: "Weeks 3-6",
          objectives: [
            "Execute primary dispute and enforcement actions",
            "Monitor compliance and responses",
            "Escalate non-compliant parties",
            "Document violations for potential litigation",
          ],
          deliverables: [
            "Formal disputes filed with all bureaus",
            "FCRA compliance monitoring",
            "Violation documentation",
            "Progress reports and updates",
          ],
          cost: "$750-1,200",
          successMetrics: ["70% of disputed items removed", "Documented FCRA violations", "Improved credit scores"],
        },
        {
          phase: "Phase 3: Advanced Tactics & Litigation Prep",
          duration: "Weeks 7-10",
          objectives: [
            "Deploy advanced legal strategies",
            "Prepare litigation if necessary",
            "Negotiate settlements where appropriate",
            "Maximize damage recovery",
          ],
          deliverables: [
            "Advanced legal filings",
            "Litigation preparation documents",
            "Settlement negotiations",
            "Damage calculations",
          ],
          cost: "$1,000-2,000",
          successMetrics: ["90% dispute success rate", "Settlement offers received", "Litigation readiness achieved"],
        },
        {
          phase: "Phase 4: Resolution & Optimization",
          duration: "Weeks 11-12",
          objectives: [
            "Finalize all resolutions",
            "Optimize credit profile",
            "Implement long-term protection strategies",
            "Document lessons learned",
          ],
          deliverables: [
            "Final settlement agreements",
            "Optimized credit reports",
            "Protection strategies",
            "Case closure documentation",
          ],
          cost: "$300-500",
          successMetrics: ["All objectives achieved", "Credit score targets met", "Legal protections in place"],
        },
      ],

      riskAssessment: `RISK ASSESSMENT & MITIGATION

HIGH-PROBABILITY RISKS:
1. Credit Bureau Non-Compliance (Probability: 40%)
   - Mitigation: Documented FCRA violations create litigation leverage
   - Backup Plan: Federal court filing with statutory damages claim

2. Creditor Pushback (Probability: 30%)
   - Mitigation: Strong legal foundation and evidence documentation
   - Backup Plan: Settlement negotiations with favorable terms

3. Extended Timeline (Probability: 25%)
   - Mitigation: Aggressive follow-up and escalation procedures
   - Backup Plan: Expedited legal proceedings and emergency motions

MEDIUM-PROBABILITY RISKS:
1. Incomplete Documentation (Probability: 20%)
   - Mitigation: Comprehensive evidence gathering in Phase 1
   - Backup Plan: Subpoena powers and discovery procedures

2. Regulatory Changes (Probability: 15%)
   - Mitigation: Continuous legal monitoring and strategy adaptation
   - Backup Plan: Alternative legal theories and approaches

LOW-PROBABILITY RISKS:
1. Adverse Court Ruling (Probability: 10%)
   - Mitigation: Strong legal precedents and expert testimony
   - Backup Plan: Appeal procedures and alternative remedies

OVERALL RISK PROFILE: LOW TO MODERATE
The comprehensive approach and strong legal foundation significantly reduce risks while maximizing success probability.`,

      costBenefit: `COST-BENEFIT ANALYSIS

TOTAL INVESTMENT BREAKDOWN:
Phase 1: $500-750 (Foundation)
Phase 2: $750-1,200 (Enforcement)
Phase 3: $1,000-2,000 (Advanced Tactics)
Phase 4: $300-500 (Resolution)
Total: $2,550-4,450

EXPECTED BENEFITS:
Credit Score Improvement: 75-150 points
Estimated Financial Value: $15,000-45,000 over 5 years
- Lower interest rates on mortgages: $8,000-25,000 savings
- Better credit card terms: $2,000-5,000 savings
- Lower insurance premiums: $1,500-3,000 savings
- Employment opportunities: $3,500-12,000 value

Damage Recovery Potential: $5,000-25,000
- FCRA statutory damages: $100-1,000 per violation
- Actual damages: Variable based on harm
- Attorney fees: Recoverable under FCRA
- Punitive damages: Available for willful violations

RETURN ON INVESTMENT:
Conservative Estimate: 450% ROI
Optimistic Estimate: 800% ROI
Break-even Timeline: 6-12 months

The investment in professional legal strategy pays for itself many times over through improved credit terms and potential damage recovery.`,

      timeline: `DETAILED TIMELINE & MILESTONES

MONTH 1: Foundation Phase
Week 1: Case intake, evidence gathering, legal research
Week 2: Strategy finalization, initial demand letters
Week 3: Bureau responses, compliance monitoring
Week 4: Phase 1 completion, Phase 2 preparation

MONTH 2: Enforcement Phase
Week 5: Formal disputes filed, FCRA compliance tracking
Week 6: Follow-up actions, violation documentation
Week 7: Escalation procedures, advanced tactics deployment
Week 8: Phase 2 assessment, Phase 3 preparation

MONTH 3: Advanced Tactics Phase
Week 9: Litigation preparation, settlement negotiations
Week 10: Advanced legal filings, damage calculations
Week 11: Final enforcement actions, resolution negotiations
Week 12: Case closure, optimization strategies

KEY MILESTONES:
✓ Day 7: Complete case documentation
✓ Day 14: All initial disputes filed
✓ Day 30: First round results evaluation
✓ Day 45: Advanced tactics deployment
✓ Day 60: Settlement negotiations begin
✓ Day 75: Litigation decisions finalized
✓ Day 90: Case resolution achieved

CRITICAL SUCCESS FACTORS:
• Maintain aggressive timeline adherence
• Document all violations and non-compliance
• Leverage legal pressure at optimal timing
• Maximize settlement opportunities
• Ensure complete resolution of all issues`,

      nextSteps: `IMMEDIATE NEXT STEPS & ACTION ITEMS

WEEK 1 PRIORITIES:
1. Execute Retainer Agreement
   - Sign attorney-client agreement
   - Establish legal privilege protection
   - Set up secure communication channels

2. Evidence Compilation
   - Gather all credit reports from all three bureaus
   - Collect correspondence with creditors and bureaus
   - Document all previous dispute attempts
   - Compile supporting evidence and documentation

3. Legal Research & Analysis
   - Research applicable laws and regulations
   - Identify relevant court precedents
   - Analyze case strengths and weaknesses
   - Develop legal theories and arguments

4. Strategic Planning
   - Finalize tactical approach
   - Set success metrics and milestones
   - Establish communication protocols
   - Create project management framework

WEEK 2 DELIVERABLES:
• Complete case file organization
• Legal research memorandum
• Strategic action plan
• Initial demand letters prepared

CLIENT RESPONSIBILITIES:
• Provide all requested documentation promptly
• Maintain regular communication
• Follow strategic guidance precisely
• Avoid independent actions that could compromise strategy

ATTORNEY RESPONSIBILITIES:
• Provide expert legal guidance
• Execute strategy with precision
• Maintain regular progress updates
• Ensure compliance with all legal requirements

SUCCESS METRICS:
• 100% documentation completion by Day 7
• All initial actions completed by Day 14
• First measurable results by Day 30
• Major milestones achieved on schedule`,

      contingencyPlans: `CONTINGENCY PLANS & ALTERNATIVE STRATEGIES

SCENARIO 1: Credit Bureau Non-Compliance
Primary Response: Document violations, send formal notice
Escalation: File FCRA lawsuit in federal court
Timeline: 30 days for compliance, immediate litigation prep
Success Probability: 95% with documented violations

SCENARIO 2: Creditor Disputes Removal
Primary Response: Provide additional evidence, legal arguments
Escalation: Challenge furnisher accuracy under FCRA Section 623
Timeline: 15 days for response, 30 days for resolution
Success Probability: 85% with proper documentation

SCENARIO 3: Extended Timeline
Primary Response: Accelerate enforcement actions
Escalation: Emergency court motions, expedited procedures
Timeline: Immediate acceleration, 60-day target
Success Probability: 90% with aggressive tactics

SCENARIO 4: Insufficient Evidence
Primary Response: Discovery procedures, subpoena powers
Escalation: Court-ordered document production
Timeline: 45 days for discovery completion
Success Probability: 80% with legal compulsion

SCENARIO 5: Regulatory Changes
Primary Response: Adapt strategy to new requirements
Escalation: Alternative legal theories, grandfathering arguments
Timeline: Immediate adaptation, ongoing monitoring
Success Probability: 85% with flexible approach

SCENARIO 6: Settlement Opportunities
Primary Response: Evaluate offers against potential outcomes
Escalation: Counter-negotiations, mediation procedures
Timeline: 30 days for evaluation and response
Success Probability: 90% with skilled negotiation

BACKUP STRATEGIES:
• Alternative legal theories if primary approach fails
• Multiple jurisdiction options for optimal venue
• Class action possibilities for widespread violations
• Regulatory complaint procedures as additional pressure
• Media and public relations strategies for leverage

The comprehensive contingency planning ensures success regardless of obstacles encountered during implementation.`,
    }

    setGeneratedStrategy(strategy)
    setLoading(false)
    setCurrentStep(4)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Scale className="h-6 w-6 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Legal Strategy Development</h1>
                <p className="text-gray-600 mt-1">Comprehensive strategic planning for your legal case</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-purple-100 text-purple-800">Premium Strategy</Badge>
              <Badge className="bg-green-100 text-green-800">Step {currentStep} of 4</Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Strategy Service Overview */}
        <Card className="mb-8 border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              {strategyTypes.map((strategy) => (
                <div key={strategy.id} className="text-center">
                  <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{strategy.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{strategy.description}</p>
                  <Badge className="bg-green-100 text-green-800">${strategy.price}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Strategy Development Progress</span>
              <span className="text-sm text-gray-600">{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between mt-4 text-sm text-gray-600">
              <span className={currentStep >= 1 ? "text-purple-600 font-medium" : ""}>Strategy Type</span>
              <span className={currentStep >= 2 ? "text-purple-600 font-medium" : ""}>Case Analysis</span>
              <span className={currentStep >= 3 ? "text-purple-600 font-medium" : ""}>Strategic Planning</span>
              <span className={currentStep >= 4 ? "text-purple-600 font-medium" : ""}>Strategy Document</span>
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Strategy Type Selection */}
        {currentStep === 1 && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    <span>Select Strategy Type</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={strategyData.consultationType}
                    onValueChange={(value) => setStrategyData({ ...strategyData, consultationType: value })}
                  >
                    {strategyTypes.map((strategy) => (
                      <div key={strategy.id} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={strategy.id} id={strategy.id} />
                          <Label htmlFor={strategy.id} className="flex-1 cursor-pointer">
                            <div className="p-4 border rounded-lg hover:bg-gray-50">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold">{strategy.name}</h4>
                                <Badge className="bg-purple-100 text-purple-800">${strategy.price}</Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{strategy.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                                <span className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{strategy.duration}</span>
                                </span>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-700 mb-1">Strategy Includes:</p>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  {strategy.includes.map((item, index) => (
                                    <li key={index} className="flex items-center space-x-1">
                                      <CheckCircle className="h-3 w-3 text-green-500" />
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </Label>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>

                  <div className="flex justify-end mt-8">
                    <Button
                      onClick={() => setCurrentStep(2)}
                      disabled={!strategyData.consultationType}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Continue to Case Analysis
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-blue-800 flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5" />
                    <span>Why Legal Strategy Matters</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-700 space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-white rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">Strategic Advantage</h4>
                      <p className="text-xs text-blue-600">
                        Professional legal strategy increases success rates by 340% compared to ad-hoc approaches.
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">Cost Efficiency</h4>
                      <p className="text-xs text-blue-600">
                        Strategic planning reduces overall legal costs by 60% through efficient resource allocation.
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">Risk Mitigation</h4>
                      <p className="text-xs text-blue-600">
                        Comprehensive planning identifies and mitigates 85% of potential legal risks before they occur.
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">Optimal Outcomes</h4>
                      <p className="text-xs text-blue-600">
                        Strategic approach achieves 95% of maximum possible outcomes vs 45% for unplanned actions.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Strategy Success Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">94%</div>
                        <div className="text-xs text-green-700">Success Rate</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">60%</div>
                        <div className="text-xs text-blue-700">Cost Reduction</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">340%</div>
                        <div className="text-xs text-purple-700">Efficiency Gain</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">21</div>
                        <div className="text-xs text-orange-700">Days Faster</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 2: Case Analysis */}
        {currentStep === 2 && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <span>Case Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="caseType">Primary Case Type *</Label>
                    <Select
                      value={strategyData.caseType}
                      onValueChange={(value) => setStrategyData({ ...strategyData, caseType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your primary case type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit-dispute">Credit Report Disputes</SelectItem>
                        <SelectItem value="identity-theft">Identity Theft Recovery</SelectItem>
                        <SelectItem value="fcra-violation">FCRA Violations</SelectItem>
                        <SelectItem value="debt-validation">Debt Validation</SelectItem>
                        <SelectItem value="collection-harassment">Collection Harassment</SelectItem>
                        <SelectItem value="bankruptcy-issues">Bankruptcy Issues</SelectItem>
                        <SelectItem value="mortgage-preparation">Mortgage Preparation</SelectItem>
                        <SelectItem value="business-credit">Business Credit Issues</SelectItem>
                        <SelectItem value="litigation-prep">Litigation Preparation</SelectItem>
                        <SelectItem value="settlement-negotiation">Settlement Negotiation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentSituation">Current Situation *</Label>
                    <Textarea
                      id="currentSituation"
                      value={strategyData.currentSituation}
                      onChange={(e) => setStrategyData({ ...strategyData, currentSituation: e.target.value })}
                      placeholder="Describe your current situation in detail. Include timeline, parties involved, actions taken so far, and current status..."
                      rows={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Strategic Goals (Select all that apply) *</Label>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                      {goalOptions.map((goal) => (
                        <div key={goal} className="flex items-center space-x-2">
                          <Checkbox
                            id={goal}
                            checked={strategyData.goals.includes(goal)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setStrategyData({
                                  ...strategyData,
                                  goals: [...strategyData.goals, goal],
                                })
                              } else {
                                setStrategyData({
                                  ...strategyData,
                                  goals: strategyData.goals.filter((g) => g !== goal),
                                })
                              }
                            }}
                          />
                          <Label htmlFor={goal} className="text-sm cursor-pointer">
                            {goal}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeline">Desired Timeline *</Label>
                    <Select
                      value={strategyData.timeline}
                      onValueChange={(value) => setStrategyData({ ...strategyData, timeline: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select desired timeline" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate (1-2 weeks)</SelectItem>
                        <SelectItem value="urgent">Urgent (3-4 weeks)</SelectItem>
                        <SelectItem value="standard">Standard (1-3 months)</SelectItem>
                        <SelectItem value="extended">Extended (3-6 months)</SelectItem>
                        <SelectItem value="long-term">Long-term (6+ months)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget Range *</Label>
                    <Select
                      value={strategyData.budget}
                      onValueChange={(value) => setStrategyData({ ...strategyData, budget: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under-1000">Under $1,000</SelectItem>
                        <SelectItem value="1000-2500">$1,000 - $2,500</SelectItem>
                        <SelectItem value="2500-5000">$2,500 - $5,000</SelectItem>
                        <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
                        <SelectItem value="10000-25000">$10,000 - $25,000</SelectItem>
                        <SelectItem value="over-25000">Over $25,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="riskTolerance">Risk Tolerance *</Label>
                    <RadioGroup
                      value={strategyData.riskTolerance}
                      onValueChange={(value) => setStrategyData({ ...strategyData, riskTolerance: value })}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="conservative" id="conservative" />
                        <Label htmlFor="conservative">Conservative - Minimize risks, slower but safer approach</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="moderate" id="moderate" />
                        <Label htmlFor="moderate">Moderate - Balanced approach with calculated risks</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="aggressive" id="aggressive" />
                        <Label htmlFor="aggressive">Aggressive - Maximum results, higher risk tolerance</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Additional Context</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="previousActions">Previous Actions Taken</Label>
                    <Textarea
                      id="previousActions"
                      value={strategyData.previousActions}
                      onChange={(e) => setStrategyData({ ...strategyData, previousActions: e.target.value })}
                      placeholder="Describe any previous actions you've taken, disputes filed, attorneys consulted, etc..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="obstacles">Known Obstacles or Challenges</Label>
                    <Textarea
                      id="obstacles"
                      value={strategyData.obstacles}
                      onChange={(e) => setStrategyData({ ...strategyData, obstacles: e.target.value })}
                      placeholder="What obstacles or challenges do you anticipate? What has been difficult so far?"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resources">Available Resources</Label>
                    <Textarea
                      id="resources"
                      value={strategyData.resources}
                      onChange={(e) => setStrategyData({ ...strategyData, resources: e.target.value })}
                      placeholder="What resources do you have available? Documentation, evidence, time, etc..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferredApproach">Preferred Approach</Label>
                    <Select
                      value={strategyData.preferredApproach}
                      onValueChange={(value) => setStrategyData({ ...strategyData, preferredApproach: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select preferred approach" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="negotiation">Negotiation-focused</SelectItem>
                        <SelectItem value="litigation">Litigation-ready</SelectItem>
                        <SelectItem value="settlement">Settlement-oriented</SelectItem>
                        <SelectItem value="compliance">Compliance-based</SelectItem>
                        <SelectItem value="aggressive">Aggressive enforcement</SelectItem>
                        <SelectItem value="collaborative">Collaborative approach</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-yellow-800 flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>Strategy Development Process</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-yellow-700 space-y-2">
                  <p>• AI-powered analysis of your case details</p>
                  <p>• Legal research and precedent analysis</p>
                  <p>• Risk assessment and mitigation planning</p>
                  <p>• Multi-phase strategic roadmap development</p>
                  <p>• Cost-benefit analysis and ROI projections</p>
                  <p>• Contingency planning for various scenarios</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Navigation for Step 2 */}
        {currentStep === 2 && (
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={() => setCurrentStep(1)}>
              Back
            </Button>
            <Button
              onClick={() => setCurrentStep(3)}
              disabled={
                !strategyData.caseType ||
                !strategyData.currentSituation ||
                strategyData.goals.length === 0 ||
                !strategyData.timeline ||
                !strategyData.budget ||
                !strategyData.riskTolerance
              }
              className="bg-purple-600 hover:bg-purple-700"
            >
              Continue to Strategic Planning
            </Button>
          </div>
        )}

        {/* Step 3: Strategic Planning */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  <span>Strategic Planning & Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-6">
                  <div className="bg-purple-50 rounded-lg p-8">
                    <Target className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-purple-800 mb-2">
                      Generating Your Comprehensive Legal Strategy
                    </h3>
                    <p className="text-purple-600 mb-6">
                      Our AI-powered legal analysis system is creating a customized strategic plan based on your case
                      details, goals, and preferences.
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-2 text-sm text-purple-700">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Case analysis completed</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-sm text-purple-700">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Legal research and precedent analysis</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-sm text-purple-700">
                        <Clock className="h-4 w-4 text-yellow-500 animate-spin" />
                        <span>Multi-phase strategy development</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>Risk assessment and mitigation planning</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>Cost-benefit analysis and ROI projections</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>Contingency planning and alternative strategies</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Strategic Analysis</h4>
                      <p className="text-blue-600">
                        Comprehensive evaluation of your case strengths, weaknesses, and opportunities
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Action Planning</h4>
                      <p className="text-green-600">
                        Detailed roadmap with specific actions, timelines, and success metrics
                      </p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Risk Management</h4>
                      <p className="text-orange-600">Identification and mitigation of potential risks and obstacles</p>
                    </div>
                  </div>

                  <div className="flex justify-center space-x-4">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>
                      Back to Case Analysis
                    </Button>
                    <Button onClick={generateStrategy} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
                      {loading ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Generating Strategy...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Generate Legal Strategy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Generated Strategy */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <h2 className="text-2xl font-bold text-green-800">Legal Strategy Generated Successfully!</h2>
                </div>
                <p className="text-center text-green-700 mb-6">
                  Your comprehensive legal strategy has been developed based on AI analysis and expert legal knowledge.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Download className="h-4 w-4 mr-2" />
                    Download Full Strategy
                  </Button>
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Implementation Call
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="executive-summary" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="executive-summary">Executive Summary</TabsTrigger>
                <TabsTrigger value="phases">Phase Breakdown</TabsTrigger>
                <TabsTrigger value="risk-assessment">Risk Assessment</TabsTrigger>
                <TabsTrigger value="cost-benefit">Cost-Benefit</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="next-steps">Next Steps</TabsTrigger>
              </TabsList>

              <TabsContent value="executive-summary">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-purple-600" />
                      <span>Executive Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg">
                        {generatedStrategy.executiveSummary}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="phases">
                <div className="space-y-6">
                  {generatedStrategy.phaseBreakdown.map((phase, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center space-x-2">
                            <Badge className="bg-purple-100 text-purple-800">{phase.phase}</Badge>
                            <span className="text-lg">{phase.phase.split(": ")[1]}</span>
                          </span>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{phase.duration}</span>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-2">Objectives:</h4>
                            <ul className="text-sm space-y-1">
                              {phase.objectives.map((objective, idx) => (
                                <li key={idx} className="flex items-start space-x-2">
                                  <Target className="h-3 w-3 text-purple-600 mt-1 flex-shrink-0" />
                                  <span>{objective}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Deliverables:</h4>
                            <ul className="text-sm space-y-1">
                              {phase.deliverables.map((deliverable, idx) => (
                                <li key={idx} className="flex items-start space-x-2">
                                  <CheckCircle className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                                  <span>{deliverable}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Badge className="bg-green-100 text-green-800">{phase.cost}</Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Success Metrics: </span>
                            {phase.successMetrics.join(", ")}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="risk-assessment">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-purple-600" />
                      <span>Risk Assessment & Mitigation</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg">
                        {generatedStrategy.riskAssessment}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="cost-benefit">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-purple-600" />
                      <span>Cost-Benefit Analysis</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg">
                        {generatedStrategy.costBenefit}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      <span>Detailed Timeline & Milestones</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg">
                        {generatedStrategy.timeline}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="next-steps">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Map className="h-5 w-5 text-purple-600" />
                      <span>Immediate Next Steps</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg">
                        {generatedStrategy.nextSteps}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-800">Implementation Support</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-blue-700">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>Phone consultation included</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Video className="h-4 w-4" />
                    <span>Video strategy session available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>30-day email support included</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
