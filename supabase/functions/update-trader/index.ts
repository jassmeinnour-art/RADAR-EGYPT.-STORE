// Supabase Edge Function: update-trader
// Server-side Founder trader update endpoint so edits work reliably even when client RLS/Anon fallback is encountered.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const FOUNDER_EMAIL = 'jassmeinnour@gmail.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ALLOWED_UPDATE_COLUMNS = new Set([
  'seller_name',
  'email',
  'gmail',
  'phone',
  'address',
  'platform',
  'status',
  'seller_id',
  'seller_ids',
  'api_keys',
  'seller_link',
  'destination_url',
  'storefront_link',
  'store_url',
  'last_sync_at',
  'last_sync_timestamp',
  'founder_uid',
  'user_id',
]);

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'إعدادات الخادم (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY) غير متوفرة في Edge Function',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const admin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify caller identity: require valid founder JWT if bearer token is not the anon key
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const body = await req.json();

    let verifiedFounderUid: string | null = null;
    if (token && token !== supabaseAnonKey) {
      const { data: userData, error: userErr } = await admin.auth.getUser(token);
      if (userErr || !userData?.user) {
        return new Response(
          JSON.stringify({
            success: false,
            error: userErr?.message || 'Unauthorized: invalid founder session token',
            code: '401',
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const callerEmail = String(userData.user.email || '').trim().toLowerCase();
      if (callerEmail !== FOUNDER_EMAIL) {
        return new Response(
          JSON.stringify({
            success: false,
            error: `Forbidden: account ${callerEmail} is not authorized as founder`,
            code: '403',
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      verifiedFounderUid = userData.user.id;
    } else {
      const requestedFounderEmail = String(body?.founderEmail || '').trim().toLowerCase();
      if (requestedFounderEmail !== FOUNDER_EMAIL) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Unauthorized: founder authentication required to update traders',
            code: '401',
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const traderId = String(body?.traderId || body?.id || '').trim();
    if (!traderId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'معرف التاجر (id) مطلوب للتعديل ولا يجوز تركه فارغاً',
          code: 'MISSING_TRADER_ID',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rawUpdates = (body?.updates && typeof body.updates === 'object' ? body.updates : {}) as Record<string, any>;
    const cleanUpdates: Record<string, any> = {};

    for (const [key, value] of Object.entries(rawUpdates)) {
      if (key === 'id' || key === 'created_at') continue; // Never send id inside update payload
      if (!ALLOWED_UPDATE_COLUMNS.has(key)) continue;
      cleanUpdates[key] = value === '' ? null : value;
    }

    if (Object.prototype.hasOwnProperty.call(cleanUpdates, 'seller_name')) {
      const nameVal = String(cleanUpdates.seller_name || '').trim();
      if (!nameVal) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'اسم التاجر (seller_name) مطلوب ولا يمكن تركه فارغاً',
            code: 'VALIDATION_ERROR',
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      cleanUpdates.seller_name = nameVal;
    }

    if (verifiedFounderUid && !cleanUpdates.founder_uid) {
      cleanUpdates.founder_uid = verifiedFounderUid;
    }

    // Check duplicate email against OTHER traders (excluding current traderId)
    const candidateEmail = String(cleanUpdates.email || cleanUpdates.gmail || '').trim().toLowerCase();
    if (candidateEmail) {
      const { data: dupRows, error: dupErr } = await admin
        .from('traders')
        .select('id, email, gmail')
        .neq('id', traderId);

      if (!dupErr && Array.isArray(dupRows)) {
        const hasDup = dupRows.some(
          (row: any) =>
            String(row.email || '').trim().toLowerCase() === candidateEmail ||
            String(row.gmail || '').trim().toLowerCase() === candidateEmail
        );
        if (hasDup) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'هذا الإيميل موجود لتاجر آخر',
              details: `duplicate key value (${candidateEmail}) belongs to another trader`,
              code: '23505',
            }),
            { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    let { data, error } = await admin
      .from('traders')
      .update(cleanUpdates)
      .eq('id', traderId)
      .select()
      .single();

    // Retry gracefully if legacy table schema has NOT NULL constraints on optional text columns
    if (error && (error.code === '23502' || /violates not-null constraint/i.test(String(error.message || '')))) {
      const fallbackUpdates: Record<string, any> = { ...cleanUpdates };
      for (const k of Object.keys(fallbackUpdates)) {
        if (fallbackUpdates[k] === null && k !== 'founder_uid' && k !== 'user_id') {
          fallbackUpdates[k] = '';
        }
      }
      const retry = await admin
        .from('traders')
        .update(fallbackUpdates)
        .eq('id', traderId)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message || 'فشل تعديل بيانات التاجر في قاعدة البيانات',
          details: error.details || null,
          hint: error.hint || null,
          code: error.code || null,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err?.message || 'Unexpected error in update-trader edge function',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
