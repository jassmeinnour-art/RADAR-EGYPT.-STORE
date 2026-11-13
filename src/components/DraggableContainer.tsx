import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DraggableHandle } from './DraggableHandle';

interface DraggableContainerProps {
  elementId: string;
  children: React.ReactNode;
  className?: string;
  position?: 'bottom-left' | 'bottom-right' | 'top-right' | 'top-left';
  style?: React.CSSProperties;
}

/**
 * DraggableContainer
 * A specialized container for elements that need to be resizable by the founder.
 * It uses the DraggableHandle internally and persists dimensions to localStorage
 * under the key: `radar-card-size-[elementId]`.
 */
export const DraggableContainer: React.FC<DraggableContainerProps> = ({
  elementId,
  children,
  className = '',
  position = 'bottom-right',
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isFounderMode, isOwner, user, profile } = useAuth();

  const [localFounderActive, setLocalFounderActive] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem('isFounderMode') === 'true' ||
        localStorage.getItem('radar_founder_mode') === 'true' ||
        localStorage.getItem('founder_mode_active') === 'true'
      );
    } catch { return false; }
  });

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

  return (
    <div
      ref={containerRef}
      style={style}
      className={`${className} ${activeFounderMode ? 'relative ring-1 ring-amber-500/30' : ''}`}
    >
      {children}
      {activeFounderMode && (
        <DraggableHandle
          elementId={elementId}
          targetRef={containerRef}
          position={position}
        />
      )}
    </div>
  );
};

export default DraggableContainer;
