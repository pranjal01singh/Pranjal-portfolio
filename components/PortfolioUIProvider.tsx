'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from 'framer-motion';
import { ArrowUp, Check } from 'lucide-react';
import { WPProfile, WPProject } from '../lib/wordpress';
import CommandPalette from './CommandPalette';

interface PortfolioUIContextValue {
  openCommandPalette: () => void;
  copyEmail: (email?: string) => Promise<void>;
}

const PortfolioUIContext = createContext<PortfolioUIContextValue>({
  openCommandPalette: () => {},
  copyEmail: async () => {},
});

export function usePortfolioUI() {
  return useContext(PortfolioUIContext);
}

interface PortfolioUIProviderProps {
  children: ReactNode;
  projects: WPProject[];
  profile: WPProfile | null;
}

export default function PortfolioUIProvider({
  children,
  projects,
  profile,
}: PortfolioUIProviderProps) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { scrollY, scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 32,
    restDelta: 0.001,
  });

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const shouldShow = latest > 400;
    setShowBackToTop((prev) => (prev === shouldShow ? prev : shouldShow));
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  }, []);

  const copyEmail = useCallback(
    async (overrideEmail?: string) => {
      const targetEmail = overrideEmail || profile?.acf?.email;
      if (!targetEmail) return;
      try {
        await navigator.clipboard.writeText(targetEmail);
        showToast('Email copied to clipboard!');
      } catch {
        showToast(`Email: ${targetEmail}`);
      }
    },
    [profile?.acf?.email, showToast]
  );

  const openCommandPalette = useCallback(() => {
    setPaletteOpen(true);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <PortfolioUIContext.Provider value={{ openCommandPalette, copyEmail }}>
      {/* Top Terracotta / Warm Amber Reading Progress Bar */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX }}
        className="pointer-events-none fixed top-0 right-0 left-0 z-[60] h-[3px] origin-left bg-[#EA580C] dark:bg-orange-500"
      />

      {children}

      {/* Ctrl+K / Cmd+K Developer Command Palette */}
      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        projects={projects}
        profile={profile}
        onCopyEmail={() => copyEmail()}
      />

      {/* Bottom-Right Floating Toast & Back-to-Top Stack */}
      <div className="pointer-events-none fixed right-5 bottom-5 z-50 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto flex items-center gap-2.5 rounded-xl border border-stone-200/80 bg-white/95 px-4 py-3 text-sm font-medium text-[#1C1917] shadow-lg backdrop-blur-md dark:border-stone-800/80 dark:bg-[#1A1918]/95 dark:text-stone-100"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#059669]/15 text-[#059669] dark:bg-emerald-500/15 dark:text-emerald-400">
                <Check size={14} />
              </span>
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showBackToTop && (
            <motion.button
              type="button"
              onClick={scrollToTop}
              aria-label="Back to top"
              initial={{ opacity: 0, y: 14, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.9 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-stone-200/80 bg-white/90 px-4 py-2.5 font-mono text-xs font-medium text-[#1C1917] shadow-md backdrop-blur-md transition-colors hover:border-[#EA580C]/50 hover:text-[#EA580C] dark:border-stone-800/80 dark:bg-[#1A1918]/90 dark:text-stone-100 dark:hover:border-orange-500/50 dark:hover:text-orange-400"
            >
              <ArrowUp size={14} className="text-[#EA580C] dark:text-orange-500" />
              <span className="hidden sm:inline">Top</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </PortfolioUIContext.Provider>
  );
}
