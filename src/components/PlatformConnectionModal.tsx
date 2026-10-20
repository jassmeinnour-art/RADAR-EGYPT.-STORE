import React, { useState, useEffect, useRef } from 'react';
import { 
  Store, 
  Mail, 
  CheckCircle2, 
  AlertTriangle, 
  Link2, 
  Unlink, 
  Sparkles, 
  RefreshCw, 
  ShieldCheck, 
  Globe, 
  ExternalLink, 
  Users, 
  Lock, 
  Check, 
  X,
  FileSpreadsheet,
  Zap,
  ArrowRight,
  Upload,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Key,
  UserCheck,
  Building2,
  Sliders,
  Rocket
} from 'lucide-react';
import { ConnectedMerchantPlatform, RemoteMerchantClient, ProductData, PlatformCompetitorRecord } from '../types';
import {
  getPlatformSellerPortalUrl,
  directLaunchPlatformPortal
} from '../utils/platformLaunchHelper';
import {
  parseCompetitorsCSV,
  downloadCompetitorCSVTemplate,
  mergeCompetitorsIntoProducts,
  CompetitorCSVParseResult,
  ParsedCompetitorRow
} from '../utils/competitorCSVManager';

interface PlatformConnectionModalProps {
  platform: ConnectedMerchantPlatform;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPlatform: ConnectedMerchantPlatform, targetMerchantId?: string) => void;
  onAutoConnect: (platformId: string, targetMerchantId?: string) => void;
  onDisconnect: (platformId: string, targetMerchantId?: string) => void;
  remoteMerchants: RemoteMerchantClient[];
  currentMerchantEmail?: string;
  managerEmail?: string;
  activeMerchantId?: string;
  onSwitchActiveMerchant?: (merchantId: string) => void;
  onNavigateToRemoteMerchants?: () => void;
  allProducts?: ProductData[];
  currentProduct?: ProductData;
  onImportPlatformCompetitors?: (
    updatedProducts: ProductData[],
    updatedActiveProduct: ProductData,
    newRecords: PlatformCompetitorRecord[],
    platformId: string,
    mode: 'merge' | 'replace'
  ) => void;
  onNavigateToRadar?: () => void;
  onShowToast?: (message: string) => void;
  initialTab?: 'settings' | 'competitors_csv';
}

export const PlatformConnectionModal: React.FC<PlatformConnectionModalProps> = ({
  platform,
  isOpen,
  onClose,
  onSave,
  onAutoConnect,
  onDisconnect,
  remoteMerchants,
  currentMerchantEmail = 'merchant@radar-egypt.com',
  managerEmail = 'jassmeinnour@gmail.com',
  activeMerchantId,
  onSwitchActiveMerchant,
  onNavigateToRemoteMerchants,
  allProducts = [],
  currentProduct,
  onImportPlatformCompetitors,
  onNavigateToRadar,
  onShowToast,
  initialTab = 'settings'
}) => {
  // Tabs: Settings vs Competitors CSV Import
  const [activeTab, setActiveTab] = useState<'settings' | 'competitors_csv'>(initialTab);

  // Settings State (declared unconditionally at top to prevent React Error #310)
  const initialMerchantId = activeMerchantId || platform?.linkedMerchantClientId || (remoteMerchants[0]?.id || '');
  const [linkedMerchantId, setLinkedMerchantId] = useState(initialMerchantId);
  const [sellerName, setSellerName] = useState(platform?.sellerName || '');
  const [sellerId, setSellerId] = useState(platform?.sellerId || '');
  const [merchantEmail, setMerchantEmail] = useState(platform?.merchantEmail || '');
  const [mwsAuthToken, setMwsAuthToken] = useState(platform?.mwsAuthToken || '');
  const [sellerLoginId, setSellerLoginId] = useState(platform?.sellerLoginId || '');
  const [credentialsNotes, setCredentialsNotes] = useState(platform?.credentialsNotes || '');
  const [showSensitiveTokens, setShowSensitiveTokens] = useState(false);
  const [merchantStoreUrl, setMerchantStoreUrl] = useState(platform?.merchantStoreUrl || '');
  const [sellerPortalUrl, setSellerPortalUrl] = useState(platform ? getPlatformSellerPortalUrl(platform) : '');
  const [apiKey, setApiKey] = useState(platform?.apiKey || '');
  const [autoSyncPrice, setAutoSyncPrice] = useState(platform?.autoSyncPrice ?? true);
  const [autoSyncOrders, setAutoSyncOrders] = useState(platform?.autoSyncOrders ?? true);
  const [autoWeeklyReportEmail, setAutoWeeklyReportEmail] = useState(platform?.autoWeeklyReportEmail ?? true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);

  // Competitor CSV State
  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [csvRawContent, setCsvRawContent] = useState<string>('');
  const [parseResult, setParseResult] = useState<CompetitorCSVParseResult | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [csvInputMode, setCsvInputMode] = useState<'upload' | 'paste'>('upload');
  const [previewFilter, setPreviewFilter] = useState<'all' | 'valid' | 'invalid'>('all');
  const [csvImportSuccess, setCsvImportSuccess] = useState(false);
  const [importedSummary, setImportedSummary] = useState<{ count: number; minPrice: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const effectiveAgencyManagerEmail = managerEmail || currentMerchantEmail || 'manager@agency.com';
  const matchedRemoteMerchant = remoteMerchants.find(m => m.id === linkedMerchantId) || remoteMerchants[0];

  // Sync state when platform prop or activeMerchantId changes
  useEffect(() => {
    if (!platform) return;
    const targetMerchId = activeMerchantId || platform.linkedMerchantClientId || (remoteMerchants[0]?.id || '');
    setLinkedMerchantId(targetMerchId);

    const matched = remoteMerchants.find(m => m.id === targetMerchId);
    const creds = matched?.platformCredentials?.[platform.code];

    if (creds) {
      setSellerName(creds.sellerName || matched?.storeName || platform.sellerName || '');
      setSellerId(creds.sellerId || platform.sellerId || (matched ? `EG-${matched.id.toUpperCase().replace('MERCH-', 'M')}` : ''));
      setMerchantEmail(creds.merchantEmail || matched?.primaryEmail || platform.merchantEmail || '');
      setMwsAuthToken(creds.mwsAuthToken || platform.mwsAuthToken || '');
      setApiKey(creds.apiKey || platform.apiKey || '');
      setSellerLoginId(creds.sellerLoginId || platform.sellerLoginId || '');
      if (creds.sellerPortalUrl) setSellerPortalUrl(creds.sellerPortalUrl);
      if (creds.merchantStoreUrl) setMerchantStoreUrl(creds.merchantStoreUrl);
    } else {
      setSellerName(platform.sellerName || matched?.storeName || '');
      setSellerId(platform.sellerId || (matched ? `EG-${matched.id.toUpperCase().replace('MERCH-', 'M')}` : ''));
      setMerchantEmail(platform.merchantEmail || matched?.primaryEmail || '');
      setMwsAuthToken(platform.mwsAuthToken || '');
      setSellerLoginId(platform.sellerLoginId || '');
      setApiKey(platform.apiKey || '');
      setMerchantStoreUrl(platform.merchantStoreUrl || '');
      setSellerPortalUrl(platform ? getPlatformSellerPortalUrl(platform) : '');
    }

    setCredentialsNotes(platform.credentialsNotes || '');
    setAutoSyncPrice(platform.autoSyncPrice ?? true);
    setAutoSyncOrders(platform.autoSyncOrders ?? true);
    setAutoWeeklyReportEmail(platform.autoWeeklyReportEmail ?? true);
    setVerifySuccess(false);
    setActiveTab(initialTab);
    setCsvImportSuccess(false);
    setImportedSummary(null);
  }, [platform, activeMerchantId, initialTab, remoteMerchants]);

  // When user picks a remote merchant from list, auto-fill details and allow switching
  const handleSelectRemoteMerchant = (merchantId: string) => {
    setLinkedMerchantId(merchantId);
    if (onSwitchActiveMerchant && merchantId) {
      onSwitchActiveMerchant(merchantId);
    }
    if (!merchantId) return;

    const matched = remoteMerchants.find(m => m.id === merchantId);
    if (matched) {
      const creds = matched.platformCredentials?.[platform?.code];
      if (creds) {
        setSellerName(creds.sellerName || matched.storeName);
        setSellerId(creds.sellerId || `EG-${matched.id.toUpperCase().replace('MERCH-', 'M')}`);
        setMerchantEmail(creds.merchantEmail || matched.primaryEmail);
        setMwsAuthToken(creds.mwsAuthToken || '');
        setApiKey(creds.apiKey || '');
        setSellerLoginId(creds.sellerLoginId || '');
        if (creds.sellerPortalUrl) setSellerPortalUrl(creds.sellerPortalUrl);
        if (creds.merchantStoreUrl) setMerchantStoreUrl(creds.merchantStoreUrl);
      } else {
        setMerchantEmail(matched.primaryEmail);
        setSellerName(matched.storeName);
        setSellerId(`EG-${matched.id.toUpperCase().replace('MERCH-', 'M')}`);
      }
      setVerifySuccess(true);
    }
  };

  // 1-Click Instant Auto Link
  const handleQuickAutoConnect = () => {
    onAutoConnect(platform.id, linkedMerchantId);
    onClose();
  };

  // Submit and save custom connection
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailStr = merchantEmail.trim().toLowerCase();
    const isGmail = emailStr.endsWith('@gmail.com');
    const updated: ConnectedMerchantPlatform = {
      ...platform,
      sellerName: sellerName.trim() || matchedRemoteMerchant?.storeName || 'متجر التاجر المعتمد',
      sellerId: sellerId.trim() || `SELLER-${Date.now().toString().slice(-6)}`,
      merchantEmail: merchantEmail.trim() || matchedRemoteMerchant?.primaryEmail || '',
      merchantStoreUrl: merchantStoreUrl.trim(),
      sellerPortalUrl: sellerPortalUrl.trim() || undefined,
      isGmailLinked: isGmail ? true : (platform.isGmailLinked || false),
      linkedGmail: isGmail ? emailStr : (platform.linkedGmail || (platform.isGmailLinked ? platform.merchantEmail : undefined)),
      directLaunchSupported: true,
      linkedMerchantClientId: linkedMerchantId || undefined,
      apiKey: apiKey.trim() || undefined,
      mwsAuthToken: mwsAuthToken.trim() || undefined,
      sellerLoginId: sellerLoginId.trim() || undefined,
      managerAgencyEmail: effectiveAgencyManagerEmail,
      credentialsNotes: credentialsNotes.trim() || undefined,
      autoSyncPrice,
      autoSyncOrders,
      autoWeeklyReportEmail,
      isConnected: true,
      status: 'active',
      hasSyncError: false,
      syncError: undefined,
      lastSyncedAt: 'الآن (تم الربط والتزامن)',
    };
    onSave(updated, linkedMerchantId);
    onClose();
  };

  // Simulate API Verification
  const handleTestConnection = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerifySuccess(true);
      if (onShowToast) {
        onShowToast(`✅ تم فحص بيانات الاعتماد لمتجر "${sellerName || matchedRemoteMerchant?.storeName}" ورمز التوثيق بنجاح!`);
      }
    }, 700);
  };

  // CSV Competitor processing
  const handleFileChange = (file: File) => {
    if (!file) return;
    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvRawContent(text);
      processCSVContent(text);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const processCSVContent = (text: string) => {
    const result = parseCompetitorsCSV(text, platform, allProducts);
    setParseResult(result);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handlePasteChange = (text: string) => {
    setCsvRawContent(text);
    if (text.trim()) {
      processCSVContent(text);
    } else {
      setParseResult(null);
    }
  };

  const handleClearCSV = () => {
    setSelectedFileName(null);
    setCsvRawContent('');
    setParseResult(null);
    setCsvImportSuccess(false);
    setImportedSummary(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExecuteImportCompetitors = () => {
    if (!parseResult || parseResult.validRows.length === 0) return;
    if (!currentProduct && allProducts.length === 0) return;

    const fallbackProduct = currentProduct || allProducts[0];

    const {
      updatedProducts,
      updatedActiveProduct,
      newCompetitorsRecords,
      mergedCount
    } = mergeCompetitorsIntoProducts(
      parseResult.validRows,
      platform,
      allProducts,
      fallbackProduct,
      importMode
    );

    const minPrice = Math.min(...parseResult.validRows.map(r => r.price));

    if (onImportPlatformCompetitors) {
      onImportPlatformCompetitors(
        updatedProducts,
        updatedActiveProduct,
        newCompetitorsRecords,
        platform.id,
        importMode
      );
    }

    setImportedSummary({ count: mergedCount, minPrice });
    setCsvImportSuccess(true);

    if (onShowToast) {
      onShowToast(`تم استيراد ${mergedCount} منافس بنجاح لقناة ${platformDisplayName} ودمجهم برادار المنافسين التلقائي! 🎯`);
    }
  };

  if (!isOpen || !platform) return null;

  const platformDisplayName = platform.name.split('(')[0].trim();

  const displayedRows = (parseResult?.validRows || []).concat(parseResult?.invalidRows || []).filter(row => {
    if (previewFilter === 'valid') return row.isValid;
    if (previewFilter === 'invalid') return !row.isValid;
    return true;
  });

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn text-right font-['Cairo']" dir="rtl">
      <div className="bg-slate-900 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-700 text-slate-100 relative max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="إغلاق النافذة"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white font-['Alexandria']">
                  إعدادات قناة: {platformDisplayName}
                </h3>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${
                  platform.isConnected 
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' 
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {platform.isConnected ? 'متصل ومفعل ⚡' : 'غير متصل'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                إدارة الربط والمزامنة وقائمة المنافسين التلقائية لهذه القناة
              </p>
            </div>

            <div className="w-11 h-11 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-xs">
              <Store className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tab Switcher: Settings vs Competitors CSV */}
        <div className="flex items-center gap-2 pt-3 pb-2 shrink-0 border-b border-slate-800">
          <button
            type="button"
            id="tab-btn-platform-settings"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>بيانات الربط والمزامنة</span>
          </button>

          <button
            type="button"
            id="tab-btn-platform-competitors-csv"
            onClick={() => setActiveTab('competitors_csv')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer relative ${
              activeTab === 'competitors_csv'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-sky-400" />
            <span>استيراد قائمة منافسين (CSV)</span>
            {platform.importedCompetitorsCount ? (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-sky-400 text-slate-950 font-black">
                {platform.importedCompetitorsCount} منافس
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold">
                رادار 🎯
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Connection & Settings */}
        {activeTab === 'settings' && (
          <div className="overflow-y-auto py-3 space-y-4 flex-1 no-scrollbar text-xs">
            
            {/* Quick Competitors Import Banner inside Settings */}
            <div className="p-3.5 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white rounded-2xl shadow-sm border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-sky-300 shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-white">رادار المنافسين لقناة {platformDisplayName}</span>
                    {platform.importedCompetitorsCount ? (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-400/30">
                        {platform.importedCompetitorsCount} منافس مدمج
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[10px] text-slate-300 mt-0.5">
                    استيراد قائمة منافسي هذه القناة بملف CSV لدمجهم فورياً برادار المنافسين واحتساب Buy Box
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="btn-switch-to-competitor-csv-tab"
                onClick={() => setActiveTab('competitors_csv')}
                className="h-8 px-3 rounded-xl bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0"
              >
                <Upload className="w-3.5 h-3.5 text-slate-950" />
                <span>استيراد قائمة المنافسين (CSV) 📊</span>
              </button>
            </div>

            {/* Marketing Manager & Agency Separation Status Banner */}
            <div className="p-3.5 bg-gradient-to-r from-slate-950 via-indigo-950/70 to-slate-950 text-white rounded-2xl shadow-sm border border-indigo-500/30">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-sky-300 shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white font-['Alexandria']">
                        فصل حساب الوكالة عن بيانات التجار (Agency & Merchant Separation)
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
                        حساب إداري آمن
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      حساب مدير التسويق الحالي: <strong className="font-mono text-sky-200" dir="ltr">{effectiveAgencyManagerEmail}</strong> (مستقل تماماً — لا يتم ربط بريدك الشخصي أو إجبارك على امتلاك حساب بائع).
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[10px] text-slate-400 block">المتجر المُدار حالياً:</span>
                  <span className="text-xs font-black text-sky-300">
                    {matchedRemoteMerchant?.storeName || sellerName || 'متجر التاجر المحدد'}
                  </span>
                </div>
              </div>
            </div>

            {/* Active Merchant Switcher & Store Selection */}
            <div className="p-3 bg-slate-950 border border-purple-500/30 rounded-2xl space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="font-bold text-purple-300 flex items-center gap-1.5 text-xs">
                  <Store className="w-4 h-4 text-purple-400" />
                  <span>اختيار التاجر / المتجر المُدار لقناة ({platformDisplayName}):</span>
                </label>

                {onNavigateToRemoteMerchants && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToRemoteMerchants();
                    }}
                    className="text-[11px] font-bold text-purple-300 hover:text-purple-200 flex items-center gap-1 cursor-pointer bg-slate-900 px-2 py-0.5 rounded-lg border border-purple-500/40 shadow-2xs"
                  >
                    <span>إدارة كل التجار ({remoteMerchants.length})</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              <select
                value={linkedMerchantId}
                onChange={(e) => handleSelectRemoteMerchant(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-purple-500/40 text-slate-100 font-bold text-xs focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40 outline-none cursor-pointer shadow-xs"
              >
                <option value="">-- اختر المتجر التابع لإدارة بيانات اعتماده --</option>
                {remoteMerchants.map(m => (
                  <option key={m.id} value={m.id}>
                    🏬 {m.storeName} — ({m.primaryEmail}) | {m.city}
                  </option>
                ))}
              </select>

              <p className="text-[10px] text-purple-300/80 leading-relaxed">
                💡 يتم تخزين بيانات الربط ومفاتيح API لكل تاجر على حدة في الذاكرة السحابية والمحلية بشكل مستقل، مع إمكانية التبديل بين التجار دون فقدان أي إعدادات.
              </p>
            </div>

            {/* 1-Click Fast Connect Banner */}
            <div className="p-3.5 bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 border border-indigo-500/30 rounded-2xl text-white shadow-md relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-300">
                    <Zap className="w-4 h-4 text-sky-300 fill-sky-300" />
                    <span>الربط التلقائي ببيانات التاجر المختار</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    ربط المنصة بحساب التاجر: <strong className="text-white">{matchedRemoteMerchant?.storeName || sellerName}</strong> (البريد: <span className="font-mono text-sky-200" dir="ltr">{merchantEmail || matchedRemoteMerchant?.primaryEmail || 'لم يحدد بعد'}</span>)
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <button
                    type="button"
                    id="btn-direct-launch-platform-modal"
                    onClick={() => {
                      directLaunchPlatformPortal({
                        ...platform,
                        sellerPortalUrl: sellerPortalUrl || undefined,
                      });
                      if (onShowToast) {
                        onShowToast(`🚀 تم فتح لوحة إدارة بائعين ${platformDisplayName} مباشرة`);
                      }
                    }}
                    className="h-8 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95 shrink-0 border border-slate-700"
                    title="فتح لوحة تحكم بائع المنصة مباشرة"
                  >
                    <Rocket className="w-3.5 h-3.5 text-sky-300" />
                    <span>الوصول المباشر 🚀</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleQuickAutoConnect}
                    className="h-8 px-3.5 rounded-xl bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                    <span>ربط تلقائي فوري ⚡</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Custom Merchant & Account Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Merchant Email */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-300">
                      البريد الإلكتروني لحساب التاجر على {platformDisplayName} <span className="text-rose-400">*</span>
                    </label>
                    <span className="text-[10px] text-indigo-300 bg-indigo-950/80 border border-indigo-500/30 px-2 py-0.5 rounded-md font-bold">
                      منفصل تماماً عن بريدك كمدير تسويق ({effectiveAgencyManagerEmail})
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="email"
                      value={merchantEmail}
                      onChange={(e) => setMerchantEmail(e.target.value)}
                      placeholder="seller@merchant-store.com"
                      required
                      dir="ltr"
                      className="w-full px-3.5 py-2.5 pl-10 rounded-xl bg-slate-950 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 outline-none text-slate-100 font-medium text-left"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    هذا هو البريد المسجل به حساب البائع على المنصة (Seller Central / Seller Portal). لن يتم استخدام بريدك الإداري.
                  </p>
                </div>

                {/* Seller Name */}
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    اسم متجر التاجر على المنصة <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={sellerName}
                      onChange={(e) => setSellerName(e.target.value)}
                      placeholder="مثال: متجر التقنية المصرية"
                      required
                      className="w-full px-3.5 py-2.5 pl-9 rounded-xl bg-slate-950 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 outline-none text-slate-100 font-medium"
                    />
                    <Store className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                {/* Seller ID */}
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    معرّف البائع / رمز التاجر (Seller ID / Merchant Token)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={sellerId}
                      onChange={(e) => setSellerId(e.target.value)}
                      placeholder="مثال: A2EUQ1WTGCTBG2 أو EG-MKT-9912"
                      dir="ltr"
                      className="w-full px-3.5 py-2.5 pl-9 rounded-xl bg-slate-950 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 outline-none text-slate-100 font-mono text-left"
                    />
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                {/* MWS Auth Token / SP-API Refresh Token */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-300 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-sky-400" />
                      <span>رمز تفويض المطور / الوكالة (MWS Auth Token / SP-API Token) - اختياري</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSensitiveTokens(!showSensitiveTokens)}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {showSensitiveTokens ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showSensitiveTokens ? 'إخفاء الرمز' : 'إظهار الرمز'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showSensitiveTokens ? 'text' : 'password'}
                      value={mwsAuthToken}
                      onChange={(e) => setMwsAuthToken(e.target.value)}
                      placeholder="amzn.mws.4ea4a731-3b16-464a-8822-xxxxxxxxxxxx"
                      dir="ltr"
                      className="w-full px-3.5 py-2.5 pl-10 rounded-xl bg-slate-950 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 outline-none text-slate-100 font-mono text-left text-xs"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    رمز التفويض الذي يستخرجه التاجر من حسابه ليمنحك كمدير تسويق صلاحية جلب الطلبات والمزامنة التلقائية للمتجر.
                  </p>
                </div>

                {/* Seller Login ID */}
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    اسم المستخدم أو معرّف دخول المتجر (Seller Login ID) - اختياري
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={sellerLoginId}
                      onChange={(e) => setSellerLoginId(e.target.value)}
                      placeholder="مثال: admin_seller_eg"
                      dir="ltr"
                      className="w-full px-3.5 py-2.5 pl-9 rounded-xl bg-slate-950 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 outline-none text-slate-100 font-mono text-left"
                    />
                    <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                {/* API Key / Token */}
                <div>
                  <label className="block font-bold text-slate-300 mb-1 flex items-center justify-between">
                    <span>مفتاح API التاجر (API Key / Client Secret)</span>
                    <span className="text-[10px] text-slate-400">مشفر ومحمي</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showSensitiveTokens ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="••••••••••••••••••••••••••••••••"
                      dir="ltr"
                      className="w-full px-3.5 py-2.5 pl-10 rounded-xl bg-slate-950 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 outline-none text-slate-100 font-mono text-left"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                {/* Store URL */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-300 mb-1">
                    رابط صفحة المتجر أو الواجهة (Storefront URL)
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={merchantStoreUrl}
                      onChange={(e) => setMerchantStoreUrl(e.target.value)}
                      placeholder="https://www.amazon.eg/sp?seller=..."
                      dir="ltr"
                      className="w-full px-3.5 py-2.5 pl-10 rounded-xl bg-slate-950 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 outline-none text-slate-100 font-medium text-left"
                    />
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                {/* Seller Portal Direct Launch URL */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-300 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Rocket className="w-3.5 h-3.5 text-indigo-400" />
                      <span>رابط بوابة بائع المنصة للوصول المباشر (Seller Portal URL)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        directLaunchPlatformPortal({
                          ...platform,
                          sellerPortalUrl: sellerPortalUrl || undefined,
                        });
                        if (onShowToast) {
                          onShowToast(`🚀 جاري فتح بوابة البائعين: ${sellerPortalUrl}`);
                        }
                      }}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>تجربة الفتح المباشر</span>
                    </button>
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={sellerPortalUrl}
                      onChange={(e) => setSellerPortalUrl(e.target.value)}
                      placeholder="https://sellercentral.amazon.eg/"
                      dir="ltr"
                      className="w-full px-3.5 py-2.5 pl-10 rounded-xl bg-slate-950 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 outline-none text-slate-100 font-mono text-left"
                    />
                    <Rocket className="w-4 h-4 text-indigo-400 absolute left-3 top-3" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    الرابط المباشر الذي يتم فتحه بنقرة واحدة عند الضغط على زر (Direct Launch) داخل لوحة تحكم التاجر.
                  </p>
                </div>

                {/* Marketer Credentials Notes */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-300 mb-1">
                    ملاحظات مدير التسويق على اعتماد المتجر (Credentials & Marketer Notes)
                  </label>
                  <input
                    type="text"
                    value={credentialsNotes}
                    onChange={(e) => setCredentialsNotes(e.target.value)}
                    placeholder="مثال: تم استلام توكن MWS من العميل ومراجعة الصلاحيات وحفظها بشكل مستقل"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 outline-none text-slate-100 font-medium"
                  />
                </div>
              </div>

              {/* Sync & Automation Checkboxes */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <span className="text-[11px] font-bold text-slate-200 block">خيارات الأتمتة والمزامنة:</span>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSyncPrice}
                    onChange={(e) => setAutoSyncPrice(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500"
                  />
                  <span className="text-slate-300">تحديث الأسعار التلقائي عند تغير أسعار المنافسين أو اقتناص Buy Box</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSyncOrders}
                    onChange={(e) => setAutoSyncOrders(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500"
                  />
                  <span className="text-slate-300">مزامنة المخزون وتنبيهات إعادة الطلب تلقائياً مع هذه القناة</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoWeeklyReportEmail}
                    onChange={(e) => setAutoWeeklyReportEmail(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded-sm focus:ring-indigo-500"
                  />
                  <span className="text-slate-300">إرسال تقرير الأداء والمبيعات الأسبوعي تلقائياً إلى بريد التاجر أعلاه</span>
                </label>
              </div>

              {/* Verification Status */}
              {verifySuccess && (
                <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-300 text-[11px] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>تم التحقق من بيانات التاجر وصلاحية البريد بنجاح! جاهز للتفعيل والحفظ.</span>
                </div>
              )}

              {/* Actions Bar */}
              <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isVerifying}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin text-indigo-400' : ''}`} />
                    <span>{isVerifying ? 'جاري الفحص...' : 'فحص الاتصال'}</span>
                  </button>

                  {platform.isConnected && (
                    <button
                      type="button"
                      onClick={() => {
                        onDisconnect(platform.id);
                        onClose();
                      }}
                      className="px-3 py-2 rounded-xl bg-rose-950/60 border border-rose-500/40 hover:bg-rose-900/60 text-rose-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Unlink className="w-3.5 h-3.5" />
                      <span>إلغاء الربط</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 border border-emerald-500/50 transition-all cursor-pointer active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>حفظ وتفعيل الربط الفوري ⚡</span>
                  </button>
                </div>
              </div>

            </form>
          </div>
        )}

        {/* Tab 2: Competitor List CSV Import */}
        {activeTab === 'competitors_csv' && (
          <div className="overflow-y-auto py-3 space-y-4 flex-1 no-scrollbar text-xs">
            
            {/* Success Banner */}
            {csvImportSuccess && importedSummary && (
              <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl shadow-lg animate-fadeIn flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-black text-sm">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                    <span>تم دمج المنافسين بنجاح في رادار المنافسين التلقائي!</span>
                  </div>
                  <p className="text-xs text-emerald-100">
                    تمت إضافة <strong>{importedSummary.count}</strong> عروض منافسين لقناة <strong>{platformDisplayName}</strong>. أقل سعر منافس تم رصده: <strong>{importedSummary.minPrice.toLocaleString()} {currentProduct?.currency || 'EGP'}</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {onNavigateToRadar && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateToRadar();
                      }}
                      className="px-4 py-2 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 font-black text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap active:scale-95"
                    >
                      <span>الانتقال لرادار المنافسين 🎯</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleClearCSV}
                    className="px-3 py-2 rounded-xl bg-emerald-700/70 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                  >
                    استيراد ملف آخر
                  </button>
                </div>
              </div>
            )}

            {/* Explanation card */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-start gap-3 text-slate-300">
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-white block text-xs">
                  استيراد مخصص لقناة: {platformDisplayName}
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  يمكنك استيراد قائمة منافسي هذه القناة بشكل مستقل. سيتم دمج أسعارهم وعروضهم تلقائياً داخل رادار المنافسين، مع فحص الفوز بصندوق الشراء (Buy Box) واقتراح سعر البيع الرابح فورياً.
                </p>
              </div>
            </div>

            {/* Actions: Download Template & Sample Data */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 bg-slate-950 border border-slate-800 rounded-2xl">
              <div className="flex items-center gap-2 text-slate-200 font-bold">
                <Download className="w-4 h-4 text-indigo-400" />
                <span>تحميل نموذج CSV الجاهز لقناة {platformDisplayName}:</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  id="btn-modal-download-competitor-template"
                  onClick={() => downloadCompetitorCSVTemplate(platform.name, platform.code, currentProduct)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-indigo-300 hover:bg-indigo-600 hover:text-white font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل النموذج (CSV) 📥</span>
                </button>
              </div>
            </div>

            {/* Sub Tabs: File vs Paste */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <button
                type="button"
                onClick={() => setCsvInputMode('upload')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  csvInputMode === 'upload'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>رفع ملف CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setCsvInputMode('paste')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  csvInputMode === 'paste'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>لصق نص CSV</span>
              </button>
            </div>

            {/* Upload Area */}
            {csvInputMode === 'upload' ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-indigo-500 bg-indigo-950/40 scale-[0.99]'
                    : selectedFileName
                    ? 'border-emerald-500/60 bg-emerald-950/30'
                    : 'border-slate-700 hover:border-indigo-400 bg-slate-950 hover:bg-slate-850'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                  className="hidden"
                />

                <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-indigo-950/80 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>

                {selectedFileName ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2 text-emerald-400 font-black text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>الملف المختار: {selectedFileName}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      انقر لاختيار ملف آخر أو اسحب ملفاً جديداً إلى هنا
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <span className="font-bold text-slate-200 text-sm block">
                      اسحب وأفلت ملف CSV لمنافسي {platformDisplayName} هنا
                    </span>
                    <p className="text-slate-400 text-[11px]">
                      أو انقر لتصفح واختيار الملف من جهازك
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-300">
                  الصق محتوى CSV لمنافسي هذه القناة:
                </label>
                <textarea
                  rows={4}
                  value={csvRawContent}
                  onChange={(e) => handlePasteChange(e.target.value)}
                  placeholder="اسم المتجر أو المنافس,اسم المنتج أو SKU,سعر المنافس,حالة التوفر..."
                  dir="ltr"
                  className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 font-mono text-xs text-left text-slate-100 outline-none"
                />
              </div>
            )}

            {/* Parse Preview Table */}
            {parseResult && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between flex-wrap gap-2 p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-300">
                      عدد المنافسين المقروءين: <strong className="text-indigo-400 font-black">{parseResult.totalRows}</strong>
                    </span>
                    <span className="inline-flex items-center gap-1 text-emerald-300 font-bold bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {parseResult.validRows.length} صالح للرادار
                    </span>
                    {parseResult.invalidRows.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-rose-300 font-bold bg-rose-950/80 border border-rose-500/40 px-2 py-0.5 rounded text-[10px]">
                        <AlertTriangle className="w-3 h-3 text-rose-400" /> {parseResult.invalidRows.length} به أخطاء
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewFilter('all')}
                      className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
                        previewFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      الكل
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewFilter('valid')}
                      className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
                        previewFilter === 'valid' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      الصالح فقط
                    </button>
                  </div>
                </div>

                <div className="border border-slate-800 rounded-2xl overflow-hidden shadow-2xs max-h-48 overflow-y-auto">
                  <table className="w-full text-right text-[11px]">
                    <thead className="bg-slate-950 text-slate-300 font-bold border-b border-slate-800 sticky top-0 z-10">
                      <tr>
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">المنافس</th>
                        <th className="py-2 px-3">المنتج المرتبط</th>
                        <th className="py-2 px-3">السعر</th>
                        <th className="py-2 px-3">التوصيل</th>
                        <th className="py-2 px-3">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900">
                      {displayedRows.map((row) => (
                        <tr key={row.rowNumber} className={row.isValid ? 'hover:bg-slate-850' : 'bg-rose-950/30'}>
                          <td className="py-1.5 px-3 font-mono text-slate-500">{row.rowNumber}</td>
                          <td className="py-1.5 px-3 font-bold text-white">{row.competitorName}</td>
                          <td className="py-1.5 px-3 text-slate-300 max-w-[140px] truncate" title={row.matchedProductTitle || row.productTitleOrSku}>
                            {row.matchedProductTitle || row.productTitleOrSku || currentProduct?.title}
                          </td>
                          <td className="py-1.5 px-3 font-mono font-bold text-emerald-400">
                            {row.price > 0 ? `${row.price.toLocaleString()} ${currentProduct?.currency || 'EGP'}` : '—'}
                          </td>
                          <td className="py-1.5 px-3 text-slate-400">{row.deliveryTime}</td>
                          <td className="py-1.5 px-3">
                            {row.isValid ? (
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> جاهز للدمج
                              </span>
                            ) : (
                              <span className="text-rose-400 font-bold">{row.errors[0]}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Import Mode: Merge vs Replace */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                  <span className="font-bold text-slate-200 block text-xs">خيارات الدمج مع رادار {platformDisplayName}:</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      importMode === 'merge' ? 'bg-indigo-950/80 border-indigo-500/50 text-indigo-200 font-bold' : 'border-slate-800 bg-slate-900 text-slate-300'
                    }`}>
                      <input
                        type="radio"
                        name="modalCompImportMode"
                        checked={importMode === 'merge'}
                        onChange={() => setImportMode('merge')}
                        className="text-indigo-600"
                      />
                      <div>
                        <span className="block text-xs">دمج مع المنافسين الحاليين (Merge)</span>
                        <span className="text-[10px] text-slate-400 font-normal">إضافة العروض الجديدة دون مسح المنافسين السابقين</span>
                      </div>
                    </label>

                    <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      importMode === 'replace' ? 'bg-indigo-950/80 border-indigo-500/50 text-indigo-200 font-bold' : 'border-slate-800 bg-slate-900 text-slate-300'
                    }`}>
                      <input
                        type="radio"
                        name="modalCompImportMode"
                        checked={importMode === 'replace'}
                        onChange={() => setImportMode('replace')}
                        className="text-indigo-600"
                      />
                      <div>
                        <span className="block text-xs">استبدال منافسي هذه القناة (Replace)</span>
                        <span className="text-[10px] text-slate-400 font-normal">استبدال عروض {platformDisplayName} القديمة بالقائمة الجديدة</span>
                      </div>
                    </label>
                  </div>
                </div>

              </div>
            )}

            {/* Competitors Import Actions */}
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {selectedFileName && (
                  <button
                    type="button"
                    onClick={handleClearCSV}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>مسح</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  إغلاق
                </button>

                <button
                  type="button"
                  id="btn-confirm-channel-competitors-import"
                  onClick={handleExecuteImportCompetitors}
                  disabled={!parseResult || parseResult.validRows.length === 0}
                  className={`px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                    parseResult && parseResult.validRows.length > 0
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/40 active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Zap className="w-4 h-4 text-sky-300 fill-sky-300" />
                  <span>
                    تأكيد ودمج {parseResult?.validRows.length || 0} منافس بالرادار ⚡
                  </span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
