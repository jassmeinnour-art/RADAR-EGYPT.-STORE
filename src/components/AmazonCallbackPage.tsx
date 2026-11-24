import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Copy, Check, AlertTriangle, Loader2, ShieldCheck, MessageCircle } from 'lucide-react';
import { invokeUpdateTraderEdgeFunction, supabase } from '../lib/supabase';
import { saveTraderAmazonConnection } from '../utils/sellerCentralExcelImporter';
import { dataCache } from '../utils/dataCache';

export const AMAZON_CALLBACK_SUCCESS_MESSAGE = 'تم ربط التاجر بنجاح - الكود اتحفظ';
export const AMAZON_CALLBACK_WHATSAPP_INSTRUCTION =
  'تم نسخ الكود - ابعت الكود ده للمؤسس على الواتساب - واقفل الصفحة - متدخلش على رادار';
export const PENDING_OAUTH_TOAST_STORAGE_KEY = 'radar_pending_oauth_toast';

export interface AmazonCallbackPageProps {
  onShowToast?: (message: string) => void;
}

export function extractSellerIdFromOAuthState(
  rawState?: string | null,
  explicitSellerId?: string | null
): string {
  const direct = String(explicitSellerId || '').trim();
  if (direct) return direct;
  const trimmedState = String(rawState || '').trim();
  if (!trimmedState) return '';
  if (trimmedState.includes('_')) {
    const trailing = trimmedState.slice(trimmedState.lastIndexOf('_') + 1).trim();
    if (trailing) return trailing;
  }
  return trimmedState;
}

async function copyTextToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below if Clipboard API is blocked
  }

  try {
    if (typeof document !== 'undefined') {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return Boolean(ok);
    }
  } catch {
    // Ignore copy failure
  }
  return false;
}

export const AmazonCallbackPage: React.FC<AmazonCallbackPageProps> = ({
  onShowToast,
}) => {
  const { code, rawState, sellerId, errorParam, errorDescription } = useMemo(() => {
    if (typeof window === 'undefined') {
      return { code: '', rawState: '', sellerId: '', errorParam: '', errorDescription: '' };
    }
    const params = new URLSearchParams(window.location.search || '');
    const stateParam = (params.get('state') || '').trim();
    const explicitId = (
      params.get('selling_partner_id') ||
      params.get('seller_id') ||
      ''
    ).trim();
    const extractedSellerId = extractSellerIdFromOAuthState(stateParam, explicitId);

    return {
      code: (params.get('code') || params.get('spapi_oauth_code') || '').trim(),
      rawState: stateParam || explicitId,
      sellerId: extractedSellerId,
      errorParam: (params.get('error') || '').trim(),
      errorDescription: (params.get('error_description') || '').trim(),
    };
  }, []);

  const [isCopied, setIsCopied] = useState(false);
  const [copyAttempted, setCopyAttempted] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorDetails, setErrorDetails] = useState<string>('');
  const processedRef = useRef(false);

  const handleManualCopy = useCallback(async () => {
    if (!code) return;
    const copied = await copyTextToClipboard(code);
    setCopyAttempted(true);
    setIsCopied(copied);
  }, [code]);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    if (!code) {
      if (errorParam) {
        setSaveState('error');
        setErrorDetails(errorDescription || errorParam);
      }
      return;
    }

    let isActive = true;

    const run = async () => {
      // 1. Copy authorization code automatically to clipboard
      const copied = await copyTextToClipboard(code);
      if (!isActive) return;
      setCopyAttempted(true);
      setIsCopied(copied);

      // 2. Save code in traders.refresh_token matching extracted seller_id
      setSaveState('saving');
      let dbErrorMessage = '';

      if (sellerId) {
        let savedRemotely = false;
        try {
          const res = await supabase
            .from('traders')
            .update({ refresh_token: code })
            .eq('seller_id', sellerId);

          if (!res?.error) {
            savedRemotely = true;
          } else {
            dbErrorMessage = String(res.error?.message || res.error || '');
          }
        } catch (err: any) {
          dbErrorMessage = String(err?.message || err || '');
        }

        // If client-side RLS blocked update (trader opened callback without founder session), retry via Edge Function
        if (!savedRemotely) {
          try {
            const edgeRes = await invokeUpdateTraderEdgeFunction(
              { sellerId },
              { refresh_token: code },
              null
            );
            if (!edgeRes.error) {
              savedRemotely = true;
              dbErrorMessage = '';
            }
          } catch {
            // Keep prior dbErrorMessage if Edge Function unavailable
          }
        }

        // Keep local per-trader vault synchronized
        await saveTraderAmazonConnection({
          sellerId,
          refreshToken: code,
          syncToSupabase: false,
        }).catch(() => {});

        dataCache.invalidate('traders');

        if (!isActive) return;

        if (!savedRemotely && dbErrorMessage && !dbErrorMessage.toLowerCase().includes('unauthorized')) {
          setSaveState('error');
          setErrorDetails(dbErrorMessage);
          return;
        }
      }

      setSaveState('saved');
      setStatusMessage(AMAZON_CALLBACK_SUCCESS_MESSAGE);

      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem(PENDING_OAUTH_TOAST_STORAGE_KEY, AMAZON_CALLBACK_SUCCESS_MESSAGE);
        }
      } catch {
        // Safe ignore storage errors
      }

      onShowToast?.(AMAZON_CALLBACK_SUCCESS_MESSAGE);
    };

    run();

    return () => {
      isActive = false;
    };
  }, [code, sellerId, errorParam, errorDescription, onShowToast]);

  return (
    <div
      dir="rtl"
      data-testid="amazon-callback-page"
      className="min-h-screen w-full bg-white text-slate-900 flex items-center justify-center p-4 sm:p-8 font-['Cairo']"
    >
      <div className="w-full max-w-2xl bg-white border-2 border-slate-200 rounded-3xl shadow-xl p-6 sm:p-10 text-center space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${
              saveState === 'error'
                ? 'bg-red-50 border-red-200 text-red-600'
                : 'bg-emerald-50 border-emerald-200 text-emerald-600'
            }`}
          >
            {saveState === 'saving' ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : saveState === 'error' ? (
              <AlertTriangle className="w-8 h-8" />
            ) : (
              <ShieldCheck className="w-8 h-8" />
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            ربط حساب أمازون (Amazon Callback)
          </h1>

          {statusMessage && (
            <div
              role="status"
              data-testid="amazon-callback-success"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-base sm:text-lg font-extrabold"
            >
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        {code ? (
          <div className="space-y-5">
            <div className="text-sm font-bold text-slate-600">
              كود الموافقة المستلم من أمازون:
            </div>

            <div
              dir="ltr"
              data-testid="amazon-callback-code"
              className="w-full bg-slate-50 border-2 border-slate-300 rounded-2xl px-4 py-6 text-2xl sm:text-3xl md:text-4xl font-mono font-black tracking-wide text-slate-900 select-all break-all shadow-inner"
            >
              {code}
            </div>

            {rawState && (
              <div className="text-sm font-bold text-slate-600">
                معرّف التاجر (State):{' '}
                <span
                  dir="ltr"
                  data-testid="amazon-callback-state"
                  className="font-mono font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200"
                >
                  {rawState}
                </span>
              </div>
            )}

            <div
              data-testid="amazon-callback-whatsapp-instruction"
              className="w-full bg-emerald-50 border-2 border-emerald-400 rounded-2xl px-5 py-5 text-emerald-950 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-center gap-2 text-emerald-700 font-extrabold text-sm">
                <MessageCircle className="w-5 h-5 shrink-0" />
                <span>خطوة الإكمال</span>
              </div>
              <p className="text-xl sm:text-2xl font-black leading-relaxed text-slate-900">
                {AMAZON_CALLBACK_WHATSAPP_INSTRUCTION}
              </p>
            </div>

            <div className="flex items-center justify-center pt-1">
              <button
                type="button"
                data-testid="amazon-callback-copy-btn"
                onClick={handleManualCopy}
                className={`inline-flex items-center gap-2 px-7 py-4 rounded-2xl font-black text-base transition cursor-pointer border shadow-sm ${
                  isCopied
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                    : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'
                }`}
              >
                {isCopied ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>تم نسخ الكود ✓</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    <span>{copyAttempted ? 'نسخ الكود مرة أخرى' : 'تم نسخ الكود'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-900 text-sm font-bold">
              {errorDetails
                ? `تعذر إتمام التفويض من أمازون: ${errorDetails}`
                : 'لم يصل كود موافقة (code) في الرابط حتى الآن. برجاء التأكد من الرابط وإعادة المحاولة أو التواصل مع المؤسس.'}
            </div>
          </div>
        )}

        {saveState === 'error' && errorDetails && code && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs sm:text-sm text-red-700 font-bold">
            تنبيه أثناء الحفظ في قاعدة البيانات: {errorDetails}
          </div>
        )}
      </div>
    </div>
  );
};

export default AmazonCallbackPage;
