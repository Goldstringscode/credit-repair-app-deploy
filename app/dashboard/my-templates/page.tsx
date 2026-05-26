'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { FileText, Trash2, Send, Clock, ChevronDown, ChevronUp, Search, Loader2 } from 'lucide-react'

interface Template {
  id: string
  name: string
  content: string
  letter_type: string
  bureaus: string[]
  tier: string
  recipient_name: string
  recipient_address: string
  created_at: string
}

const BUREAU_LABELS: Record<string, string> = {
  experian: 'Experian',
  equifax: 'Equifax',
  transunion: 'TransUnion',
}

const TIER_LABELS: Record<string, string> = {
  standard: 'Standard Mail',
  certified: 'Certified Mail',
  priority: 'Priority Mail',
}

const TYPE_LABELS: Record<string, string> = {
  dispute: 'Credit Dispute',
  goodwill: 'Goodwill Letter',
  debt_validation: 'Debt Validation',
  cease_desist: 'Cease & Desist',
  pay_for_delete: 'Pay for Delete',
}

export default function MyTemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/letter-templates')
      const data = await res.json()
      if (data.success) {
        setTemplates(data.templates || [])
      } else if (res.status === 401) {
        router.push('/login')
      }
    } catch (e) {
      toast.error('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete template "${name}"? This cannot be undone.`)) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/letter-templates?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setTemplates(prev => prev.filter(t => t.id !== id))
        toast.success('Template deleted')
      } else {
        toast.error(data.error || 'Failed to delete')
      }
    } catch {
      toast.error('Failed to delete template')
    } finally {
      setDeletingId(null)
    }
  }

  const handleSend = (template: Template) => {
    // Navigate to generate page with template pre-filled
    const params = new URLSearchParams({
      templateId: template.id,
      letterType: template.letter_type,
      bureaus: template.bureaus.join(','),
    })
    router.push(`/dashboard/letters/generate?${params.toString()}`)
  }

  const filtered = templates.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.letter_type.toLowerCase().includes(search.toLowerCase()) ||
    t.bureaus.some(b => BUREAU_LABELS[b]?.toLowerCase().includes(search.toLowerCase()))
  )

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="rounded-2xl p-8 mb-6 text-white" style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
        <div className="flex items-center gap-3 mb-1">
          <FileText className="h-7 w-7" />
          <h1 className="text-2xl font-bold">My Templates</h1>
        </div>
        <p className="text-white/80 text-sm">Saved dispute letters you can send again at any time</p>
      </div>

      {/* Search + count */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 outline-none bg-white"
          />
        </div>
        <span className="text-sm text-gray-500">{filtered.length} template{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading templates...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-600 mb-1">
            {templates.length === 0 ? 'No templates saved yet' : 'No templates match your search'}
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            {templates.length === 0
              ? 'Generate a dispute letter and click "Save as Template" after sending to save it here.'
              : 'Try a different search term.'}
          </p>
          {templates.length === 0 && (
            <button
              onClick={() => router.push('/dashboard/letters/generate')}
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}
            >
              Generate a Letter
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(template => (
            <div key={template.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Template header */}
              <div className="p-5 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="font-semibold text-gray-800 text-base">{template.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
                      {TYPE_LABELS[template.letter_type] || template.letter_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap text-xs text-gray-500">
                    {/* Bureaus */}
                    <div className="flex gap-1">
                      {(template.bureaus || []).map(b => (
                        <span key={b} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                          {BUREAU_LABELS[b] || b}
                        </span>
                      ))}
                    </div>
                    {/* Tier */}
                    <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 font-medium">
                      {TIER_LABELS[template.tier] || template.tier}
                    </span>
                    {/* Date */}
                    <span className="flex items-center gap-1 text-gray-400">
                      <Clock className="h-3 w-3" />
                      {formatDate(template.created_at)}
                    </span>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setExpandedId(expandedId === template.id ? null : template.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
                    title="Preview letter"
                  >
                    {expandedId === template.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(template.id, template.name)}
                    disabled={deletingId === template.id}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                    title="Delete template"
                  >
                    {deletingId === template.id
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Trash2 className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleSend(template)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}
                  >
                    <Send className="h-3.5 w-3.5" />
                    Send Letter
                  </button>
                </div>
              </div>

              {/* Expanded letter preview */}
              {expandedId === template.id && (
                <div className="border-t border-gray-100 bg-gray-50 p-5">
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">Letter Preview</p>
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono bg-white border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto leading-relaxed">
                    {template.content}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Supabase migration hint */}
      {templates.length === 0 && !loading && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <strong>⚠️ First time?</strong> Make sure the <code className="bg-amber-100 px-1 rounded">letter_templates</code> table exists in Supabase. Run this SQL if needed:
          <pre className="mt-2 text-xs bg-white border border-amber-200 rounded p-3 overflow-x-auto">{
`CREATE TABLE IF NOT EXISTS letter_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  letter_type TEXT DEFAULT 'dispute',
  bureaus TEXT[] DEFAULT '{}',
  tier TEXT DEFAULT 'certified',
  recipient_name TEXT DEFAULT '',
  recipient_address TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);`
          }</pre>
        </div>
      )}
    </div>
  )
}
