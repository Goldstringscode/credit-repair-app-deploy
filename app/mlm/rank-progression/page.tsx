'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const RANKS = [
  { name:'associate',    label:'Associate',    level:1, commissionRate:0.30, minPV:0,    minTV:0,      color:'bg-gray-500' },
  { name:'consultant',   label:'Consultant',   level:2, commissionRate:0.35, minPV:500,  minTV:1000,   color:'bg-blue-500' },
  { name:'manager',      label:'Manager',      level:3, commissionRate:0.40, minPV:1000, minTV:5000,   color:'bg-green-500' },
  { name:'director',     label:'Director',     level:4, commissionRate:0.45, minPV:2000, minTV:15000,  color:'bg-purple-500' },
  { name:'executive',    label:'Executive',    level:5, commissionRate:0.50, minPV:3000, minTV:50000,  color:'bg-orange-500' },
  { name:'presidential', label:'Presidential', level:6, commissionRate:0.55, minPV:5000, minTV:150000, color:'bg-yellow-500' },
]

export default function RankProgressionPage() {
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me').then(r=>r.ok?r.json():null).then(data => {
      if(!data?.user) { router.push('/login'); return }
      fetch('/api/mlm/team-stats').then(r=>r.json()).then(d => {
        if(d.stats) setStats(d.stats)
        setLoading(false)
      }).catch(() => setLoading(false))
    }).catch(() => router.push('/login'))
  }, [])

  const currentRank = RANKS.find(r => r.name === stats?.rank) || RANKS[0]

  if(loading) return <div className="flex items-center justify-center h-64"><div className="text-gray-500">Loading...</div></div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Rank Progression</h1>
        <p className="text-gray-500 mt-1">Your path to Presidential rank</p>
      </div>

      <div className="space-y-4">
        {RANKS.map((rank, i) => {
          const isCurrent = rank.name === currentRank.name
          const isAchieved = rank.level <= currentRank.level
          const pvProgress = rank.minPV > 0 ? Math.min(((stats?.personalVolume||0)/rank.minPV)*100,100) : 100
          const tvProgress = rank.minTV > 0 ? Math.min(((stats?.teamVolume||0)/rank.minTV)*100,100) : 100

          return (
            <div key={rank.name} className={`bg-white rounded-xl border-2 p-6 ${isCurrent?'border-blue-500 shadow-md':isAchieved?'border-green-200':'border-gray-100'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${rank.color} flex items-center justify-center text-white font-bold`}>{rank.level}</div>
                  <div>
                    <div className="font-bold text-gray-900 flex items-center gap-2">
                      {rank.label}
                      {isCurrent && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Current</span>}
                      {isAchieved && !isCurrent && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Achieved</span>}
                    </div>
                    <div className="text-sm text-gray-500">{(rank.commissionRate*100).toFixed(0)}% commission rate</div>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  {rank.minPV > 0 && <div>PV: ${rank.minPV.toLocaleString()}</div>}
                  {rank.minTV > 0 && <div>TV: ${rank.minTV.toLocaleString()}</div>}
                </div>
              </div>
              {!isAchieved && (
                <div className="space-y-2">
                  {rank.minPV > 0 && (
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Personal Volume</span><span>${stats?.personalVolume||0} / ${rank.minPV.toLocaleString()}</span></div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full transition-all" style={{width:pvProgress+'%'}}/></div>
                    </div>
                  )}
                  {rank.minTV > 0 && (
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Team Volume</span><span>${stats?.teamVolume||0} / ${rank.minTV.toLocaleString()}</span></div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-purple-500 rounded-full transition-all" style={{width:tvProgress+'%'}}/></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}