import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Bug,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  ExternalLink,
  Play,
  RefreshCw,
  Server,
  ShieldCheck,
  Terminal,
  Zap,
} from 'lucide-react';
import { supabaseClient, getSupabaseSyncConfig, isSupabaseConfigured } from '../lib/supabase';
import {
  getAmazonSpApiSettings,
  getTraderAmazonConnection,
} from '../utils/sellerCentralExcelImporter';

export interface SpApiDiagnosticResult {
  timestamp: string;
  target: 'edge_function' | 'backend_proxy' | 'edge_ping';
  endpointUrl: string;
  methodUsed: 'GET' | 'POST';
  httpStatus: number | null;
  statusText: string;
  durationMs: number;
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
  stage?: string;
  isMethodNotAllowed405: boolean;
  allowHeader?: string;
  requestHeadersSent: Record<string, string>;
  requestPayloadSent: Record<string, any>;
  responseHeaders: Record<string, string>;
  rawResponseText: string;
  parsedResponseJson: any;
  analysisNotes: string[];
}

interface TraderOption {
  id: string;
  seller_name: string;
  seller_id?: string;
  email?: string;
  refresh_token?: string;
}

interface SpApiDiagnosticToolProps {
  traders?: TraderOption[];
  onShowToast?: (message: string) => void;
  className?: string;
}

function maskSecret(val?: string): string {
  if (!val) return '';
  const str = String(val).trim();
  if (str.length <= 8) return '********';
  return `${str.slice(0, 4)}...${str.slice(-4)}`;
}

export const SpApiDiagnosticTool: React.FC<SpApiDiagnosticToolProps> = ({
  traders = [],
  onShowToast,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [selectedTraderId, setSelectedTraderId] = useState<string>('khaled_default');
  const [customSellerId, setCustomSellerId] = useState<string>('A23IW2QPEITPWT');
  const [customRefreshToken, setCustomRefreshToken] = useState<string>('');
  const [marketplaceId, setMarketplaceId] = useState<string>('A2VIGQ35RCS4UG');
  const [region, setRegion] = useState<string>('eu-west-1');
  const [targetType, setTargetType] = useState<'edge_function' | 'backend_proxy' | 'edge_ping'>('edge_function');

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [diagnosticResult, setDiagnosticResult] = useState<SpApiDiagnosticResult | null>(null);
  const [copiedSection, setCopiedSection] = useState<'json' | 'report' | null>(null);
  const [showHeaders, setShowHeaders] = useState<boolean>(true);
  const [showPayload, setShowPayload] = useState<boolean>(false);

  // Auto-fill when changing selected trader
  const handleSelectTrader = (traderId: string) => {
    setSelectedTraderId(traderId);
    if (traderId === 'khaled_default') {
      setCustomSellerId('A23IW2QPEITPWT');
      const conn = getTraderAmazonConnection('A23IW2QPEITPWT');
      if (conn.refreshToken) setCustomRefreshToken(conn.refreshToken);
      return;
    }
    if (traderId === 'mahmoud_default') {
      setCustomSellerId('A37JIM7LHQI6IM');
      const conn = getTraderAmazonConnection('A37JIM7LHQI6IM');
      if (conn.refreshToken) setCustomRefreshToken(conn.refreshToken);
      return;
    }

    const matched = traders.find((t) => t.id === traderId);
    if (matched) {
      const sId = matched.seller_id || matched.id;
      setCustomSellerId(sId);
      const conn = getTraderAmazonConnection(matched);
      if (conn.refreshToken) {
        setCustomRefreshToken(conn.refreshToken);
      } else if (matched.refresh_token) {
        setCustomRefreshToken(matched.refresh_token);
      }
    }
  };

  const executeDiagnostic = async (overrideTarget?: 'edge_function' | 'backend_proxy' | 'edge_ping') => {
    const activeTarget = overrideTarget || targetType;
    setIsRunning(true);
    setDiagnosticResult(null);

    const startTime = performance.now();
    const globalSettings = getAmazonSpApiSettings();
    const effectiveSellerId = customSellerId.trim() || 'A23IW2QPEITPWT';
    const effectiveRefreshToken =
      customRefreshToken.trim() ||
      getTraderAmazonConnection(effectiveSellerId).refreshToken ||
      globalSettings.refreshToken ||
      '';

    const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseSyncConfig();

    let endpointUrl = '';
    let methodUsed: 'GET' | 'POST' = 'POST';
    const requestHeadersSent: Record<string, string> = {};
    const requestPayloadSent: Record<string, any> = {};
    const responseHeaders: Record<string, string> = {};
    let httpStatus: number | null = null;
    let statusText = '';
    let rawResponseText = '';
    let parsedResponseJson: any = null;
    let success = false;
    let errorCode: string | undefined;
    let errorMessage: string | undefined;
    let stage: string | undefined;
    const analysisNotes: string[] = [];

    try {
      if (activeTarget === 'edge_ping') {
        // Mode 1: Health Ping to Edge Function
        endpointUrl = `${supabaseUrl || 'https://<project-ref>.supabase.co'}/functions/v1/amazon-sp-api-sync`;
        methodUsed = 'POST';
        requestHeadersSent['Content-Type'] = 'application/json';
        requestHeadersSent['apikey'] = maskSecret(supabaseAnonKey);
        requestHeadersSent['Authorization'] = `Bearer ${maskSecret(supabaseAnonKey)}`;
        requestPayloadSent['action'] = 'ping';

        if (supabaseClient?.functions) {
          const { data, error } = await supabaseClient.functions.invoke('amazon-sp-api-sync', {
            body: { action: 'ping' },
          });

          if (error) {
            const ctx = (error as any)?.context;
            if (ctx && typeof ctx.text === 'function') {
              httpStatus = ctx.status || 500;
              statusText = ctx.statusText || 'Error';
              ctx.headers?.forEach?.((v: string, k: string) => {
                responseHeaders[k] = v;
              });
              rawResponseText = await ctx.text();
            } else {
              httpStatus = 0;
              statusText = error.name || 'FunctionsFetchError';
              rawResponseText = JSON.stringify({ error: error.name, message: error.message }, null, 2);
            }
          } else {
            httpStatus = 200;
            statusText = 'OK';
            parsedResponseJson = data;
            rawResponseText = JSON.stringify(data, null, 2);
            success = true;
          }
        } else {
          // Direct fetch attempt
          const res = await fetch(endpointUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              apikey: supabaseAnonKey,
              Authorization: `Bearer ${supabaseAnonKey}`,
            },
            body: JSON.stringify({ action: 'ping' }),
          });

          httpStatus = res.status;
          statusText = res.statusText;
          res.headers.forEach((v, k) => {
            responseHeaders[k] = v;
          });
          rawResponseText = await res.text();
          try {
            parsedResponseJson = JSON.parse(rawResponseText);
            success = res.ok && parsedResponseJson.success !== false;
          } catch {
            parsedResponseJson = null;
          }
        }
      } else if (activeTarget === 'backend_proxy') {
        // Mode 2: Test backend Express route
        endpointUrl = '/api/amazon/sp-api/pull-products';
        methodUsed = 'POST';
        requestHeadersSent['Content-Type'] = 'application/json';
        requestPayloadSent['sellerId'] = effectiveSellerId;
        requestPayloadSent['refreshToken'] = maskSecret(effectiveRefreshToken);
        requestPayloadSent['marketplaceId'] = marketplaceId;
        requestPayloadSent['region'] = region;

        const res = await fetch(endpointUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sellerId: effectiveSellerId,
            merchantId: effectiveSellerId,
            refreshToken: effectiveRefreshToken,
            marketplaceId,
            region,
            clientId: globalSettings.clientId,
            clientSecret: globalSettings.clientSecret,
            applicationId: globalSettings.applicationId,
          }),
        });

        httpStatus = res.status;
        statusText = res.statusText;
        res.headers.forEach((v, k) => {
          responseHeaders[k] = v;
        });
        rawResponseText = await res.text();
        try {
          parsedResponseJson = JSON.parse(rawResponseText);
          success = res.ok && parsedResponseJson?.success !== false;
        } catch {
          parsedResponseJson = null;
        }
      } else {
        // Mode 3: Test Edge Function with Full SP-API Payload
        endpointUrl = `${supabaseUrl || 'https://<project-ref>.supabase.co'}/functions/v1/amazon-sp-api-sync`;
        methodUsed = 'POST';
        requestHeadersSent['Content-Type'] = 'application/json';
        requestHeadersSent['apikey'] = maskSecret(supabaseAnonKey);
        requestHeadersSent['Authorization'] = `Bearer ${maskSecret(supabaseAnonKey)}`;

        requestPayloadSent['sellerId'] = effectiveSellerId;
        requestPayloadSent['refreshToken'] = maskSecret(effectiveRefreshToken);
        requestPayloadSent['marketplaceId'] = marketplaceId;
        requestPayloadSent['region'] = region;
        requestPayloadSent['clientId'] = maskSecret(globalSettings.clientId);
        requestPayloadSent['clientSecret'] = maskSecret(globalSettings.clientSecret);
        requestPayloadSent['applicationId'] = globalSettings.applicationId || 'N/A';

        const invokeBody = {
          sellerId: effectiveSellerId,
          traderId: effectiveSellerId,
          refreshToken: effectiveRefreshToken,
          marketplaceId,
          region,
          clientId: globalSettings.clientId,
          clientSecret: globalSettings.clientSecret,
          applicationId: globalSettings.applicationId,
        };

        if (supabaseClient?.functions) {
          const { data, error } = await supabaseClient.functions.invoke('amazon-sp-api-sync', {
            body: invokeBody,
          });

          if (error) {
            const ctx = (error as any)?.context;
            if (ctx && typeof ctx.text === 'function') {
              httpStatus = ctx.status || 500;
              statusText = ctx.statusText || 'Error';
              ctx.headers?.forEach?.((v: string, k: string) => {
                responseHeaders[k] = v;
              });
              rawResponseText = await ctx.text();
            } else {
              httpStatus = 0;
              statusText = error.name || 'FunctionsFetchError';
              rawResponseText = JSON.stringify({ error: error.name, message: error.message }, null, 2);
            }
          } else {
            httpStatus = 200;
            statusText = 'OK';
            parsedResponseJson = data;
            rawResponseText = JSON.stringify(data, null, 2);
            success = true;
          }
        } else {
          // Direct fetch attempt
          const res = await fetch(endpointUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              apikey: supabaseAnonKey,
              Authorization: `Bearer ${supabaseAnonKey}`,
            },
            body: JSON.stringify(invokeBody),
          });

          httpStatus = res.status;
          statusText = res.statusText;
          res.headers.forEach((v, k) => {
            responseHeaders[k] = v;
          });
          rawResponseText = await res.text();
        }
      }

      // Try parsing JSON if not parsed yet
      if (!parsedResponseJson && rawResponseText) {
        try {
          parsedResponseJson = JSON.parse(rawResponseText);
        } catch {
          parsedResponseJson = null;
        }
      }

      // Extract error details if any
      if (parsedResponseJson && typeof parsedResponseJson === 'object') {
        success = Boolean(httpStatus === 200 && parsedResponseJson.success !== false);
        errorCode =
          parsedResponseJson.error ||
          parsedResponseJson.amazonError?.code ||
          parsedResponseJson.errorCode ||
          (Array.isArray(parsedResponseJson.errors) ? parsedResponseJson.errors[0]?.code : undefined);
        errorMessage =
          parsedResponseJson.message ||
          parsedResponseJson.error_description ||
          parsedResponseJson.amazonError?.message ||
          (Array.isArray(parsedResponseJson.errors) ? parsedResponseJson.errors[0]?.message : undefined);
        stage = parsedResponseJson.stage;
      } else if (httpStatus && httpStatus >= 400) {
        errorMessage = `HTTP ${httpStatus}: ${rawResponseText.slice(0, 150)}`;
      }
    } catch (err: any) {
      httpStatus = 0;
      statusText = err?.name || 'ClientException';
      errorMessage = err?.message || 'Failed to complete diagnostic call';
      rawResponseText = JSON.stringify({ error: err?.name, message: err?.message, stack: err?.stack }, null, 2);
    }

    const durationMs = Math.round(performance.now() - startTime);

    // Analyze specifically for 405 Method Not Allowed
    const is405 =
      httpStatus === 405 ||
      rawResponseText.includes('405') ||
      rawResponseText.toLowerCase().includes('method not allowed') ||
      Boolean(errorCode && String(errorCode).includes('405'));

    const allowHeader = responseHeaders['allow'] || responseHeaders['Allow'];

    if (is405) {
      analysisNotes.push(
        '⚠️ تم رصد خطأ 405 Method Not Allowed: الخادم يرفض طريقة الطلب HTTP المستخدمة.'
      );
      if (allowHeader) {
        analysisNotes.push(`📋 ترويسة Allow المسترجعة من الخادم تحدد الطرق المسموحة: "${allowHeader}"`);
      }
      analysisNotes.push(
        '💡 قاعدة Amazon SP-API الإلزامية: لطلب التوكن (LWA Token) استخدم POST https://api.amazon.com/auth/o2/token حصراً بـ grant_type=refresh_token. ولجلب المنتجات استخدم GET https://sellingpartnerapi-eu.amazon.com/listings/2021-08-01/{sellerId} حصراً مع توقيع AWS SigV4.'
      );
      if (stage === 'sp_api_listings') {
        analysisNotes.push(
          '📍 حدث الخطأ في مرحلة GET /listings/2021-08-01: تحقق من صحة ترويسة Authorization بتوقيع AWS SigV4، ووجود x-amz-access-token.'
        );
      } else if (stage === 'lwa_token_exchange') {
        analysisNotes.push(
          '📍 حدث الخطأ في مرحلة POST /auth/o2/token: تأكد من إرسال body كـ x-www-form-urlencoded بـ grant_type=refresh_token وليس JSON.'
        );
      }
    } else if (httpStatus === 400 || (errorCode && errorCode.includes('invalid_grant'))) {
      analysisNotes.push(
        '🔑 كود التفويض أو Refresh Token غير صالح أو منتهي الصلاحية (invalid_grant): يرجى إعادة التفويض عبر زر "توليد رابط الموافقة (OAuth)" لتحديث الـ Refresh Token.'
      );
    } else if (httpStatus === 403 || (errorCode && errorCode.includes('Unauthorized'))) {
      analysisNotes.push(
        '🔒 خطأ صلاحيات (403 Unauthorized): تأكد من تفعيل صلاحيات Product Listing و Pricing في تطبيق Amazon SP-API، وأن الحساب مفوض على متجر التاجر.'
      );
    } else if (httpStatus === 0) {
      analysisNotes.push(
        '🌐 خطأ شبكة أو CORS (Failed to send a request to the Edge Function): الدالة amazon-sp-api-sync غير منشورة على Supabase أو لم يتم تفعيل CORS أو رابط VITE_SUPABASE_URL غير متاح.'
      );
    } else if (success) {
      analysisNotes.push(
        '✅ الاتصال سليم تماماً! استجابة الخادم ناجحة وتم قراءة بيانات الكتالوج دون أي تعارض في طرق الـ HTTP.'
      );
    }

    const result: SpApiDiagnosticResult = {
      timestamp: new Date().toISOString(),
      target: activeTarget,
      endpointUrl,
      methodUsed,
      httpStatus,
      statusText,
      durationMs,
      success,
      errorCode,
      errorMessage,
      stage,
      isMethodNotAllowed405: is405,
      allowHeader,
      requestHeadersSent,
      requestPayloadSent,
      responseHeaders,
      rawResponseText,
      parsedResponseJson,
      analysisNotes,
    };

    setDiagnosticResult(result);
    setIsRunning(false);

    if (onShowToast) {
      if (result.success) {
        onShowToast('✅ اكتمل الفحص التشخيصي بنجاح!');
      } else if (is405) {
        onShowToast('⚠️ تم رصد خطأ 405 Method Not Allowed - راجع تقرير التحليل بالأسفل');
      } else {
        onShowToast(`⚠️ نتيجة الفحص: ${result.errorMessage || `HTTP ${result.httpStatus}`}`);
      }
    }
  };

  const copyToClipboard = async (text: string, type: 'json' | 'report') => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      // Safe fallback if clipboard permission is denied or in jsdom
    }
    setCopiedSection(type);
    setTimeout(() => setCopiedSection(null), 2500);
    if (onShowToast) onShowToast(type === 'json' ? '📋 تم نسخ الـ JSON الخام' : '📋 تم نسخ تقرير التشخيص بالكامل');
  };

  const generateFullReportText = (res: SpApiDiagnosticResult): string => {
    return [
      `=== تقرير تشخيص اتصال Amazon SP-API & Edge Function ===`,
      `التاريخ والوقت: ${res.timestamp}`,
      `الهدف: ${res.target} (${res.endpointUrl})`,
      `طريقة الطلب: ${res.methodUsed}`,
      `الحالة: ${res.httpStatus !== null ? `HTTP ${res.httpStatus}` : 'N/A'} (${res.statusText})`,
      `زمن الاستجابة: ${res.durationMs} ms`,
      `النجاح: ${res.success ? 'نعم ✓' : 'لا ✗'}`,
      res.stage ? `المرحلة: ${res.stage}` : '',
      res.errorCode ? `كود الخطأ: ${res.errorCode}` : '',
      res.errorMessage ? `رسالة الخطأ: ${res.errorMessage}` : '',
      res.allowHeader ? `ترويسة Allow: ${res.allowHeader}` : '',
      `\n--- ملاحظات التحليل ---`,
      ...res.analysisNotes,
      `\n--- ترويسات الاستجابة ---`,
      JSON.stringify(res.responseHeaders, null, 2),
      `\n--- الاستجابة الخام من أمازون / السيرفر ---`,
      res.rawResponseText,
      `======================================================`,
    ]
      .filter(Boolean)
      .join('\n');
  };

  return (
    <div
      className={`rounded-3xl border border-amber-500/30 bg-slate-950/90 text-slate-100 p-5 sm:p-7 shadow-2xl transition-all space-y-6 ${className}`}
      dir="rtl"
      data-testid="sp-api-diagnostic-tool-container"
    >
      {/* Header bar with toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Bug className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-white">
                أداة تشخيص فحص اتصال Amazon SP-API & Edge Function
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                تحليل أخطاء 405 Method Not Allowed 🔍
              </span>
            </div>
            <p className="text-xs text-slate-400">
              فحص استجابة الدالة <code className="text-sky-300 font-mono">amazon-sp-api-sync</code> وعرض استجابة أمازون الخام، الترويسات (Headers)، وكود الخطأ الحقيقي لتتبع المشكلة بدقة.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition cursor-pointer"
        >
          <span>{isOpen ? 'إخفاء الأداة' : 'عرض أداة التشخيص'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-6">
          {/* Diagnostic Controls Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs">
            {/* 1. Trader Selector */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block">اختيار التاجر المستهدف:</label>
              <select
                value={selectedTraderId}
                onChange={(e) => handleSelectTrader(e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold outline-none focus:border-amber-500 transition"
              >
                <option value="khaled_default">تاجر خالد محمد (A23IW2QPEITPWT) ⚡</option>
                <option value="mahmoud_default">تاجر محمود سعيد (A37JIM7LHQI6IM)</option>
                {traders
                  .filter((t) => t.id !== 'khaled_default' && t.id !== 'mahmoud_default')
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.seller_name} ({t.seller_id || t.id})
                    </option>
                  ))}
                <option value="custom">إدخال معرّف يدوي مخصص (Custom)</option>
              </select>
            </div>

            {/* 2. Seller ID Input */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block">معرّف البائع (Seller ID):</label>
              <input
                type="text"
                value={customSellerId}
                onChange={(e) => setCustomSellerId(e.target.value)}
                placeholder="A23IW2QPEITPWT"
                className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs outline-none focus:border-amber-500 transition"
              />
            </div>

            {/* 3. Marketplace & Region */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block">السوق والمنطقة:</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={marketplaceId}
                  onChange={(e) => setMarketplaceId(e.target.value)}
                  className="h-9 px-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-[11px] outline-none focus:border-amber-500"
                >
                  <option value="A2VIGQ35RCS4UG">مصر (A2VIGQ35RCS4UG)</option>
                  <option value="A17E79C6D8DWNP">السعودية (A17E79C6D8DWNP)</option>
                  <option value="ATVPDKIKX0DER">أمريكا (ATVPDKIKX0DER)</option>
                </select>

                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="h-9 px-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-[11px] outline-none focus:border-amber-500"
                >
                  <option value="eu-west-1">EU (eu-west-1)</option>
                  <option value="us-east-1">NA (us-east-1)</option>
                  <option value="us-west-2">FE (us-west-2)</option>
                </select>
              </div>
            </div>

            {/* 4. Target Mode */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 block">طريقة ونقطة الفحص:</label>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as any)}
                className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 font-bold outline-none focus:border-amber-500 transition"
              >
                <option value="edge_function">Supabase Edge Function (amazon-sp-api-sync)</option>
                <option value="edge_ping">فحص نبض الدالة السريع (action: 'ping')</option>
                <option value="backend_proxy">خادم الواجهة الخلفية (/api/amazon/sp-api/pull-products)</option>
              </select>
            </div>

            {/* Refresh Token (Optional override) */}
            <div className="col-span-1 md:col-span-2 lg:col-span-4 space-y-1.5 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-400 text-[11px]">
                  رمز Refresh Token للتاجر (اختياري - يتم قراءته تلقائياً من إعدادات المتجر إن وجد):
                </label>
                <span className="text-[10px] text-slate-500 font-mono">
                  {customRefreshToken ? `تم رصد رمز بطول ${customRefreshToken.length} حرف` : 'مستخدم من إعدادات التاجر المخزنة'}
                </span>
              </div>
              <input
                type="password"
                value={customRefreshToken}
                onChange={(e) => setCustomRefreshToken(e.target.value)}
                placeholder="Atzr|... (Refresh Token الخاص بـ Amazon SP-API)"
                className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => executeDiagnostic()}
              disabled={isRunning}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              data-testid="sp-api-run-diagnostic-button"
            >
              {isRunning ? (
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <Play className="w-4 h-4 text-slate-950 fill-current" />
              )}
              <span>{isRunning ? 'جاري الفحص واستدعاء أمازون...' : 'تشغيل فحص وتشخيص الاتصال (Test SP-API Sync)'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleSelectTrader('khaled_default');
                executeDiagnostic('edge_function');
              }}
              disabled={isRunning}
              className="px-4 py-2.5 rounded-xl bg-sky-950/60 hover:bg-sky-900/60 border border-sky-500/40 text-sky-300 font-bold text-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              data-testid="sp-api-diagnose-khaled-button"
            >
              <Zap className="w-4 h-4 text-sky-400" />
              <span>تجربة فورية على تاجر خالد (A23IW2QPEITPWT)</span>
            </button>

            <button
              type="button"
              onClick={() => executeDiagnostic('edge_ping')}
              disabled={isRunning}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>فحص نبض الـ Edge Function فقط (Health Ping)</span>
            </button>
          </div>

          {/* Diagnostic Results Presentation */}
          {diagnosticResult && (
            <div className="space-y-4 pt-4 border-t border-slate-800/80 animate-in fade-in duration-200" data-testid="sp-api-diagnostic-results-view">
              
              {/* Status Header Banner */}
              <div
                className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  diagnosticResult.success
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : diagnosticResult.isMethodNotAllowed405
                    ? 'bg-rose-950/60 border-rose-500 text-rose-100 ring-2 ring-rose-500/40'
                    : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-black font-mono flex items-center gap-1.5 ${
                        diagnosticResult.success
                          ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                          : diagnosticResult.isMethodNotAllowed405
                          ? 'bg-rose-600 text-white font-black animate-pulse'
                          : 'bg-rose-500/30 text-rose-300 border border-rose-500/50'
                      }`}
                      data-testid="sp-api-status-badge"
                    >
                      {diagnosticResult.success ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                      <span>
                        {diagnosticResult.httpStatus !== null
                          ? `HTTP ${diagnosticResult.httpStatus} ${diagnosticResult.statusText}`
                          : `فشل الاتصال: ${diagnosticResult.statusText}`}
                      </span>
                    </span>

                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{diagnosticResult.durationMs} ms</span>
                    </span>

                    <span className="text-xs text-slate-400 font-mono">
                      الهدف: {diagnosticResult.target}
                    </span>
                  </div>

                  <p className="text-xs font-bold pt-1">
                    {diagnosticResult.errorMessage || (diagnosticResult.success ? 'تم الاتصال وقراءة الرد بنجاح دون أخطاء.' : 'حدث خطأ أثناء الاتصال.')}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(diagnosticResult.rawResponseText, 'json')}
                    className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
                    data-testid="sp-api-copy-json-button"
                  >
                    {copiedSection === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'json' ? 'تم نسخ الـ JSON' : 'نسخ الـ JSON'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(generateFullReportText(diagnosticResult), 'report')}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 border border-amber-500/40 transition cursor-pointer"
                    data-testid="sp-api-copy-report-button"
                  >
                    {copiedSection === 'report' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Terminal className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'report' ? 'تم نسخ التقرير' : 'نسخ تقرير الفحص'}</span>
                  </button>
                </div>
              </div>

              {/* Special 405 Method Not Allowed Troubleshooter Box */}
              {diagnosticResult.isMethodNotAllowed405 && (
                <div
                  className="p-5 rounded-2xl bg-rose-950/40 border border-rose-500/50 space-y-3"
                  data-testid="sp-api-405-troubleshooter-box"
                >
                  <div className="flex items-center gap-2 text-rose-300 font-black text-sm">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                    <span>تحليل استجابة 405 Method Not Allowed وحل المشكلة:</span>
                  </div>

                  <div className="text-xs text-rose-100/90 space-y-2 leading-relaxed">
                    <p>
                      الخطأ <strong className="font-mono text-rose-200">405 Method Not Allowed</strong> يعني أن أحد الخوادم في المسار رفض طريقة الطلب HTTP. تأكد من مطابقة المعايير التالية:
                    </p>
                    <ul className="list-disc list-inside space-y-1.5 pr-2 font-mono text-[11px] text-rose-200">
                      <li>
                        <strong>LWA Token Exchange:</strong> يجب أن يكون <code className="bg-rose-900/60 px-1.5 py-0.5 rounded text-white">POST https://api.amazon.com/auth/o2/token</code> حصراً مع <code className="bg-rose-900/60 px-1.5 py-0.5 rounded text-white">grant_type=refresh_token</code> و <code className="bg-rose-900/60 px-1.5 py-0.5 rounded text-white">Content-Type: application/x-www-form-urlencoded</code>.
                      </li>
                      <li>
                        <strong>SP-API Listings Items:</strong> يجب أن يكون <code className="bg-rose-900/60 px-1.5 py-0.5 rounded text-white">GET https://sellingpartnerapi-eu.amazon.com/listings/2021-08-01/items/{'{sellerId}'}</code> (وليس POST) مع توقيع AWS SigV4.
                      </li>
                      <li>
                        <strong>SP-API Catalog Items:</strong> يجب أن يكون <code className="bg-rose-900/60 px-1.5 py-0.5 rounded text-white">GET https://sellingpartnerapi-eu.amazon.com/catalog/2022-04-01/items</code> (وليس POST).
                      </li>
                      {diagnosticResult.allowHeader && (
                        <li>
                          <strong>ترويسة Allow المسترجعة:</strong> <code className="text-amber-300 font-bold">{diagnosticResult.allowHeader}</code>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {/* Analysis Notes Checklist */}
              {diagnosticResult.analysisNotes.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                  <h4 className="font-bold text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-sky-400" />
                    <span>ملاحظات التحليل والتشخيص:</span>
                  </h4>
                  <ul className="space-y-1 pr-2 text-slate-300 text-xs">
                    {diagnosticResult.analysisNotes.map((note, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Headers Table Section */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowHeaders(!showHeaders)}
                  className="w-full px-4 py-3 bg-slate-900/80 hover:bg-slate-900 text-xs font-bold text-slate-300 flex items-center justify-between transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-sky-400" />
                    <span>ترويسات الاستجابة (Response Headers) ({Object.keys(diagnosticResult.responseHeaders).length})</span>
                    {diagnosticResult.allowHeader && (
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold border border-rose-500/30">
                        Allow: {diagnosticResult.allowHeader}
                      </span>
                    )}
                  </span>
                  {showHeaders ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showHeaders && (
                  <div className="p-3 text-[11px] font-mono overflow-x-auto">
                    {Object.keys(diagnosticResult.responseHeaders).length === 0 ? (
                      <p className="text-slate-500 p-2">لم يتم إرجاع ترويسات خاصة أو أن الطلب تم عبر متصفح محمي بسياسات CORS مقيدة.</p>
                    ) : (
                      <table className="w-full text-right" data-testid="sp-api-headers-table">
                        <thead className="text-slate-500 border-b border-slate-800 text-[10px]">
                          <tr>
                            <th className="p-2">Header Name</th>
                            <th className="p-2">Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40 text-slate-300">
                          {Object.entries(diagnosticResult.responseHeaders).map(([key, value]) => (
                            <tr key={key} className={key.toLowerCase() === 'allow' ? 'bg-rose-950/40 text-rose-200 font-bold' : ''}>
                              <td className="p-2 font-bold text-sky-400/90 whitespace-nowrap">{key}</td>
                              <td className="p-2 break-all text-slate-200">{value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>

              {/* Raw JSON Response Viewer */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden space-y-0">
                <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-mono font-bold text-slate-300">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>الرد الخام من أمازون / السيرفر (Raw Response JSON):</span>
                    {diagnosticResult.errorCode && (
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] border border-rose-500/30">
                        {diagnosticResult.errorCode}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(diagnosticResult.rawResponseText, 'json')}
                    className="text-[11px] text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ</span>
                  </button>
                </div>

                <pre
                  className="p-4 text-[11px] font-mono text-emerald-300/95 overflow-x-auto max-h-96 leading-relaxed select-all"
                  dir="ltr"
                  data-testid="sp-api-raw-json-viewer"
                >
                  {diagnosticResult.rawResponseText || '// لا يوجد رد نصي راجع من الخادم'}
                </pre>
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default SpApiDiagnosticTool;
