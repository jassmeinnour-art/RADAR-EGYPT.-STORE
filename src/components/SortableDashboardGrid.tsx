import React, { useState, useEffect } from 'react';
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
  rectSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, RotateCcw, Check, Sparkles, LayoutGrid, List } from 'lucide-react';

interface SortableDashboardCardProps {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  viewMode?: 'grid' | 'list';
}

export const SortableDashboardCard: React.FC<SortableDashboardCardProps> = ({
  id,
  title,
  children,
  className = '',
  viewMode = 'grid'
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.85 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${className} ${isDragging ? 'ring-4 ring-indigo-500/40 shadow-2xl rounded-2xl' : ''}`}
    >
      {/* Drag Handle Bar */}
      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-2 left-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 hover:bg-slate-900 text-slate-300 hover:text-white px-2 py-1 rounded-lg cursor-grab active:cursor-grabbing flex items-center gap-1 text-[11px] font-bold shadow-md"
        title="اسحب لإعادة ترتيب البطاقة (Drag to reorder)"
      >
        <GripVertical className="w-3.5 h-3.5 text-amber-400" />
        <span>إعادة ترتيب</span>
      </div>

      {children}
    </div>
  );
};

interface SortableDashboardGridProps {
  storageKey?: string;
  defaultOrder: string[];
  renderCard: (id: string, viewMode: 'grid' | 'list') => React.ReactNode;
  className?: string;
}

export const SortableDashboardGrid: React.FC<SortableDashboardGridProps> = ({
  storageKey = 'radar_dashboard_cards_order_v1',
  defaultOrder,
  renderCard,
  className = 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5'
}) => {
  const [items, setItems] = useState<string[]>(() => {
    if (typeof window === 'undefined') return defaultOrder;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === defaultOrder.length) {
          return parsed;
        }
      }
    } catch {}
    return defaultOrder;
  });

  // View Mode: 'grid' vs 'list', saved to localStorage
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    if (typeof window === 'undefined') return 'grid';
    try {
      const savedMode = localStorage.getItem(`${storageKey}_view_mode`);
      if (savedMode === 'list' || savedMode === 'grid') return savedMode;
    } catch {}
    return 'grid';
  });

  const [isSavedToast, setIsSavedToast] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(`${storageKey}_view_mode`, viewMode);
    } catch {}
  }, [viewMode, storageKey]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(String(active.id));
        const newIndex = items.indexOf(String(over.id));
        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        try {
          localStorage.setItem(storageKey, JSON.stringify(newOrder));
          setIsSavedToast(true);
          setTimeout(() => setIsSavedToast(false), 2000);
        } catch {}

        return newOrder;
      });
    }
  };

  const handleResetOrder = () => {
    setItems(defaultOrder);
    setViewMode('grid');
    try {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(`${storageKey}_view_mode`);
      setIsSavedToast(true);
      setTimeout(() => setIsSavedToast(false), 2000);
    } catch {}
  };

  // Determine container layout classes based on viewMode
  const containerClasses = viewMode === 'grid'
    ? className
    : 'flex flex-col gap-3';

  return (
    <div className="space-y-3">
      {/* Top Toolbar: Drag Info + View Mode Switcher + Reset */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 bg-slate-100/80 p-2.5 rounded-2xl border border-slate-200">
        <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>إدارة وعرض بطاقات المؤشرات (Drag & Drop & Layout Preset)</span>
        </span>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle: Grid vs List */}
          <div className="flex items-center bg-white border border-slate-300 rounded-xl p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="عرض شبكي (Grid View)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>شبكة (Grid)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="عرض قائمة (List View)"
            >
              <List className="w-3.5 h-3.5" />
              <span>قائمة (List)</span>
            </button>
          </div>

          {isSavedToast && (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-xl flex items-center gap-1 animate-fadeIn">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>تم الحفظ</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleResetOrder}
            className="text-xs text-slate-600 hover:text-slate-900 font-bold px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 transition flex items-center gap-1 cursor-pointer shadow-2xs"
            title="إعادة الترتيب الافتراضي"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">افتراضي</span>
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={viewMode === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}>
          <div className={containerClasses}>
            {items.map((id) => renderCard(id, viewMode))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
