import React, { useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { DraggableHandle } from './DraggableHandle';

interface FounderModeWrapperProps {
  elementId: string;
  children: React.ReactNode;
  className?: string;
  position?: 'bottom-left' | 'bottom-right' | 'top-right' | 'top-left';
}

/**
 * FounderModeWrapper
 * Verifies (isFounderMode && user.email === 'jassmeinnour@gmail.com')
 * and injects DraggableHandle to enable resizing for the founder.
 */
export const FounderModeWrapper: React.FC<FounderModeWrapperProps> = ({
  elementId,
  children,
  className = '',
  position = 'bottom-right',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isFounderMode, isOwner, user, profile } = useAuth();

  // Strict check: Founder mode must be ON and authenticated non-anonymous Email must be jassmeinnour@gmail.com
  const canEnableFounderMode = useMemo(() => {
    if (!user || user.isAnonymous || !isOwner) return false;
    const email = (user.email || profile?.email || '').trim().toLowerCase();
    return isFounderMode && email === 'jassmeinnour@gmail.com';
  }, [isFounderMode, isOwner, user, profile?.email]);

  return (
    <div
      ref={containerRef}
      className={`${className} ${canEnableFounderMode ? 'relative ring-1 ring-amber-500/30' : ''}`}
    >
      {children}
      {canEnableFounderMode && (
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
