import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Email Test Suite — Credit Repair AI</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f6f8;padding:24px;color:#2c3e50}
.header{background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:28px 32px;border-radius:14px;margin-bottom:24px}
.header h1{font-size:24px;font-weight:700;margin-bottom:6px}
.header p{opacity:.85;font-size:14px}
.controls{display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap;align-items:center}
.btn{padding:10px 20px;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s}
.btn-primary{background:linear-gradient(135deg,#667eea,#764ba2);color:white}
.btn-primary:hover{opacity:.9;transform:translateY(-1px)}
.btn-secondary{background:white;color:#667eea;border:1.5px solid #667eea}
.btn-secondary:hover{background:#f0f4ff}
.btn-danger{background:#e74c3c;color:white}
.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px}
.stat{background:white;border-radius:10px;padding:16px 20px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.08)}
.stat-num{font-size:28px;font-weight:700;margin-bottom:4px}
.stat-label{font-size:12px;color:#5a6c7d;text-transform:uppercase;letter-spacing:.5px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:14px}
.card{background:white;border-radius:12px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,.08);transition:all .2s;border:2px solid transparent}
.card:hover{box-shadow:0 4px 12px rgba(0,0,0,.12)}
.card.success{border-color:#2ecc71}
.card.error{border-color:#e74c3c}
.card.running{border-color:#f39c12;animation:pulse 1s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.7}}
.card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.card-title{font-size:15px;font-weight:600;color:#2c3e50}
.status-badge{padding:4px 10px;border-radius:20px;font-size:12px;font-weight:600}
.status-idle{background:#f4f6f8;color:#5a6c7d}
.status-running{background:#fff3cd;color:#856404}
.status-success{background:#d4edda;color:#155724}
.status-error{background:#f8d7da;color:#721c24}
.card-desc{font-size:13px;color:#5a6c7d;margin-bottom:14px}
.card-result{font-size:12px;padding:8px 10px;border-radius:6px;background:#f8f9fa;font-family:monospace;word-break:break-all;margin-top:8px;max-height:80px;overflow-y:auto}
.card-result.success-result{background:#f0fff4;color:#155724}
.card-result.error-result{background:#fff5f5;color:#721c24}
.btn-test{width:100%;padding:8px;background:#667eea15;border:1.5px solid #667eea40;border-radius:7px;color:#667eea;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s}
.btn-test:hover{background:#667eea;color:white}
.btn-test:disabled{opacity:.5;cursor:not-allowed}
.progress-bar{height:6px;background:#e9ecef;border-radius:3px;overflow:hidden;margin:16px 0}
.progress-fill{height:100%;background:linear-gradient(90deg,#667eea,#764ba2);border-radius:3px;transition:width .3s}
.log{background:#1e1e1e;color:#d4d4d4;padding:16px;border-radius:10px;font-family:monospace;font-size:12px;max-height:200px;overflow-y:auto;margin-top:16px}
.log-entry{margin-bottom:4px;padding:2px 0;border-bottom:1px solid #333}
.log-success{color:#4ec9b0}
.log-error{color:#f44747}
</style>
</head>
<body>
<div class="header">
  <h1>📧 Email Test Suite</h1>
  <p>Test all email templates for Credit Repair AI — Powered by Resend</p>
</div>

<div class="controls">
  <button class="btn btn-primary" onclick="runAll()">🚀 Run All Tests</button>
  <button class="btn btn-secondary" onclick="clearResults()">🔄 Clear Results</button>
  <span id="to-label" style="font-size:13px;color:#5a6c7d;margin-left:8px">Loading config...</span>
</div>

<div class="summary" id="summary" style="display:none">
  <div class="stat"><div class="stat-num" id="stat-total" style="color:#2c3e50">0</div><div class="stat-label">Total</div></div>
  <div class="stat"><div class="stat-num" id="stat-passed" style="color:#27ae60">0</div><div class="stat-label">Passed ✅</div></div>
  <div class="stat"><div class="stat-num" id="stat-failed" style="color:#e74c3c">0</div><div class="stat-label">Failed ❌</div></div>
</div>

<div class="progress-bar" id="progress-bar" style="display:none"><div class="progress-fill" id="progress-fill" style="width:0%"></div></div>

<div class="grid" id="grid"></div>
<div class="log" id="log" style="display:none"></div>

<script>
const TESTS = [
  {id:'welcome',name:'Welcome Email',desc:'Sent when a new credit repair user registers',icon:'👋'},
  {id:'password_reset',name:'Password Reset',desc:'Sent when user requests a password reset',icon:'🔑'},
  {id:'mlm_welcome',name:'MLM Welcome',desc:'Sent when a new MLM partner registers',icon:'🏆'},
  {id:'team_join',name:'Team Join',desc:'Sent to member when they join a team',icon:'🤝'},
  {id:'new_team_member',name:'New Team Member',desc:'Alert sent to sponsor when downline joins',icon:'🎉'},
  {id:'team_creation',name:'Team Creation',desc:'Sent when a user creates a new MLM team',icon:'🚀'},
  {id:'commission_earned',name:'Commission Earned',desc:'Sent when a commission is calculated',icon:'💰'},
  {id:'rank_advancement',name:'Rank Advancement',desc:'Sent when user advances to higher rank',icon:'⭐'},
  {id:'payout_processed',name:'Payout Processed',desc:'Sent when payout request is approved',icon:'✅'},
  {id:'invitation',name:'Team Invitation',desc:'Sent when a member invites someone',icon:'✉️'},
  {id:'dispute_letter',name:'Dispute Letter Ready',desc:'Sent when AI generates a dispute letter',icon:'📝'},
  {id:'score_improvement',name:'Score Improvement',desc:'Sent when credit score improves',icon:'📈'},
  {id:'payment_success',name:'Payment Confirmed',desc:'Sent after successful Stripe payment',icon:'💳'},
  {id:'training_complete',name:'Training Complete',desc:'Sent when user completes a course',icon:'🎓'},
  {id:'task_complete',name:'Task Complete',desc:'Sent when onboarding task is done',icon:'☑️'},
]

const state = {}
TESTS.forEach(t => state[t.id] = {status:'idle',result:null})

function log(msg, type='info') {
  const el = document.getElementById('log')
  el.style.display = 'block'
  const div = document.createElement('div')
  div.className = 'log-entry ' + (type==='success'?'log-success':type==='error'?'log-error':'')
  div.textContent = new Date().toLocaleTimeString() + ' — ' + msg
  el.insertBefore(div, el.firstChild)
}

function renderGrid() {
  const grid = document.getElementById('grid')
  grid.innerHTML = TESTS.map(t => {
    const s = state[t.id]
    const badgeClass = s.status==='idle'?'status-idle':s.status==='running'?'status-running':s.status==='success'?'status-success':'status-error'
    const badgeText = s.status==='idle'?'Idle':s.status==='running'?'⏳ Sending...':s.status==='success'?'✅ Sent':'❌ Failed'
    const resultHtml = s.result ? `<div class="card-result ${s.status==='success'?'success-result':'error-result'}">${
      s.status==='success' ? '✅ ID: '+s.result.id : '❌ '+s.result.error
    }</div>` : ''
    return `<div class="card ${s.status==='idle'?'':s.status}" id="card-${t.id}">
      <div class="card-header">
        <div class="card-title">${t.icon} ${t.name}</div>
        <span class="status-badge ${badgeClass}">${badgeText}</span>
      </div>
      <div class="card-desc">${t.desc}</div>
      ${resultHtml}
      <button class="btn-test" onclick="runTest('${t.id}')" ${s.status==='running'?'disabled':''}>
        ${s.status==='success'?'Re-send':'Send Test Email'}
      </button>
    </div>`
  }).join('')
}

async function runTest(id) {
  state[id] = {status:'running',result:null}
  renderGrid()
  log('Sending: ' + id + '...')
  try {
    const r = await fetch('/api/email-test?type=' + id)
    const data = await r.json()
    state[id] = {status:data.success?'success':'error', result:data}
    log((data.success?'✅':'❌') + ' ' + id + ': ' + (data.success?'id='+data.id:data.error), data.success?'success':'error')
  } catch(e) {
    state[id] = {status:'error', result:{error:e.message}}
    log('❌ ' + id + ': ' + e.message, 'error')
  }
  updateSummary()
  renderGrid()
}

async function runAll() {
  document.getElementById('progress-bar').style.display='block'
  document.getElementById('summary').style.display='grid'
  log('🚀 Starting all email tests...')
  for(let i=0; i<TESTS.length; i++) {
    const t = TESTS[i]
    await runTest(t.id)
    document.getElementById('progress-fill').style.width = ((i+1)/TESTS.length*100) + '%'
    await new Promise(r=>setTimeout(r,400))
  }
  log('🏁 All tests complete!')
}

function updateSummary() {
  const total = TESTS.length
  const passed = TESTS.filter(t=>state[t.id].status==='success').length
  const failed = TESTS.filter(t=>state[t.id].status==='error').length
  document.getElementById('stat-total').textContent = total
  document.getElementById('stat-passed').textContent = passed
  document.getElementById('stat-failed').textContent = failed
  document.getElementById('summary').style.display='grid'
}

function clearResults() {
  TESTS.forEach(t => state[t.id]={status:'idle',result:null})
  document.getElementById('summary').style.display='none'
  document.getElementById('progress-bar').style.display='none'
  document.getElementById('log').style.display='none'
  document.getElementById('progress-fill').style.width='0%'
  renderGrid()
}

// Init
fetch('/api/email-test').then(r=>r.json()).then(d=>{
  document.getElementById('to-label').textContent = '📬 Sending to: ' + d.to
}).catch(()=>{})
renderGrid()
</script>
</body></html>`
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } })
}
