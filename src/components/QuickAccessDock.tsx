import React from 'react';
import { BarChart3, Compass, Layers, Wand2 } from 'lucide-react';
import { TAB_TO_PATH_MAP, type WorkspaceTab } from '../utils/navigation';
import { usePerformanceMode } from '../context/PerformanceModeContext';

export interface QuickAccessDockProps {
  activeTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  onPrefetchTab?: (tab: WorkspaceTab) => void;
}

export interface QuickAccessDockItem {
  id: string;
  tab: WorkspaceTab;
  label: string;
  matchTabs: WorkspaceTab[];
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
}

export const QUICK_ACCESS_DOCK_ITEMS: QuickAccessDockItem[] = [
  {
    id: 'product_image_studio',
    tab: 'product_image_studio',
    label: 'استوديو الصور',
    matchTabs: ['product_image_studio'],
    icon: Wand2,
  },
  {
    id: 'radar',
    tab: 'radar',
    label: 'رادار المنافسين',
    matchTabs: ['radar', 'auto_pricing', 'price_comparison'],
    icon: Compass,
  },
  {
    id: 'reports',
    tab: 'reports',
    label: 'التقارير',
    matchTabs: ['reports', 'trending'],
    icon: BarChart3,
  },
  {
    id: 'inventory',
    tab: 'inventory',
    label: 'المخزون',
    matchTabs: ['inventory'],
    icon: Layers,
  },
];

export const QuickAccessDock: React.FC<QuickAccessDockProps> = ({
  activeTab,
  onSelectTab,
  onPrefetchTab,
}) => {
  const { isPerformanceMode } = usePerformanceMode();

  const handleNavigate = (tab: WorkspaceTab) => {
    onSelectTab(tab);
    const targetPath = TAB_TO_PATH_MAP[tab];
    if (targetPath && typeof window !== 'undefined') {
      window.history.pushState({}, '', targetPath);
    }
  };

  const handlePrefetch = (tab: WorkspaceTab) => {
    if (isPerformanceMode) return;
    onPrefetchTab?.(tab);
  };

  return (
    <nav
      dir="rtl"
      data-testid="quick-access-dock"
      aria-label="شريط الوصول السريع للأدوات"
      className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-[var(--header-border)] bg-[var(--header-bg)] text-[var(--header-text)] shadow-[0_-6px_20px_rgba(2,6,23,0.18)] ${
        isPerformanceMode ? '' : 'backdrop-blur-md transition-colors duration-150'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="grid grid-cols-4 items-stretch h-14 max-w-xl mx-auto px-1">
        {QUICK_ACCESS_DOCK_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.matchTabs.includes(activeTab);

          return (
            <button
              key={item.id}
              type="button"
              data-testid={`quick-dock-item-${item.id}`}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => handleNavigate(item.tab)}
              onTouchStart={() => handlePrefetch(item.tab)}
              onMouseEnter={() => handlePrefetch(item.tab)}
              onFocus={() => handlePrefetch(item.tab)}
              className={`relative min-h-[44px] h-full px-1 flex flex-col items-center justify-center gap-0.5 rounded-lg cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                isPerformanceMode ? '' : 'transition-colors duration-150 active:scale-[0.97]'
              } ${
                isActive
                  ? 'text-amber-600 dark:text-amber-400 font-black bg-amber-500/10'
                  : 'text-[var(--text-secondary)] hover:text-[var(--header-text)] hover:bg-[var(--card-bg-hover)] font-bold'
              }`}
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute top-0 inset-x-4 h-0.5 rounded-b bg-amber-500"
                />
              )}
              <Icon
                aria-hidden={true}
                className={`w-[19px] h-[19px] shrink-0 ${
                  isActive
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-[var(--text-secondary)]'
                }`}
              />
              <span className="text-[10.5px] leading-tight whitespace-nowrap truncate max-w-full px-0.5">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default QuickAccessDock;
