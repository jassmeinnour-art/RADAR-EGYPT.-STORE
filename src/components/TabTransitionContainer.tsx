import React, { useEffect, useState, useRef } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';

interface TabTransitionContainerProps {
  tabKey: string;
  children: React.ReactNode;
}

const SMOOTH_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const TabTransitionContainer: React.FC<TabTransitionContainerProps> = ({
  tabKey,
  children,
}) => {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(max-width: 767px)').matches;
  });

  const previousTabRef = useRef<string>(tabKey);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  // Scroll smoothly back to top on mobile when navigating between tabs
  useEffect(() => {
    if (previousTabRef.current !== tabKey) {
      previousTabRef.current = tabKey;
      if (isMobile && typeof window !== 'undefined' && window.scrollY > 40) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [tabKey, isMobile]);

  const initialVariant = isMobile
    ? { opacity: 0, y: 14, scale: 0.99 }
    : { opacity: 0, y: 8 };

  const animateVariant = isMobile
    ? { opacity: 1, y: 0, scale: 1 }
    : { opacity: 1, y: 0 };

  const exitVariant = isMobile
    ? { opacity: 0, y: -8, scale: 0.995 }
    : { opacity: 0, y: -6 };

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tabKey}
          initial={initialVariant}
          animate={animateVariant}
          exit={exitVariant}
          transition={{
            duration: isMobile ? 0.22 : 0.18,
            ease: SMOOTH_EASE,
          }}
          style={{ willChange: 'transform, opacity' }}
          className="w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
};

export default TabTransitionContainer;
