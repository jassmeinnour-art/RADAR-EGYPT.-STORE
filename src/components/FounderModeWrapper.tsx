import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DraggableHandle } from './DraggableHandle';

interface FounderModeWrapperProps {
  elementId: string;
  children: React.ReactNode;
  className?: string;
  position?: 'bottom-left' | 'bottom-right' | 'top-right' | 'top-left';
  style?: React.CSSProperties;
}

/**
 * FounderModeWrapper Component
 * Wraps key components (Sidebar, DashboardCards, Modals, etc.) and dynamically embeds
 * the DraggableHandle component ONLY when `isFounderMode` is active AND the current user
 * is strictly authenticated as `jassmeinnour@gmail.com`.
 * Maintains exact default appearance and zero side-effects for regular users.
 */
export const FounderModeWrapper: React.FC<FounderModeWrapperProps> = ({
  elementId,
  children,
  className = '',
  position = 'bottom-left',
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isFounderMode, isOwner, user, profile } = useAuth();

  const [isFounderModeActive, setIsFounderModeActive] = useState<boolean>(() => {
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

  // Listen for founder mode state changes in real-time
  useEffect(() => {
    const handleFounderModeChange = (e: CustomEvent<{ active?: boolean }>) => {
      if (typeof e.detail?.active === 'boolean') {
        setIsFounderModeActive(e.detail.active);
      } else {
        try {
          setIsFounderModeActive(
            localStorage.getItem('isFounderMode') === 'true' ||
            localStorage.getItem('radar_founder_mode') === 'true' ||
            localStorage.getItem('founder_mode_active') === 'true'
          );
        } catch {}
      }
    };

    window.addEventListener('founder_mode_changed' as any, handleFounderModeChange);
    return () => {
      window.removeEventListener('founder_mode_changed' as any, handleFounderModeChange);
    };
  }, []);

  // Strict email validation for jassmeinnour@gmail.com
  const isFounderIdentity = useMemo(() => {
    const uEmail = (user?.email || '').trim().toLowerCase();
    const pEmail = (profile?.email || '').trim().toLowerCase();
    return uEmail === 'jassmeinnour@gmail.com' || pEmail === 'jassmeinnour@gmail.com';
  }, [user?.email, profile?.email]);

  const isFounderModeEnabled = Boolean(isFounderMode || isFounderModeActive);
  const shouldEnableFounderMode = isFounderModeEnabled && isFounderIdentity;

  return (
    <div
      ref={containerRef}
      style={style}
      className={`${className} ${shouldEnableFounderMode ? 'relative ring-1 ring-amber-500/30' : ''}`}
    >
      {children}
      {shouldEnableFounderMode && (
        <DraggableHandle
          elementId={elementId}
          targetRef={containerRef}
          position={position}
        />
      )}
    </div>
  );
};

export default FounderModeWrapper;
