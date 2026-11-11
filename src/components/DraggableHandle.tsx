import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Move } from 'lucide-react';

interface DraggableHandleProps {
  /**
   * Unique ID to persist dimensions in localStorage for this specific element.
   */
  elementId: string;
  /**
   * Reference to the element being resized.
   */
  targetRef: React.RefObject<HTMLElement | null>;
  /**
   * Optional callback when resizing ends.
   */
  onResizeEnd?: (width: number, height: number) => void;
  /**
   * Position of the handle. Defaults to bottom-left.
   */
  position?: 'bottom-left' | 'bottom-right' | 'top-right' | 'top-left';
}

/**
 * Reusable Draggable Handle component that allows resizing elements in Founder Mode.
 * Persists dimensions to localStorage automatically.
 */
export const DraggableHandle: React.FC<DraggableHandleProps> = ({ 
  elementId, 
  targetRef, 
  onResizeEnd,
  position = 'bottom-left'
}) => {
  const { isFounderMode, isOwner } = useAuth();
  const [isResizing, setIsResizing] = useState(false);

  const STORAGE_KEY = 'admin_layout_founder';

  // Apply saved dimensions on mount or mode change
  useEffect(() => {
    if (!targetRef.current) return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const layouts = JSON.parse(saved);
        const myLayout = layouts[elementId];
        if (myLayout) {
          if (myLayout.width) targetRef.current.style.width = `${myLayout.width}px`;
          if (myLayout.height) targetRef.current.style.height = `${myLayout.height}px`;
        }
      }
    } catch (e) {
      console.warn(`Failed to apply saved dimensions for ${elementId}:`, e);
    }
  }, [elementId, targetRef]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isFounderMode || !targetRef.current) return;
    
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = targetRef.current.offsetWidth;
    const startHeight = targetRef.current.offsetHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!targetRef.current) return;
      
      let deltaX = moveEvent.clientX - startX;
      let deltaY = moveEvent.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (position === 'bottom-right') {
        newWidth = startWidth + deltaX;
        newHeight = startHeight + deltaY;
      } else if (position === 'bottom-left') {
        newWidth = startWidth - deltaX;
        newHeight = startHeight + deltaY;
      } else if (position === 'top-right') {
        newWidth = startWidth + deltaX;
        newHeight = startHeight - deltaY;
      } else if (position === 'top-left') {
        newWidth = startWidth - deltaX;
        newHeight = startHeight - deltaY;
      }

      // Constraints
      if (newWidth < 50) newWidth = 50;
      if (newHeight < 20) newHeight = 20;

      targetRef.current.style.width = `${newWidth}px`;
      targetRef.current.style.height = `${newHeight}px`;
    };

    const onMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      if (targetRef.current) {
        const finalWidth = targetRef.current.offsetWidth;
        const finalHeight = targetRef.current.offsetHeight;
        try {
          const layouts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
          layouts[elementId] = { width: finalWidth, height: finalHeight };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
        } catch {}
        onResizeEnd?.(finalWidth, finalHeight);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  if (!isOwner || !isFounderMode) return null;

  const positionClasses = {
    'bottom-left': 'bottom-0 left-0 rounded-tr-xl cursor-sw-resize',
    'bottom-right': 'bottom-0 right-0 rounded-tl-xl cursor-se-resize',
    'top-right': 'top-0 right-0 rounded-bl-xl cursor-ne-resize',
    'top-left': 'top-0 left-0 rounded-br-xl cursor-nw-resize',
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`absolute ${positionClasses[position]} w-8 h-8 bg-amber-500 flex items-center justify-center z-[9999] shadow-2xl ${isResizing ? 'scale-125 opacity-100' : 'opacity-70 hover:opacity-100 hover:scale-110'} transition-all ring-4 ring-slate-950/20`}
      title="اسحب لتغيير أبعاد العنصر (وضع المؤسس)"
    >
      <Move className="w-4 h-4 text-slate-950" />
      
      {/* Ripple/Glow effect for Founder visibility */}
      <div className="absolute inset-0 bg-amber-400 rounded-full animate-ping opacity-20 pointer-events-none" />
    </div>
  );
};

export default DraggableHandle;
