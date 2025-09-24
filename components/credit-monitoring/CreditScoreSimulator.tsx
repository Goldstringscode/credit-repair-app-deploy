'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertCircle,
  CheckCircle,
  Info,
  Zap
} from 'lucide-react'

interface SimulationScenario {
  id: string
  name: string
  description: string
  impact: number
  timeframe: string
  difficulty: 'easy' | 'medium' | 'hard'
  cost: number
}

interface SimulationResult {
  currentScore: number
  projectedScore: number
  improvement: number
  timeframe: string
  confidence: number
  factors: {
    name: string
    current: number
    projected: number
    impact: number
  }[]
}

export function CreditScoreSimulator() {
  const [currentScore, setCurrentScore] = useState(650)
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([])
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)

  const scenarios: SimulationScenario[] = [
    {
      id: 'pay_off_cards',
      name: 'Pay Off Credit Cards',
      description: 'Pay down credit card balances to 30% utilization',
      impact: 25,
      timeframe: '1-3 months',
      difficulty: 'medium',
      cost: 0
    },
    {
      id: 'remove_late_payments',
      name: 'Remove Late Payments',
      description: 'Dispute and remove late payment entries',
      impact: 35,
      timeframe: '2-4 months',
      difficulty: 'hard',
      cost: 0
    },
    {
      id: 'add_authorized_user',
      name: 'Become Authorized User',
      description: 'Add as authorized user on good credit account',
      impact: 20,
      timeframe: '1-2 months',
      difficulty: 'easy',
      cost: 0
    },
    {
      id: 'open_new_card',
      name: 'Open New Credit Card',
      description: 'Open a new credit card with good terms',
      impact: 15,
      timeframe: '2-6 months',
      difficulty: 'medium',
      cost: 0
    },
    {
      id: 'pay_off_collections',
      name: 'Pay Off Collections',
      description: 'Settle or pay off collection accounts',
      impact: 40,
      timeframe: '1-2 months',
      difficulty: 'medium',
      cost: 500
    },
    {
      id: 'increase_credit_limits',
      name: 'Request Credit Limit Increases',
      description: 'Request higher limits on existing cards',
      impact: 10,
      timeframe: '1-3 months',
      difficulty: 'easy',
      cost: 0
    },
    {
      id: 'remove_inquiries',
      name: 'Remove Hard Inquiries',
      description: 'Dispute unauthorized or incorrect inquiries',
      impact: 8,
      timeframe: '1-2 months',
      difficulty: 'medium',
      cost: 0
    },
    {
      id: 'diversify_credit_mix',
      name: 'Diversify Credit Mix',
      description: 'Add different types of credit (loan, mortgage)',
      impact: 12,
      timeframe: '3-12 months',
      difficulty: 'hard',
      cost: 0
    }
  ]

  const runSimulation = async () => {
    setIsSimulating(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const selectedScenarioData = scenarios.filter(s => selectedScenarios.includes(s.id))
    const totalImpact = selectedScenarioData.reduce((sum, s) => sum + s.impact, 0)
    const projectedScore = Math.min(850, currentScore + totalImpact)
    const improvement = projectedScore - currentScore
    
    // Calculate confidence based on number of scenarios and their difficulty
    const avgDifficulty = selectedScenarioData.length > 0 
      ? selectedScenarioData.reduce((sum, s) => {
          const difficultyScore = s.difficulty === 'easy' ? 0.9 : s.difficulty === 'medium' ? 0.7 : 0.5
          return sum + difficultyScore
        }, 0) / selectedScenarioData.length
      : 0
    
    const confidence = Math.round(avgDifficulty * 100)
    
    // Generate factor analysis
    const factors = [
      { name: 'Payment History', current: 0.8, projected: 0.9, impact: 15 },
      { name: 'Credit Utilization', current: 0.6, projected: 0.8, impact: 20 },
      { name: 'Length of History', current: 0.7, projected: 0.75, impact: 5 },
      { name: 'New Credit', current: 0.5, projected: 0.6, impact: 10 },
      { name: 'Credit Mix', current: 0.6, projected: 0.7, impact: 10 }
    ]
    
    const result: SimulationResult = {
      currentScore,
      projectedScore,
      improvement,
      timeframe: selectedScenarioData.length > 0 
        ? selectedScenarioData[selectedScenarioData.length - 1].timeframe 
        : 'N/A',
      confidence,
      factors
    }
    
    setSimulationResult(result)
    setIsSimulating(false)
  }

  const toggleScenario = (scenarioId: string) => {
    setSelectedScenarios(prev => 
      prev.includes(scenarioId) 
        ? prev.filter(id => id !== scenarioId)
        : [...prev, scenarioId]
    )
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 750) return 'text-green-600'
    if (score >= 700) return 'text-blue-600'
    if (score >= 650) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 750) return 'Excellent'
    if (score >= 700) return 'Good'
    if (score >= 650) return 'Fair'
    return 'Poor'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Credit Score Simulator
          </CardTitle>
          <CardDescription>
            See how different actions could impact your credit score
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Score Input */}
          <div className="space-y-2">
            <Label htmlFor="current-score">Current Credit Score</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[currentScore]}
                onValueChange={(value) => setCurrentScore(value[0])}
                max={850}
                min={300}
                step={10}
                className="flex-1"
              />
              <div className="text-center min-w-[100px]">
                <p className={`text-2xl font-bold ${getScoreColor(currentScore)}`}>
                  {currentScore}
                </p>
                <p className="text-sm text-gray-500">{getScoreLabel(currentScore)}</p>
              </div>
            </div>
          </div>

          {/* Scenario Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold">Select Improvement Scenarios</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {scenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedScenarios.includes(scenario.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleScenario(scenario.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{scenario.name}</h4>
                    <div className="flex items-center gap-2">
                      <Badge className={getDifficultyColor(scenario.difficulty)}>
                        {scenario.difficulty}
                      </Badge>
                      <span className="text-sm font-semibold text-green-600">
                        +{scenario.impact}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{scenario.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>⏱️ {scenario.timeframe}</span>
                    <span>💰 ${scenario.cost}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Simulation Button */}
          <div className="flex justify-center">
            <Button
              onClick={runSimulation}
              disabled={selectedScenarios.length === 0 || isSimulating}
              className="px-8"
            >
              {isSimulating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Simulating...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Run Simulation
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Simulation Results */}
      {simulationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Simulation Results
            </CardTitle>
            <CardDescription>
              Projected credit score improvement based on selected scenarios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Current Score</p>
                <p className={`text-3xl font-bold ${getScoreColor(simulationResult.currentScore)}`}>
                  {simulationResult.currentScore}
                </p>
                <p className="text-sm text-gray-500">{getScoreLabel(simulationResult.currentScore)}</p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Projected Score</p>
                <p className={`text-3xl font-bold ${getScoreColor(simulationResult.projectedScore)}`}>
                  {simulationResult.projectedScore}
                </p>
                <p className="text-sm text-gray-500">{getScoreLabel(simulationResult.projectedScore)}</p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Improvement</p>
                <p className={`text-3xl font-bold ${simulationResult.improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {simulationResult.improvement > 0 ? '+' : ''}{simulationResult.improvement}
                </p>
                <p className="text-sm text-gray-500">points</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to Excellent (750+)</span>
                <span>{Math.round(((simulationResult.projectedScore - 300) / (750 - 300)) * 100)}%</span>
              </div>
              <Progress 
                value={Math.min(100, ((simulationResult.projectedScore - 300) / (750 - 300)) * 100)} 
                className="h-3"
              />
            </div>

            {/* Confidence and Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="font-medium">Confidence Level</p>
                  <p className="text-sm text-gray-600">{simulationResult.confidence}% accurate</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <AlertCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium">Estimated Timeline</p>
                  <p className="text-sm text-gray-600">{simulationResult.timeframe}</p>
                </div>
              </div>
            </div>

            {/* Factor Analysis */}
            <div className="space-y-4">
              <h4 className="font-semibold">Credit Factor Analysis</h4>
              <div className="space-y-3">
                {simulationResult.factors.map((factor, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{factor.name}</span>
                      <span>+{factor.impact} points</span>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Current</span>
                          <span>{Math.round(factor.current * 100)}%</span>
                        </div>
                        <Progress value={factor.current * 100} className="h-2" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Projected</span>
                          <span>{Math.round(factor.projected * 100)}%</span>
                        </div>
                        <Progress value={factor.projected * 100} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Items */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Recommended Next Steps</h4>
              <div className="space-y-2">
                {selectedScenarios.map(scenarioId => {
                  const scenario = scenarios.find(s => s.id === scenarioId)
                  return scenario ? (
                    <div key={scenarioId} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{scenario.name}</span>
                    </div>
                  ) : null
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
