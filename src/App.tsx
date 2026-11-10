import React, { useState, useEffect, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Zap, Sparkles, Mail, Key, Globe, Users, RefreshCw, Monitor, Smartphone, ShieldCheck, Package, Bell, TrendingUp, ShoppingBag, Building2, Search, Filter, ChevronDown, Truck, Camera, FileText, ArrowRight, Shield, HelpCircle, BookOpen, Crown, Clock, Activity, AlertTriangle, Download, FileSpreadsheet, X, Maximize2, Minimize2, Store, Layers, BarChart3, DollarSign, Printer, Compass, Palette, Menu, Scissors, ArrowUpDown } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { useLanguage } from './context/LanguageContext';
import { useSubscription } from './hooks/useSubscription';
import { supabase } from './lib/supabase';
import { useVisualCustomizer } from './context/VisualCustomizerContext';
import { ThemeToggle } from './components/ThemeToggle';
import { LanguageToggle } from './components/LanguageToggle';
import { OfflineNoticeBanner } from './components/OfflineNoticeBanner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TabSkeletonLoader } from './components/TabSkeletonLoader';
import { AIStudioSkeletonLoader } from './components/AIStudioSkeletonLoader';

export const OWNER_EMAIL = 'jassmeinnour@gmail.com';

function extractComponent(module: any): React.ComponentType<any> {
  if (!module) return (() => null) as any;
  if (typeof module === 'function') return module;
  if (module.default) {
    if (typeof module.default === 'function') return module.default;
    return extractComponent(module.default);
  }
  const keys = Object.keys(module);
  for (const k of keys) {
    if (typeof module[k] === 'function') return module[k];
  }
  return module;
}

function safeLazy<T extends React.ComponentType<any>>(
  factory: () => Promise<any>
) {
  return React.lazy(async () => {
    try {
      const module = await factory();
      return { default: extractComponent(module) };
    } catch (error) {
      console.warn('[SafeLazy] Dynamic module import failed, retrying...', error);
      return { default: () => <div className="p-6 text-center text-slate-300">جاري تحميل الوحدة...</div> };
    }
  });
}

// Minimal lazy loads to restore build
const TradersPage = safeLazy(() => import('./components/TradersPage'));
const OwnerDashboard = safeLazy(() => import('./components/OwnerDashboard'));

export type WorkspaceTab = 
  | 'traders'
  | 'products'
  | 'inventory'
  | 'merchants' 
  | 'radar' 
  | 'watchlist'
  | 'ai_studio' 
  | 'shipping' 
  | 'trending' 
  | 'reports' 
  | 'auto_pricing' 
  | 'price_comparison' 
  | 'platforms_guide' 
  | 'traders_sync'
  | 'split_invoices'
  | 'help'
  | 'analytics'
  | 'layout_settings';

export default function App() {
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState('traders');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showOwnerDashboard, setShowOwnerDashboard] = useState(false);
  
  return (
    <div dir="rtl" className="w-full min-h-screen bg-slate-950 text-slate-100 pb-20 relative">
      <OfflineNoticeBanner />
      <main className="w-full p-6">
        <Suspense fallback={<TabSkeletonLoader />}>
          {activeWorkspaceTab === 'traders' && <TradersPage />}
        </Suspense>
      </main>
    </div>
  );
}
