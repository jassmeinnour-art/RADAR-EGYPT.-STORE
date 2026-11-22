import React, { useState, useMemo, useCallback } from 'react';
import {
  BarChart3,
  ChevronDown,
  X,
  Users,
  Zap,
  Globe,
  Truck,
  FileSpreadsheet,
  Crown,
  Layers,
  Settings,
  Compass,
  Bell,
  Scissors,
  Package,
  Menu,
  Mail,
  Link2,
  Bookmark,
  History,
  Camera,
  Moon,
  Sun,
  Smartphone,
  Download,
  ExternalLink,
  Clock,
  Wand2,
  GripVertical,
  RotateCcw,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import confetti from 'canvas-confetti';
import { WorkspaceTab } from '../App';
import { FounderModeWrapper } from './FounderModeWrapper';
import { useTheme } from '../context/ThemeContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useAuth } from '../context/AuthContext';

export const SIDEBAR_CATEGORY_ORDER_STORAGE_KEY = 'radar_sidebar_category_order_v1';
export const SIDEBAR_ITEM_ORDER_STORAGE_KEY = 'radar_sidebar_item_order_v1';

export function applyStoredOrder<T extends { id: string }>(
  items: T[],
  storedIds?: string[] | null
): T[] {
  if (!Array.isArray(storedIds) || storedIds.length === 0) return items;
  const itemMap = new Map(items.map((item) => [item.id, item]));
  const ordered: T[] = [];
  const seen = new Set<string>();

  for (const id of storedIds) {
    const match = itemMap.get(id);
    if (match && !seen.has(id)) {
      ordered.push(match);
      seen.add(id);
    }
  }

  for (const item of items) {
    if (!seen.has(item.id)) {
      ordered.push(item);
      seen.add(item.id);
    }
  }

  return ordered;
}

function readStoredCategoryOrder(): string[] {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SIDEBAR_CATEGORY_ORDER_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function readStoredItemOrders(): Record<string, string[]> {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(SIDEBAR_ITEM_ORDER_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const sanitized: Record<string, string[]> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (Array.isArray(v)) {
        sanitized[k] = v.filter((id): id is string => typeof id === 'string');
      }
    }
    return sanitized;
  } catch {
    return {};
  }
}

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  activeTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  onOpenOwnerDashboard: () => void;
  onOpenScanner?: () => void;
  onOpenAmazonImport?: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
  onShowToast?: (message: string) => void;
  onPrefetchTab?: (tab: WorkspaceTab) => void;
  isOwner: boolean;
  trialDaysRemaining?: number;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  preloadTab?: WorkspaceTab;
  action: () => void;
  isActive?: boolean;
  badge?: string;
}

interface NavCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: NavItem[];
}

interface SortableSidebarItemRowProps {
  item: NavItem;
  isCollapsed: boolean;
  onItemClick: (action: () => void) => void;
  onPrefetchTab?: (tab: WorkspaceTab) => void;
}

const SortableSidebarItemRow: React.FC<SortableSidebarItemRowProps> = ({
  item,
  isCollapsed,
  onItemClick,
  onPrefetchTab,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 40 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testid={`sidebar-item-row-${item.id}`}
      className={`group/item flex items-center gap-0.5 rounded-lg transition-shadow ${
        isDragging ? 'bg-[var(--sidebar-hover-bg)] ring-1 ring-amber-400/70 shadow-lg opacity-90' : ''
      }`}
    >
      {!isCollapsed && (
        <button
          type="button"
          {...attributes}
          {...listeners}
          data-testid={`drag-handle-item-${item.id}`}
          aria-label={`مقبض إعادة ترتيب العنصر (${item.id})`}
          title="اسحب لإعادة الترتيب"
          className="p-1 rounded text-[var(--sidebar-text-muted)] hover:text-amber-400 hover:bg-[var(--sidebar-hover-bg)] cursor-grab active:cursor-grabbing shrink-0 opacity-60 group-hover/item:opacity-100 focus:opacity-100 transition-opacity touch-none"
        >
          <GripVertical className="w-3.5 h-3.5 shrink-0" />
        </button>
      )}
      <button
        type="button"
        onClick={() => onItemClick(item.action)}
        onMouseEnter={() => {
          if (item.preloadTab) onPrefetchTab?.(item.preloadTab);
        }}
        onTouchStart={() => {
          if (item.preloadTab) onPrefetchTab?.(item.preloadTab);
        }}
        onFocus={() => {
          if (item.preloadTab) onPrefetchTab?.(item.preloadTab);
        }}
        title={isCollapsed ? item.label : undefined}
        className={`flex-1 min-w-0 min-h-[38px] text-right px-2 py-1.5 rounded-lg font-bold text-xs transition-colors flex items-center justify-between cursor-pointer whitespace-nowrap ${
          item.isActive
            ? 'bg-amber-500 text-slate-950 font-black'
            : 'text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover-bg)]'
        }`}
      >
        <span className="flex items-center gap-2 min-w-0">
          <span
            className={`shrink-0 ${
              item.isActive ? 'text-slate-950' : 'text-amber-500 dark:text-amber-300'
            }`}
          >
            {item.icon}
          </span>
          {!isCollapsed && <span className="truncate">{item.label}</span>}
        </span>
        {!isCollapsed && item.badge && (
          <span
            className={`shrink-0 text-[10px] font-black px-1.5 py-0.5 rounded-md ${
              item.isActive
                ? 'bg-slate-950 text-amber-400'
                : 'bg-[var(--badge-bg)] text-[var(--badge-text)] border border-[var(--badge-border)]'
            }`}
          >
            {item.badge}
          </span>
        )}
      </button>
    </div>
  );
};

interface SortableSidebarCategoryCardProps {
  category: NavCategory;
  isCollapsed: boolean;
  isCategoryOpen: boolean;
  onToggleCategory: (categoryId: string) => void;
  onItemClick: (action: () => void) => void;
  onPrefetchTab?: (tab: WorkspaceTab) => void;
  sensors: ReturnType<typeof useSensors>;
  onItemDragEnd: (categoryId: string, currentItems: NavItem[], event: DragEndEvent) => void;
}

const SortableSidebarCategoryCard: React.FC<SortableSidebarCategoryCardProps> = ({
  category,
  isCollapsed,
  isCategoryOpen,
  onToggleCategory,
  onItemClick,
  onPrefetchTab,
  sensors,
  onItemDragEnd,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testid={`sidebar-category-card-${category.id}`}
      className={`rounded-xl border border-[var(--sidebar-border)] overflow-hidden bg-[var(--sidebar-surface)] transition-shadow ${
        isDragging ? 'ring-2 ring-amber-400/80 shadow-2xl opacity-95' : ''
      }`}
    >
      <div className="flex items-center bg-[var(--sidebar-bg)] border-b border-[var(--sidebar-border)]">
        {!isCollapsed && (
          <button
            type="button"
            {...attributes}
            {...listeners}
            data-testid={`drag-handle-category-${category.id}`}
            aria-label={`مقبض إعادة ترتيب القسم (${category.id})`}
            title="اسحب لإعادة ترتيب القسم"
            className="px-1.5 py-2 text-[var(--sidebar-text-muted)] hover:text-amber-400 hover:bg-[var(--sidebar-hover-bg)] cursor-grab active:cursor-grabbing shrink-0 transition-colors touch-none"
          >
            <GripVertical className="w-3.5 h-3.5 shrink-0" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onToggleCategory(category.id)}
          className="flex-1 min-w-0 px-2 py-2 text-[var(--sidebar-text)] font-black text-xs flex items-center justify-between transition-colors cursor-pointer text-right hover:bg-[var(--sidebar-hover-bg)]"
          title={isCollapsed ? category.title : undefined}
        >
          <span className="flex items-center gap-2 min-w-0">
            <span className="shrink-0">{category.icon}</span>
            {!isCollapsed && <span className="truncate">{category.title}</span>}
          </span>
          {!isCollapsed && (
            <ChevronDown
              className={`w-3.5 h-3.5 text-[var(--sidebar-text-muted)] transition-transform duration-200 shrink-0 ${
                isCategoryOpen ? 'rotate-180' : ''
              }`}
            />
          )}
        </button>
      </div>

      {(isCategoryOpen || isCollapsed) && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event) => onItemDragEnd(category.id, category.items, event)}
        >
          <SortableContext
            items={category.items.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="p-1 space-y-0.5">
              {category.items.map((item) => (
                <SortableSidebarItemRow
                  key={item.id}
                  item={item}
                  isCollapsed={isCollapsed}
                  onItemClick={onItemClick}
                  onPrefetchTab={onPrefetchTab}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed: propIsCollapsed,
  onToggleCollapse,
  activeTab,
  onSelectTab,
  onOpenOwnerDashboard,
  onOpenScanner,
  onOpenAmazonImport,
  onOpenNotifications,
  unreadNotificationsCount = 0,
  onShowToast,
  onPrefetchTab,
  isOwner,
  trialDaysRemaining = 3,
}) => {
  const { resolvedColorMode, toggleColorMode } = useTheme();
  const { signOut } = useAuth();
  const {
    isInstallable,
    isInstalled,
    isIOS,
    isAndroid,
    isInIframe,
    install,
    openInNewWindow,
    downloadApkDirectly,
  } = usePWAInstall();

  const [showInstallGuideModal, setShowInstallGuideModal] = useState(false);

  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sidebarCollapsed');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const isCollapsed = propIsCollapsed !== undefined ? propIsCollapsed : internalCollapsed;

  const handleToggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      const next = !internalCollapsed;
      setInternalCollapsed(next);
      try {
        localStorage.setItem('sidebarCollapsed', JSON.stringify(next));
      } catch {
        // safe fallback
      }
    }
  };

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    home: true,
    inventory: true,
    sales: true,
    competition: true,
    connections: true,
    settings: true,
    app: true,
  });

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleItemClick = (action: () => void) => {
    action();
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose();
    }
  };

  const [categoryOrder, setCategoryOrder] = useState<string[]>(() => readStoredCategoryOrder());
  const [itemOrders, setItemOrders] = useState<Record<string, string[]>>(() => readStoredItemOrders());

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleInstallAppClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) {
        try {
          confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
        } catch {
          // safe fallback
        }
        onShowToast?.('تم تثبيت تطبيق RADAR على جهازك بنجاح.');
        return;
      }
    }
    setShowInstallGuideModal(true);
  };

  const categories: NavCategory[] = [
    {
      id: 'home',
      title: 'الرئيسية',
      icon: <Zap className="w-4 h-4 text-sky-400" />,
      items: [
        {
          id: 'home_tab',
          label: 'لوحة التحكم الرئيسية',
          icon: <Zap className="w-4 h-4 text-sky-400" />,
          preloadTab: 'home',
          isActive: activeTab === 'home',
          action: () => {
            onSelectTab('home');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/');
          },
        },
      ],
    },
    {
      id: 'inventory',
      title: 'المخزون',
      icon: <Package className="w-4 h-4 text-amber-300" />,
      items: [
        {
          id: 'products_tab',
          label: 'عرض المنتجات',
          icon: <Package className="w-4 h-4 text-sky-300" />,
          preloadTab: 'products',
          isActive: activeTab === 'products' || activeTab === 'merchants',
          action: () => {
            onSelectTab('products');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/products');
          },
        },
        {
          id: 'scan_product_action',
          label: 'مسح منتج جديد',
          icon: <Camera className="w-4 h-4 text-emerald-300" />,
          action: () => {
            onOpenScanner?.();
          },
        },
        {
          id: 'traders_tab',
          label: 'إدارة التجار',
          icon: <Users className="w-4 h-4 text-amber-300" />,
          preloadTab: 'traders',
          isActive: activeTab === 'traders',
          action: () => {
            onSelectTab('traders');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/traders');
          },
        },
        {
          id: 'inventory_tab',
          label: 'إدارة المخزون',
          icon: <Layers className="w-4 h-4 text-emerald-300" />,
          preloadTab: 'inventory',
          isActive: activeTab === 'inventory',
          action: () => {
            onSelectTab('inventory');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/inventory');
          },
        },
        {
          id: 'product_image_studio_tab',
          label: 'استوديو صور المنتجات',
          icon: <Wand2 className="w-4 h-4 text-amber-300" />,
          preloadTab: 'product_image_studio',
          isActive: activeTab === 'product_image_studio',
          action: () => {
            onSelectTab('product_image_studio');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/image-studio');
          },
        },
        {
          id: 'import_history_tab',
          label: 'سجل عمليات الاستيراد',
          icon: <History className="w-4 h-4 text-amber-300" />,
          preloadTab: 'import_history',
          isActive: activeTab === 'import_history',
          action: () => {
            onSelectTab('import_history');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/import-history');
          },
        },
      ],
    },
    {
      id: 'sales',
      title: 'المبيعات',
      icon: <Truck className="w-4 h-4 text-purple-300" />,
      items: [
        {
          id: 'shipping_tab',
          label: 'الفواتير',
          icon: <Truck className="w-4 h-4 text-purple-300" />,
          preloadTab: 'shipping',
          isActive: activeTab === 'shipping',
          action: () => {
            onSelectTab('shipping');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/invoices');
          },
        },
        {
          id: 'split_invoices_tab',
          label: 'مقسم البوالص',
          icon: <Scissors className="w-4 h-4 text-amber-300" />,
          preloadTab: 'split_invoices',
          isActive: activeTab === 'split_invoices',
          action: () => {
            onSelectTab('split_invoices');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/invoices/split');
          },
        },
        {
          id: 'reports_tab',
          label: 'التقارير',
          icon: <BarChart3 className="w-4 h-4 text-emerald-300" />,
          preloadTab: 'reports',
          isActive: activeTab === 'reports' || activeTab === 'trending',
          action: () => {
            onSelectTab('reports');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/reports');
          },
        },
      ],
    },
    {
      id: 'competition',
      title: 'المنافسة',
      icon: <Compass className="w-4 h-4 text-teal-300" />,
      items: [
        {
          id: 'radar_tab',
          label: 'أسعار المنافسين',
          icon: <Compass className="w-4 h-4 text-teal-300" />,
          preloadTab: 'radar',
          isActive: activeTab === 'radar',
          action: () => {
            onSelectTab('radar');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/competitors');
          },
        },
        {
          id: 'analytics_tab',
          label: 'تحليل الأسعار',
          icon: <BarChart3 className="w-4 h-4 text-teal-300" />,
          preloadTab: 'analytics',
          isActive: activeTab === 'analytics',
          action: () => {
            onSelectTab('analytics');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/analytics');
          },
        },
        {
          id: 'watchlist_tab',
          label: 'قائمة المتابعة',
          icon: <Bookmark className="w-4 h-4 text-sky-300" />,
          preloadTab: 'watchlist',
          isActive: activeTab === 'watchlist',
          action: () => {
            onSelectTab('watchlist');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/watchlist');
          },
        },
      ],
    },
    {
      id: 'connections',
      title: 'الربط',
      icon: <Globe className="w-4 h-4 text-sky-300" />,
      items: [
        {
          id: 'platforms_guide_tab',
          label: 'ربط المنصات',
          icon: <Link2 className="w-4 h-4 text-sky-300" />,
          preloadTab: 'platforms_guide',
          isActive: activeTab === 'platforms_guide',
          action: () => {
            onSelectTab('platforms_guide');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/connections');
          },
        },
        {
          id: 'amazon_txt_import_action',
          label: 'استورد ملف أمازون (TXT)',
          icon: <FileSpreadsheet className="w-4 h-4 text-emerald-300" />,
          action: () => {
            onOpenAmazonImport?.();
          },
        },
        {
          id: 'gmail_sync_tab',
          label: 'سحب من الجيميل',
          icon: <Mail className="w-4 h-4 text-amber-300" />,
          preloadTab: 'traders_sync',
          isActive: activeTab === 'traders_sync',
          action: () => {
            onSelectTab('traders_sync');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/gmail-sync');
          },
        },
      ],
    },
    {
      id: 'settings',
      title: 'الإعدادات',
      icon: <Settings className="w-4 h-4 text-slate-300" />,
      items: [
        {
          id: 'settings_tab',
          label: 'إعدادات الحساب',
          icon: <Settings className="w-4 h-4 text-sky-300" />,
          preloadTab: 'account_settings',
          isActive: activeTab === 'account_settings',
          action: () => {
            onSelectTab('account_settings');
            if (typeof window !== 'undefined') window.history.pushState({}, '', '/settings');
          },
        },
        ...(isOwner
          ? [
              {
                id: 'super_admin',
                label: 'لوحة Super Admin',
                icon: <Crown className="w-4 h-4 text-amber-300" />,
                badge: 'مالك',
                action: () => onOpenOwnerDashboard(),
              },
            ]
          : []),
        {
          id: 'sidebar_theme_mode',
          label: resolvedColorMode === 'dark' ? 'الوضع النهاري' : 'وضع ليلي',
          badge: resolvedColorMode === 'dark' ? 'Dark High Contrast' : 'Clean Light',
          icon:
            resolvedColorMode === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-sky-500" />
            ),
          action: () => {
            toggleColorMode();
            onShowToast?.(
              resolvedColorMode === 'dark'
                ? 'تم التبديل إلى وضع Clean Light المريح للعين'
                : 'تم التبديل إلى وضع Dark High Contrast للبيئات التجارية المظلمة'
            );
          },
        },
        {
          id: 'sidebar_notifications',
          label: 'التنبيهات',
          icon: <Bell className="w-4 h-4 text-amber-300" />,
          badge: unreadNotificationsCount > 0 ? String(unreadNotificationsCount) : undefined,
          action: () => {
            onOpenNotifications?.();
          },
        },
      ],
    },
    ...(!isInstalled
      ? [
          {
            id: 'app',
            title: 'التطبيق',
            icon: <Smartphone className="w-4 h-4 text-indigo-300" />,
            items: [
              {
                id: 'sidebar_install_app',
                label: 'تثبيت التطبيق',
                icon: <Smartphone className="w-4 h-4 text-indigo-300" />,
                action: handleInstallAppClick,
              },
            ],
          },
        ]
      : []),
  ];

  const orderedCategories = useMemo(() => {
    const withOrderedItems = categories.map((cat) => ({
      ...cat,
      items: applyStoredOrder(cat.items, itemOrders[cat.id]),
    }));
    return applyStoredOrder(withOrderedItems, categoryOrder);
  }, [categories, categoryOrder, itemOrders]);

  const hasCustomOrder =
    categoryOrder.length > 0 || Object.keys(itemOrders).some((k) => (itemOrders[k]?.length ?? 0) > 0);

  const handleCategoryDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const currentIds = orderedCategories.map((c) => c.id);
      const oldIndex = currentIds.indexOf(String(active.id));
      const newIndex = currentIds.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return;
      const nextIds = arrayMove(currentIds, oldIndex, newIndex);
      setCategoryOrder(nextIds);
      try {
        localStorage.setItem(SIDEBAR_CATEGORY_ORDER_STORAGE_KEY, JSON.stringify(nextIds));
      } catch {
        // safe fallback
      }
      onShowToast?.('تم حفظ ترتيب أقسام القائمة الجانبية.');
    },
    [orderedCategories, onShowToast]
  );

  const handleItemDragEnd = useCallback(
    (categoryId: string, currentItems: NavItem[], event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const currentIds = currentItems.map((i) => i.id);
      const oldIndex = currentIds.indexOf(String(active.id));
      const newIndex = currentIds.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return;
      const nextIds = arrayMove(currentIds, oldIndex, newIndex);
      setItemOrders((prev) => {
        const updated = { ...prev, [categoryId]: nextIds };
        try {
          localStorage.setItem(SIDEBAR_ITEM_ORDER_STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // safe fallback
        }
        return updated;
      });
      onShowToast?.('تم حفظ ترتيب عناصر القائمة الجانبية.');
    },
    [onShowToast]
  );

  const handleResetSidebarOrder = useCallback(() => {
    setCategoryOrder([]);
    setItemOrders({});
    try {
      localStorage.removeItem(SIDEBAR_CATEGORY_ORDER_STORAGE_KEY);
      localStorage.removeItem(SIDEBAR_ITEM_ORDER_STORAGE_KEY);
    } catch {
      // safe fallback
    }
    onShowToast?.('تمت استعادة الترتيب الافتراضي للقائمة الجانبية.');
  }, [onShowToast]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[110] lg:hidden transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <FounderModeWrapper elementId="app_sidebar" position="bottom-left">
        <aside
          data-testid="app-sidebar"
          className={`fixed top-0 bottom-0 right-0 z-[120] bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] shadow-2xl flex flex-col border-l border-[var(--sidebar-border)] transition-all duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          } ${isCollapsed ? 'w-[72px]' : 'w-[264px]'}`}
          dir="rtl"
        >
          {/* Sidebar Header */}
          <div className="h-12 px-3 bg-[var(--sidebar-bg)] border-b border-[var(--sidebar-border)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 overflow-hidden min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[var(--sidebar-surface)] border border-[var(--sidebar-border)] overflow-hidden shrink-0">
                <img
                  src="/pwa-512x512.png"
                  alt="RADAR"
                  className="w-full h-full object-contain"
                />
              </div>
              {!isCollapsed && (
                <div className="truncate min-w-0">
                  <h2 className="text-sm font-black text-[var(--sidebar-text)] tracking-wide truncate" dir="ltr">
                    RADAR
                  </h2>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleToggleCollapse}
                className="hidden lg:flex p-1.5 rounded-lg text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover-bg)] transition-colors cursor-pointer"
                title={isCollapsed ? 'توسيع القائمة' : 'طي القائمة'}
              >
                <Menu className="w-4 h-4 shrink-0" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-lg text-[var(--sidebar-text-muted)] hover:text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover-bg)] transition-colors cursor-pointer"
                title="إغلاق القائمة"
              >
                <X className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </div>

          {/* Scrollable Navigation Categories (Drag & Drop Reorderable) */}
          <nav
            aria-label="القائمة الجانبية الرئيسية"
            className="flex-1 overflow-y-auto p-2 space-y-2 w-full"
          >
            {!isCollapsed && hasCustomOrder && (
              <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-[var(--sidebar-surface)] border border-[var(--sidebar-border)] text-[11px]">
                <span className="text-[var(--sidebar-text-muted)] font-bold">ترتيب مخصص</span>
                <button
                  type="button"
                  data-testid="btn-reset-sidebar-order"
                  onClick={handleResetSidebarOrder}
                  className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>استعادة الافتراضي</span>
                </button>
              </div>
            )}

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleCategoryDragEnd}
            >
              <SortableContext
                items={orderedCategories.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {orderedCategories.map((category) => (
                  <SortableSidebarCategoryCard
                    key={category.id}
                    category={category}
                    isCollapsed={isCollapsed}
                    isCategoryOpen={openCategories[category.id] ?? true}
                    onToggleCategory={toggleCategory}
                    onItemClick={handleItemClick}
                    onPrefetchTab={onPrefetchTab}
                    sensors={sensors}
                    onItemDragEnd={handleItemDragEnd}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </nav>

          {/* Sidebar Footer: Direct Theme Switcher + Trial Days */}
          <div className="p-2.5 bg-[var(--sidebar-bg)] border-t border-[var(--sidebar-border)] text-xs text-[var(--sidebar-text)] shrink-0 space-y-2">
            <button
              type="button"
              id="btn-sidebar-switch-theme"
              data-testid="sidebar-theme-switch-btn"
              onClick={() => {
                toggleColorMode();
                onShowToast?.(
                  resolvedColorMode === 'dark'
                    ? 'تم التبديل إلى وضع Clean Light المريح للعين'
                    : 'تم التبديل إلى وضع Dark High Contrast للبيئات التجارية المظلمة'
                );
              }}
              aria-label="تبديل الثيم"
              title={`تبديل الثيم (${resolvedColorMode === 'dark' ? 'Dark High Contrast' : 'Clean Light'})`}
              className="w-full py-2 px-2.5 rounded-xl bg-[var(--sidebar-surface)] hover:bg-[var(--sidebar-hover-bg)] border border-[var(--sidebar-border)] text-[var(--sidebar-text)] font-black text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5 min-w-0">
                {resolvedColorMode === 'dark' ? (
                  <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                )}
                {!isCollapsed && <span className="truncate">تبديل الثيم</span>}
              </span>
              {!isCollapsed && (
                <span
                  dir="ltr"
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--badge-bg)] text-[var(--badge-text)] border border-[var(--badge-border)] shrink-0"
                >
                  {resolvedColorMode === 'dark' ? 'Dark High Contrast' : 'Clean Light'}
                </span>
              )}
            </button>

            {!isCollapsed && (
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1 text-[11px] text-[var(--sidebar-text-muted)]">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  <span>التجربة المجانية:</span>
                </span>
                <span className="text-emerald-700 dark:text-white font-black bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 px-2 py-0.5 rounded text-[10px] font-mono">
                  {trialDaysRemaining} أيام
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={async () => {
                await signOut();
                if (typeof window !== 'undefined') window.location.href = '/login';
              }}
              className="w-full py-2 px-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-black text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </aside>
      </FounderModeWrapper>

      {/* Clean PWA Install Instructions Modal (only triggered from Sidebar "تثبيت التطبيق") */}
      {showInstallGuideModal && (
        <div
          className="fixed inset-0 z-[180] flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-4 text-right"
          onClick={() => setShowInstallGuideModal(false)}
        >
          <div
            className="w-full sm:max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">تثبيت تطبيق RADAR</h3>
                  <p className="text-[11px] text-slate-400">
                    ثبّت التطبيق للعمل بشكل مستقل وسريع على جهازك
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInstallGuideModal(false)}
                aria-label="إغلاق"
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-200">
              {isIOS ? (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <p className="font-bold">1. اضغط على أيقونة المشاركة (Share) أسفل متصفح Safari.</p>
                  <p className="font-bold">2. اختر &quot;إضافة إلى الصفحة الرئيسية&quot; (Add to Home Screen).</p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <p className="font-bold">1. افتح قائمة المتصفح (⋮) في Chrome أو Edge.</p>
                  <p className="font-bold">2. اختر &quot;تثبيت التطبيق&quot; (Install App) أو اضغط أيقونة التثبيت بشريط العنوان.</p>
                </div>
              )}

              {isAndroid && (
                <button
                  type="button"
                  onClick={() => {
                    downloadApkDirectly();
                    setShowInstallGuideModal(false);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>تنزيل نسخة الأندرويد (APK)</span>
                </button>
              )}

              {isInIframe && (
                <button
                  type="button"
                  onClick={openInNewWindow}
                  className="w-full py-2.5 px-3 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>فتح في نافذة مستقلة لتفعيل التثبيت الفوري</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowInstallGuideModal(false)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer"
              >
                حسناً
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
