import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowDownRight, RotateCcw } from 'lucide-react';

interface DraggableHandleProps {
  elementId: string;
  targetRef: React.RefObject<HTMLElement | null>;
  onResizeEnd?: (width: number, height: number) => void;
  position?: 'bottom-left' | 'bottom-right' | 'top-right' | 'top-left';
}

export const DraggableHandle: React.FC<DraggableHandleProps> = ({ 
  elementId, 
  targetRef, 
  onResizeEnd,
  position = 'bottom-right'
}) => {
  const { isFounderMode, isOwner, user, profile } = useAuth();
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [activeHandle, setActiveHandle] = useState<'corner' | 'width' | 'height' | null>(null);

  const [localFounderActive, setLocalFounderActive] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem('isFounderMode') === 'true' ||
        localStorage.getItem('radar_founder_mode') === 'true' ||
        localStorage.getItem('founder_mode_active') === 'true'
      );
    } catch { return false; }
  });

  const PRIMARY_STORAGE_KEY = `radar-card-size-${elementId}`;

  useEffect(() => {
    const handler = (e: any) => setLocalFounderActive(e.detail?.active ?? false);
    window.addEventListener('founder_mode_changed', handler);
    return () => window.removeEventListener('founder_mode_changed', handler);
  }, []);

  const isFounderIdentity = useMemo(() => {
    if (!user || user.isAnonymous || !isOwner) return false;
    const uEmail = (user.email || '').trim().toLowerCase();
    const pEmail = (profile?.email || '').trim().toLowerCase();
    return uEmail === 'jassmeinnour@gmail.com' || pEmail === 'jassmeinnour@gmail.com';
  }, [isOwner, user, profile?.email]);

  const activeFounderMode = isFounderIdentity && (isFounderMode || localFounderActive);

  // Restore saved size
  useEffect(() => {
    if (!targetRef.current) return;
    try {
      const saved = localStorage.getItem(PRIMARY_STORAGE_KEY);
      if (saved) {
        const { width, height } = JSON.parse(saved);
        if (width) targetRef.current.style.width = `${width}px`;
        if (height) targetRef.current.style.height = `${height}px`;
      }
    } catch {}
  }, [elementId, targetRef]);

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent, type: 'corner' | 'width' | 'height') => {
    if (!activeFounderMode || !targetRef.current) return;
    e.stopPropagation();
    e.preventDefault();

    const el = targetRef.current;
    const startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const startY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const startW = el.offsetWidth;
    const startH = el.offsetHeight;

    setIsResizing(true);
    setActiveHandle(type);

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
      const curX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const curY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
      const dx = curX - startX;
      const dy = curY - startY;

      if (type === 'corner' || type === 'width') {
        const newW = (position.includes('right') ? startW + dx : startW - dx);
        el.style.width = `${Math.max(200, Math.min(newW, window.innerWidth))}px`;
      }
      if (type === 'corner' || type === 'height') {
        const newH = (position.includes('bottom') ? startH + dy : startH - dy);
        el.style.height = `${Math.max(120, newH)}px`;
      }
    };

    const onEnd = () => {
      setIsResizing(false);
      setActiveHandle(null);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      localStorage.setItem(PRIMARY_STORAGE_KEY, JSON.stringify({ width: el.offsetWidth, height: el.offsetHeight }));
      onResizeEnd?.(el.offsetWidth, el.offsetHeight);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  }, [activeFounderMode, targetRef, position, PRIMARY_STORAGE_KEY, onResizeEnd]);

  if (!activeFounderMode) return null;

  return (
    <>
      <div onMouseDown={(e) => handleStart(e, 'corner')} onTouchStart={(e) => handleStart(e, 'corner')} className="absolute bottom-0 right-0 w-7 h-7 bg-orange-500 cursor-se-resize rounded-tl-xl flex items-center justify-center z-[9999] hover:scale-110 transition-transform">
        <ArrowDownRight className="w-4 h-4 text-slate-950 stroke-[3]" />
      </div>
      <div onMouseDown={(e) => handleStart(e, 'width')} onTouchStart={(e) => handleStart(e, 'width')} className="absolute top-2 bottom-8 right-0 w-2.5 bg-orange-500/80 cursor-col-resize z-[9998] hover:w-3 transition-all" />
      <div onMouseDown={(e) => handleStart(e, 'height')} onTouchStart={(e) => handleStart(e, 'height')} className="absolute bottom-0 left-8 right-8 h-2.5 bg-orange-500/80 cursor-row-resize z-[9998] hover:h-3 transition-all" />
      <button onClick={() => { targetRef.current!.style.width = ''; targetRef.current!.style.height = ''; localStorage.removeItem(PRIMARY_STORAGE_KEY); }} className="absolute top-1 left-1 z-[9999] p-1 bg-orange-500/20 text-orange-300 rounded hover:bg-orange-500 hover:text-slate-950">
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </>
  );
};
