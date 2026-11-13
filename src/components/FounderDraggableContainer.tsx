import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DraggableHandle } from './DraggableHandle';
import { FounderModeWrapper } from './FounderModeWrapper';

export { FounderModeWrapper };

interface FounderDraggableContainerProps {
  elementId: string;
  children: React.ReactNode;
  className?: string;
  position?: 'bottom-left' | 'bottom-right' | 'top-right' | 'top-left';
  style?: React.CSSProperties;
}

/**
 * FounderDraggableContainer
 * A wrapper component that automatically embeds DraggableHandle for resizing
 * when `isFounderMode` is active AND the user is strictly `jassmeinnour@gmail.com`.
 * For all regular users or when Founder Mode is inactive, renders standard layout cleanly.
 */
export const FounderDraggableContainer: React.FC<FounderDraggableContainerProps> = ({
  elementId,
  children,
  className = '',
  position = 'bottom-left',
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
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleModeChange = (e: CustomEvent<{ active?: boolean }>) => {
      if (typeof e.detail?.active === 'boolean') {
        setLocalFounderActive(e.detail.active);
      } else {
        try {
          setLocalFounderActive(
            localStorage.getItem('isFounderMode') === 'true' ||
            localStorage.getItem('radar_founder_mode') === 'true' ||
            localStorage.getItem('founder_mode_active') === 'true'
          );
        } catch {}
      }
    };

    window.addEventListener('founder_mode_changed' as any, handleModeChange);
    return () => {
      window.removeEventListener('founder_mode_changed' as any, handleModeChange);
    };
  }, []);

  const isFounderStrict = useMemo(() => {
    if (!user || user.isAnonymous || !isOwner) return false;
    const uEmail = (user.email || '').trim().toLowerCase();
    const pEmail = (profile?.email || '').trim().toLowerCase();
    return uEmail === 'jassmeinnour@gmail.com' || pEmail === 'jassmeinnour@gmail.com';
  }, [user, profile?.email, isOwner]);

  const showHandle = isFounderStrict && (isFounderMode || localFounderActive);

  return (
    <div
      ref={containerRef}
      style={style}
      className={`${className} ${showHandle ? 'relative ring-1 ring-amber-500/30' : ''}`}
    >
      {children}
      {showHandle && (
        <DraggableHandle
          elementId={elementId}
          targetRef={containerRef}
          position={position}
        />
      )}
    </div>
  );
};

export default FounderDraggableContainer;
