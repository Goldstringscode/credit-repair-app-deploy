'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import {
  FileText, Plus, Trash2, Edit, Save, AlertTriangle,
  CreditCard, TrendingUp, Calendar, Building, BookOpen, Wand2
} from 'lucide-react'

interface CreditScore {
  id: string
  bureau: 'Experian' | 'Equifax' | 'TransUnion'
  score: number
  date: string
  notes?: string
}

interface NegativeItem {
  id: string
  creditor: string
  accountNumber?: string
  originalAmount?: number | null
  currentBalance?: number | null
  dateOpened?: string
  dateReported?: string
  status?: string
  itemType?: string
  disputeReason?: string
  notes?: string
}

// Map snake_case DB rows to camelCase view model
function mapItem(raw: any): NegativeItem {
  return {
    id: raw.id,
    creditor: raw.creditor ?? '',
    accountNumber: raw.account_number ?? raw.accountNumber ?? '',
    originalAmount: raw.original_amount ?? raw.originalAmount ?? null,
    currentBalance: raw.current_balance ?? raw.currentBalance ?? null,
    dateOpened: raw.date_opened ?? raw.dateOpened ?? '',
    dateReported: raw.date_reported ?? raw.dateReported ?? '',
    status: raw.status ?? '',
    itemType: raw.item_type ?? raw.itemType ?? '',
    disputeReason: raw.dispute_reason ?? raw.disputeReason ?? '',
    notes: raw.notes ?? '',
  }
}

function mapScore(raw: any): CreditScore {
  return {
    id: raw.id,
    bureau: raw.bureau,
    score: raw.score,
    date: raw.date ?? raw.created_at?.split('T')[0] ?? '',
    notes: raw.notes ?? '',
  }
}

const fmt = (val: number | null | undefined) =>
  val != null ? `$${Number(val).toLocaleString()}` : 'N/A'

export default function CreditReportUpload() {
  const { user } = useCurrentUser()
  const [creditScores, setCreditScores] = useState<CreditScore[]>([])
  const [negativeItems, setNegativeItems] = useState<NegativeItem[]>([])
  const [activeTab, setActiveTab] = useState('scores')
  const [editingScore, setEditingScore] = useState<CreditScore | null>(null)
  const [editingItem, setEditingItem] = useState<NegativeItem | null>(null)
  const [isAddingScore, setIsAddingScore] = useState(false)
  const [isAddingItem, setIsAddingItem] = useState(false)

  const loadCreditScores = useCallback(async () => {
    try {
      const res = await fetch('/api/credit-reports/credit-scores', { credentials: 'include' })
      const data = await res.json()
      if (data.success) {
        const rows = data.data?.creditScores ?? data.data ?? []
        setCreditScores(Array.isArray(rows) ? rows.map(mapScore) : [])
      }
    } catch (err) { console.error('Error loading credit scores:', err) }
  }, [])

  const loadNegativeItems = useCallback(async () => {
    try {
      const res = await fetch('/api/credit-reports/negative-items', { credentials: 'include' })
      const data = await res.json()
      if (data.success) {
        const rows = data.data?.negativeItems ?? data.data ?? []
        setNegativeItems(Array.isArray(rows) ? rows.map(mapItem) : [])
      }
    } catch (err) { console.error('Error loading negative items:', err) }
  }, [])

  useEffect(() => {
    loadCreditScores()
    loadNegativeItems()
  }, [loadCreditScores, loadNegativeItems])

  const handleAddScore = async (score: Omit<CreditScore, 'id'>) => {
    try {
      const res = await fetch('/api/credit-reports/credit-scores', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify(score),
      })
      const data = await res.json()
      if (data.success) {
        setCreditScores(prev => [...prev, mapScore(data.data?.creditScore ?? data.data)])
        setIsAddingScore(false)
      } else { alert(`Error adding credit score: ${data.error}`) }
    } catch (err) { alert('Failed to add credit score. Please try again.') }
  }

  const handleDeleteScore = async (id: string) => {
    try {
      const res = await fetch(`/api/credit-reports/credit-scores?id=${id}`, { method: 'DELETE', credentials: 'include' })
      const data = await res.json()
      if (data.success) { setCreditScores(prev => prev.filter(s => s.id !== id)) }
      else { alert(`Error deleting credit score: ${data.error}`) }
    } catch (err) { alert('Failed to delete credit score. Please try again.') }
  }

  // Send camelCase — the API and databaseService both expect camelCase
  const handleAddItem = async (item: Omit<NegativeItem, 'id'>) => {
    try {
      const res = await fetch('/api/credit-reports/negative-items', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify(item),
      })
      const data = await res.json()
      if (data.success) {
        setNegativeItems(prev => [...prev, mapItem(data.data?.negativeItem ?? data.data)])
        setIsAddingItem(false)
      } else { alert(`Error adding negative item: ${data.error}`) }
    } catch (err) { alert('Failed to add negative item. Please try again.') }
  }

  const handleDeleteItem = async (id: string) => {
    try {
      const res = await fetch(`/api/credit-reports/negative-items?id=${id}`, { method: 'DELETE', credentials: 'include' })
      const data = await res.json()
      if (data.success) { setNegativeItems(prev => prev.filter(i => i.id !== id)) }
      else { alert(`Error deleting negative item: ${data.error}`) }
    } catch (err) { alert('Failed to delete negative item. Please try again.') }
  }

  const getScoreColor = (score: number) => {
    if (score >= 800) return 'text-green-600'
    if (score >= 740) return 'text-blue-600'
    if (score >= 670) return 'text-yellow-600'
    if (score >= 580) return 'text-orange-600'
    return 'text-red-600'
  }
  const getScoreLabel = (score: number) => {
    if (score >= 800) return 'Excellent'
    if (score >= 740) return 'Very Good'
    if (score >= 670) return 'Good'
    if (score >= 580) return 'Fair'
    return 'Poor'
  }
  const getItemTypeColor = (type: string) => {
    const c: Record<string,string> = {
      late_payment:'bg-yellow-100 text-yellow-800','Late Payment':'bg-yellow-100 text-yellow-800',
      collection:'bg-red-100 text-red-800',Collection:'bg-red-100 text-red-800',
      charge_off:'bg-red-100 text-red-800','Charge Off':'bg-red-100 text-red-800',
      bankruptcy:'bg-red-100 text-red-800',Bankruptcy:'bg-red-100 text-red-800',
      Lien:'bg-orange-100 text-orange-800',Judgment:'bg-red-100 text-red-800',
    }
    return c[type] || 'bg-gray-100 text-gray-800'
  }

  const averageScore = creditScores.length > 0
    ? Math.round(creditScores.reduce((s, c) => s + c.score, 0) / creditScores.length)
    : 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add Negative Items</h1>
              <p className="text-gray-600 mt-2">
                Enter creditor name to save — you can fill in the rest of the details later.
                Items will be pre-filled when you generate dispute letters.
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => window.location.href = '/dashboard/credit-reports/guide'}>
                <BookOpen className="h-4 w-4 mr-2" />View Guide
              </Button>
              <Button onClick={() => window.location.href = '/dashboard/letters/generate?source=credit_reports'}
                disabled={negativeItems.length === 0} className="bg-purple-600 hover:bg-purple-700">
                <Wand2 className="h-4 w-4 mr-2" />Generate Letters
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card><CardContent className="p-6"><div className="flex items-center">
            <CreditCard className="h-8 w-8 text-blue-500" />
            <div className="ml-4"><p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className={`text-2xl font-bold ${averageScore ? getScoreColor(averageScore) : 'text-gray-400'}`}>{averageScore || 'N/A'}</p>
            </div>
          </div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center">
            <FileText className="h-8 w-8 text-green-500" />
            <div className="ml-4"><p className="text-sm font-medium text-gray-600">Credit Scores</p>
              <p className="text-2xl font-bold text-gray-900">{creditScores.length}</p></div>
          </div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div className="ml-4"><p className="text-sm font-medium text-gray-600">Negative Items</p>
              <p className="text-2xl font-bold text-gray-900">{negativeItems.length}</p></div>
          </div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-500" />
            <div className="ml-4"><p className="text-sm font-medium text-gray-600">Ready for Letters</p>
              <p className="text-2xl font-bold text-gray-900">{negativeItems.length > 0 ? 'Yes' : 'No'}</p></div>
          </div></CardContent></Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scores">Credit Scores</TabsTrigger>
            <TabsTrigger value="items">Negative Items</TabsTrigger>
          </TabsList>

          <TabsContent value="scores" className="space-y-6">
            <Card>
              <CardHeader><div className="flex items-center justify-between">
                <CardTitle>Credit Scores</CardTitle>
                <Button onClick={() => setIsAddingScore(true)}><Plus className="h-4 w-4 mr-2" />Add Score</Button>
              </div></CardHeader>
              <CardContent>
                {creditScores.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Credit Scores Added</h3>
                    <p className="text-gray-600 mb-4">Add your credit scores from each bureau to track your progress</p>
                    <Button onClick={() => setIsAddingScore(true)}><Plus className="h-4 w-4 mr-2" />Add Your First Score</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {creditScores.map((score) => (
                      <div key={score.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2"><Building className="h-5 w-5 text-gray-400" /><span className="font-medium">{score.bureau}</span></div>
                            <div className="flex items-center space-x-2">
                              <span className={`text-2xl font-bold ${getScoreColor(score.score)}`}>{score.score}</span>
                              <Badge variant="outline" className={getScoreColor(score.score)}>{getScoreLabel(score.score)}</Badge>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500"><Calendar className="h-4 w-4" /><span>{score.date}</span></div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={() => setEditingScore(score)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteScore(score.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                        {score.notes && <p className="text-sm text-gray-600 mt-2">{score.notes}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="items" className="space-y-6">
            <Card>
              <CardHeader><div className="flex items-center justify-between">
                <CardTitle>Negative Items</CardTitle>
                <Button onClick={() => setIsAddingItem(true)}><Plus className="h-4 w-4 mr-2" />Add Item</Button>
              </div></CardHeader>
              <CardContent>
                {negativeItems.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Negative Items Added</h3>
                    <p className="text-gray-600 mb-4">
                      Add negative items from your credit report. Only the creditor name is required — 
                      you can fill in the rest of the details later by clicking Edit.
                    </p>
                    <Button onClick={() => setIsAddingItem(true)}><Plus className="h-4 w-4 mr-2" />Add Your First Item</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {negativeItems.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-medium text-gray-900">{item.creditor}</h4>
                              {item.itemType && <Badge className={getItemTypeColor(item.itemType)}>{item.itemType.replace(/_/g,' ')}</Badge>}
                              {item.status && <Badge variant="outline">{item.status}</Badge>}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div><span className="font-medium">Original:</span> {fmt(item.originalAmount)}</div>
                              <div><span className="font-medium">Balance:</span> {fmt(item.currentBalance)}</div>
                              <div><span className="font-medium">Reported:</span> {item.dateReported || 'Not set'}</div>
                              <div><span className="font-medium">Account:</span> {item.accountNumber || 'Not set'}</div>
                            </div>
                            {item.disputeReason && <div className="mt-2"><span className="font-medium text-sm">Dispute Reason:</span><p className="text-sm text-gray-600">{item.disputeReason}</p></div>}
                            {(!item.accountNumber || !item.disputeReason || !item.originalAmount) && (
                              <p className="text-xs text-amber-600 mt-2">Some fields not filled in yet — click Edit to complete.</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <Button variant="outline" size="sm" onClick={() => setEditingItem(item)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteItem(item.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {isAddingScore && <ScoreFormModal onSave={handleAddScore} onCancel={() => setIsAddingScore(false)} />}
        {editingScore && (
          <ScoreFormModal score={editingScore}
            onSave={(u) => { setCreditScores(p => p.map(s => s.id === editingScore.id ? {...s,...u} : s)); setEditingScore(null) }}
            onCancel={() => setEditingScore(null)} />
        )}
        {isAddingItem && <ItemFormModal onSave={handleAddItem} onCancel={() => setIsAddingItem(false)} />}
        {editingItem && (
          <ItemFormModal item={editingItem}
            onSave={(u) => { setNegativeItems(p => p.map(i => i.id === editingItem.id ? {...i,...u} : i)); setEditingItem(null) }}
            onCancel={() => setEditingItem(null)} />
        )}
      </div>
    </div>
  )
}

function ScoreFormModal({ score, onSave, onCancel }: { score?: CreditScore; onSave: (s: Omit<CreditScore,'id'>) => void; onCancel: () => void }) {
  const [f, setF] = useState({ bureau: score?.bureau || 'Experian' as any, score: score?.score || 0, date: score?.date || new Date().toISOString().split('T')[0], notes: score?.notes || '' })
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">{score ? 'Edit Credit Score' : 'Add Credit Score'}</h3>
        <form onSubmit={(e) => { e.preventDefault(); onSave(f) }} className="space-y-4">
          <div><Label>Credit Bureau</Label>
            <Select value={f.bureau} onValueChange={(v) => setF(p => ({...p,bureau:v as any}))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Experian">Experian</SelectItem>
                <SelectItem value="Equifax">Equifax</SelectItem>
                <SelectItem value="TransUnion">TransUnion</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Credit Score</Label>
            <Input type="number" min="300" max="850" value={f.score} onChange={(e) => setF(p => ({...p,score:parseInt(e.target.value)||0}))} required /></div>
          <div><Label>Date</Label>
            <Input type="date" value={f.date} onChange={(e) => setF(p => ({...p,date:e.target.value}))} required /></div>
          <div><Label>Notes (Optional)</Label>
            <Textarea value={f.notes} onChange={(e) => setF(p => ({...p,notes:e.target.value}))} rows={3} /></div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit"><Save className="h-4 w-4 mr-2" />Save</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

const DISPUTE_REASONS = ["Inaccurate Information","Identity Theft","Outdated Information","Duplicate Entry","Paid in Full","Never Late","Account Not Mine","Incorrect Balance","Wrong Creditor","Settled Account","Bankruptcy Discharge","Fraudulent Account","Incorrect Status","Missing Payment Credit","Wrong Account Type","Incorrect Date","Account Closed","Incorrect Credit Limit","Wrong Payment Status"]

function ItemFormModal({ item, onSave, onCancel }: { item?: NegativeItem; onSave: (i: Omit<NegativeItem,'id'>) => void; onCancel: () => void }) {
  const [f, setF] = useState({
    creditor: item?.creditor||'', accountNumber: item?.accountNumber||'',
    originalAmount: item?.originalAmount ?? null as number|null,
    currentBalance: item?.currentBalance ?? null as number|null,
    dateOpened: item?.dateOpened||'', dateReported: item?.dateReported||'',
    status: item?.status||'Open', itemType: item?.itemType||'',
    disputeReason: item?.disputeReason||'', notes: item?.notes||''
  })
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">{item ? 'Edit Negative Item' : 'Add Negative Item'}</h3>
        <p className="text-sm text-gray-500 mb-4">Only the creditor name is required. Fill in the rest now or come back and edit later.</p>
        <form onSubmit={(e) => { e.preventDefault(); onSave(f) }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Creditor Name <span className="text-red-500">*</span></Label>
              <Input value={f.creditor} onChange={(e) => setF(p=>({...p,creditor:e.target.value}))} required placeholder="e.g. Capital One, LVNV Funding" /></div>
            <div><Label>Account Number <span className="text-gray-400 text-xs">(optional)</span></Label>
              <Input value={f.accountNumber} onChange={(e) => setF(p=>({...p,accountNumber:e.target.value}))} placeholder="Last 4 digits or full number" /></div>
            <div><Label>Original Amount <span className="text-gray-400 text-xs">(optional)</span></Label>
              <Input type="number" min="0" step="0.01" value={f.originalAmount ?? ''} onChange={(e) => setF(p=>({...p,originalAmount:e.target.value ? parseFloat(e.target.value) : null}))} placeholder="0.00" /></div>
            <div><Label>Current Balance <span className="text-gray-400 text-xs">(optional)</span></Label>
              <Input type="number" min="0" step="0.01" value={f.currentBalance ?? ''} onChange={(e) => setF(p=>({...p,currentBalance:e.target.value ? parseFloat(e.target.value) : null}))} placeholder="0.00" /></div>
            <div><Label>Date Opened <span className="text-gray-400 text-xs">(optional)</span></Label>
              <Input type="date" value={f.dateOpened} onChange={(e) => setF(p=>({...p,dateOpened:e.target.value}))} /></div>
            <div><Label>Date Reported <span className="text-gray-400 text-xs">(optional)</span></Label>
              <Input type="date" value={f.dateReported} onChange={(e) => setF(p=>({...p,dateReported:e.target.value}))} /></div>
            <div><Label>Status <span className="text-gray-400 text-xs">(optional)</span></Label>
              <Select value={f.status} onValueChange={(v) => setF(p=>({...p,status:v}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="Charged Off">Charged Off</SelectItem>
                  <SelectItem value="In Collections">In Collections</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Item Type <span className="text-gray-400 text-xs">(optional)</span></Label>
              <Select value={f.itemType} onValueChange={(v) => setF(p=>({...p,itemType:v}))}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Late Payment">Late Payment</SelectItem>
                  <SelectItem value="Collection">Collection</SelectItem>
                  <SelectItem value="Charge Off">Charge Off</SelectItem>
                  <SelectItem value="Bankruptcy">Bankruptcy</SelectItem>
                  <SelectItem value="Lien">Lien</SelectItem>
                  <SelectItem value="Judgment">Judgment</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Dispute Reason <span className="text-gray-400 text-xs">(optional — can add at letter generation)</span></Label>
            <div className="space-y-2">
              <Select value={DISPUTE_REASONS.includes(f.disputeReason) ? f.disputeReason : ''} onValueChange={(v) => setF(p=>({...p,disputeReason:v}))}>
                <SelectTrigger><SelectValue placeholder="Select a common reason or write your own below" /></SelectTrigger>
                <SelectContent>{DISPUTE_REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
              <Textarea value={f.disputeReason} onChange={(e) => setF(p=>({...p,disputeReason:e.target.value}))} rows={3} placeholder="Optional — you can add or edit this when generating your letter" />
            </div>
          </div>
          <div><Label>Notes <span className="text-gray-400 text-xs">(optional)</span></Label>
            <Textarea value={f.notes||''} onChange={(e) => setF(p=>({...p,notes:e.target.value}))} rows={2} placeholder="Any additional notes..." /></div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit"><Save className="h-4 w-4 mr-2" />Save Item</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
