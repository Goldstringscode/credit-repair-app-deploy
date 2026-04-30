import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/auth'
const db = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
export async function GET(req: NextRequest) {
  const { user, isAuthenticated } = await getCurrentUser(req)
  if (!isAuthenticated || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: commissions } = await db().from('mlm_commissions').select('id,commission_amount,commission_type,status,paid_at,created_at').eq('recipient_user_id', user.id).order('created_at',{ascending:false}).limit(20)
  return NextResponse.json({ success:true, invoices:(commissions||[]).map((c:any)=>({id:c.id,amount:Number(c.commission_amount)||0,type:c.commission_type,status:c.status,date:c.paid_at||c.created_at})) })
}