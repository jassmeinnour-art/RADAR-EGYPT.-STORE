import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export type AsyncOpCategory = 'platform_sync' | 'csv_export' | 'database' | 'api_request';

export interface AsyncOperation {
  id: string;
  category: AsyncOpCategory;
  title: string;
  detail?: string;
  startedAt: number;
}

export interface CompletedAsyncOp {
  id: string;
  category: AsyncOpCategory;
  title: string;
  success: boolean;
  completedAt: number;
}

interface AsyncOperationsContextType {
  activeOperations: AsyncOperation[];
  recentCompleted: CompletedAsyncOp | null;
  isPlatformSyncing: boolean;
  isCsvExporting: boolean;
  isDatabaseBusy: boolean;
  isAnyBusy: boolean;
  startOperation: (category: AsyncOpCategory, title: string, detail?: string, customId?: string) => () => void;
  runWithLoading: <T>(
    category: AsyncOpCategory,
    title: string,
    action: () => Promise<T> | T,
    detail?: string
  ) => Promise<T>;
  clearCompleted: () => void;
}

const AsyncOperationsContext = createContext<AsyncOperationsContextType | undefined>(undefined);

// Custom Events for decoupled triggering outside React tree (e.g. within utility functions)
export const ASYNC_OP_START_EVENT = 'ais_async_op_start';
export const ASYNC_OP_END_EVENT = 'ais_async_op_end';

export function triggerGlobalAsyncStart(category: AsyncOpCategory, title: string, detail?: string, id?: string): string {
  const opId = id || `op-${category}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(ASYNC_OP_START_EVENT, {
        detail: { id: opId, category, title, detail, startedAt: Date.now() }
      })
    );
  }
  return opId;
}

export function triggerGlobalAsyncEnd(id: string, success: boolean = true, title?: string, category?: AsyncOpCategory): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(ASYNC_OP_END_EVENT, {
        detail: { id, success, title, category, completedAt: Date.now() }
      })
    );
  }
}

export const AsyncOperationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeOperations, setActiveOperations] = useState<AsyncOperation[]>([]);
  const [recentCompleted, setRecentCompleted] = useState<CompletedAsyncOp | null>(null);
  const completedTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Listen to decoupled global window events
  useEffect(() => {
    const handleStart = (e: Event) => {
      const detail = (e as CustomEvent<AsyncOperation>).detail;
      if (!detail || !detail.id) return;
      setActiveOperations((prev) => {
        // avoid duplicates
        if (prev.some((op) => op.id === detail.id)) return prev;
        return [...prev, detail];
      });
    };

    const handleEnd = (e: Event) => {
      const detail = (e as CustomEvent<{ id: string; success?: boolean; title?: string; category?: AsyncOpCategory }>).detail;
      if (!detail || !detail.id) return;

      setActiveOperations((prev) => {
        const found = prev.find((op) => op.id === detail.id);
        const next = prev.filter((op) => op.id !== detail.id);
        
        // Record completed operation for user feedback
        const opTitle = detail.title || found?.title;
        const opCat = detail.category || found?.category;
        if (opTitle && opCat) {
          if (completedTimerRef.current) clearTimeout(completedTimerRef.current);
          setRecentCompleted({
            id: detail.id,
            category: opCat,
            title: opTitle,
            success: detail.success !== false,
            completedAt: Date.now()
          });
          completedTimerRef.current = setTimeout(() => {
            setRecentCompleted(null);
          }, 3200);
        }

        return next;
      });
    };

    window.addEventListener(ASYNC_OP_START_EVENT, handleStart);
    window.addEventListener(ASYNC_OP_END_EVENT, handleEnd);

    return () => {
      window.removeEventListener(ASYNC_OP_START_EVENT, handleStart);
      window.removeEventListener(ASYNC_OP_END_EVENT, handleEnd);
      if (completedTimerRef.current) clearTimeout(completedTimerRef.current);
    };
  }, []);

  const startOperation = useCallback(
    (category: AsyncOpCategory, title: string, detail?: string, customId?: string) => {
      const id = customId || `op-${category}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      triggerGlobalAsyncStart(category, title, detail, id);

      let ended = false;
      return (success: boolean = true) => {
        if (ended) return;
        ended = true;
        triggerGlobalAsyncEnd(id, success, title, category);
      };
    },
    []
  );

  const runWithLoading = useCallback(
    async <T,>(
      category: AsyncOpCategory,
      title: string,
      action: () => Promise<T> | T,
      detail?: string
    ): Promise<T> => {
      const end = startOperation(category, title, detail);
      try {
        const result = await action();
        end(true);
        return result;
      } catch (err) {
        end(false);
        throw err;
      }
    },
    [startOperation]
  );

  const clearCompleted = useCallback(() => {
    if (completedTimerRef.current) clearTimeout(completedTimerRef.current);
    setRecentCompleted(null);
  }, []);

  const isPlatformSyncing = activeOperations.some((op) => op.category === 'platform_sync');
  const isCsvExporting = activeOperations.some((op) => op.category === 'csv_export');
  const isDatabaseBusy = activeOperations.some((op) => op.category === 'database');
  const isAnyBusy = activeOperations.length > 0;

  return (
    <AsyncOperationsContext.Provider
      value={{
        activeOperations,
        recentCompleted,
        isPlatformSyncing,
        isCsvExporting,
        isDatabaseBusy,
        isAnyBusy,
        startOperation,
        runWithLoading,
        clearCompleted
      }}
    >
      {children}
    </AsyncOperationsContext.Provider>
  );
};

export function useAsyncOperations(): AsyncOperationsContextType {
  const ctx = useContext(AsyncOperationsContext);
  if (!ctx) {
    throw new Error('useAsyncOperations must be used within an AsyncOperationsProvider');
  }
  return ctx;
}
