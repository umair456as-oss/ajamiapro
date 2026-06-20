
import { withSupabase } from "@supabase/server"

/**
 * Example handler for student data using @supabase/server
 * This demonstrates the RLS-scoped client (ctx.supabase) and admin client (ctx.supabaseAdmin)
 */
export const studentHandler = withSupabase({ auth: "user" }, async (req, ctx) => {
  const madrassaId = req.headers.get('x-madrassa-id') || 'master';
  
  if (req.method === 'GET') {
    const { data, error } = await ctx.supabase
      .from('madrassa_data')
      .select('value')
      .eq('tenant_id', madrassaId)
      .eq('key', 'students')
      .single();
      
    if (error && error.code !== 'PGRST116') {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    
    return new Response(JSON.stringify(data?.value || []), { status: 200 });
  }
  
  if (req.method === 'POST') {
    const body = await req.json();
    const { error } = await ctx.supabase
      .from('madrassa_data')
      .upsert({ 
        tenant_id: madrassaId, 
        key: 'students', 
        value: body, 
        updated_at: new Date().toISOString() 
      }, { onConflict: 'tenant_id,key' });
      
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }
  
  return new Response("Method not allowed", { status: 405 });
});

export default {
  fetch: studentHandler
}
