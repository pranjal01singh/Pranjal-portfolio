'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Menu, Moon, Search, Sun, X, ArrowUpRight } from 'lucide-react';
import { usePortfolioUI } from './PortfolioUIProvider';
import { useTheme } from './ThemeProvider';

interface NavbarProps {
  resumeLink?: string;
}

const NAV_LINKS = [
  { id: 'projects', label: 'Projects', href: '/#projects' },
  { id: 'journey', label: 'Experience', href: '/#journey' },
  { id: 'skills', label: 'Skills', href: '/#skills' },
  { id: 'credentials', label: 'Credentials', href: '/#credentials' },
  { id: 'contact', label: 'Contact', href: '/#contact' },
];

export default function Navbar({ resumeLink }: NavbarProps) {
  const pathname = usePathname();
  const { openCommandPalette } = usePortfolioUI();
  const { toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    if (pathname !== '/') {
      return;
    }

    const sectionIds = NAV_LINKS.map((link) => link.id);
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        rootMargin: '-28% 0px -52% 0px',
        threshold: [0.1, 0.25, 0.5],
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200/80 bg-[#FAF9F6]/80 backdrop-blur-md transition-colors duration-300 dark:border-stone-800/80 dark:bg-[#0F0E0D]/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo */}
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5 text-sm font-semibold tracking-tight text-stone-900 dark:text-stone-100"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200/80 bg-white/85 font-mono text-xs font-bold text-[#EA580C] shadow-sm transition-colors group-hover:border-[#EA580C]/40 group-hover:bg-[#EA580C] group-hover:text-white dark:border-stone-800/80 dark:bg-[#1A1918]/80 dark:text-orange-500 dark:group-hover:border-orange-500/40 dark:group-hover:bg-orange-500 dark:group-hover:text-stone-950">
            PS
          </span>
          <span className="hidden sm:inline-block">Pranjal Singh</span>
        </Link>

        {/* Center: Smooth Scroll Navigation with Active ScrollSpy */}
        <nav className="hidden items-center gap-1 rounded-full border border-stone-200/80 bg-white/85 px-2 py-1 shadow-sm backdrop-blur-md transition-colors dark:border-stone-800/80 dark:bg-[#1A1918]/80 lg:flex">
          {NAV_LINKS.map((item) => {
            const isActive = pathname === '/' && activeSection === item.id;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-[#1C1917] dark:text-stone-100'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/70 dark:hover:text-stone-100'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="activeNav"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    className="absolute right-3 bottom-0.5 left-3 h-[2px] rounded-full bg-[#EA580C] dark:bg-orange-500"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Search / Command Palette + Theme Toggle + Resume CTA + Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={openCommandPalette}
            aria-label="Open developer command palette"
            className="inline-flex items-center gap-2 rounded-full border border-stone-200/80 bg-white/85 px-3 py-1.5 text-xs font-medium text-stone-700 shadow-sm backdrop-blur-md transition-colors hover:border-[#EA580C]/40 hover:text-[#1C1917] dark:border-stone-800/80 dark:bg-[#1A1918]/80 dark:text-stone-300 dark:hover:border-orange-500/40 dark:hover:text-stone-100"
          >
            <Search size={13} className="text-[#EA580C] dark:text-orange-500" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="rounded border border-stone-200/80 bg-[#F5F5F4] px-1.5 py-0.5 font-mono text-[10px] text-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400">
              ⌘K
            </kbd>
          </motion.button>

          {/* Theme Toggle Button */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.93 }}
            onClick={toggleTheme}
            aria-label="Toggle Light or Dark Mode"
            title="Toggle Light / Dark Mode"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200/80 bg-white/85 text-stone-700 shadow-sm backdrop-blur-md transition-colors hover:border-[#EA580C]/40 hover:text-[#EA580C] dark:border-stone-800/80 dark:bg-[#1A1918]/80 dark:text-stone-200 dark:hover:border-orange-500/40 dark:hover:text-orange-400"
          >
            <Sun
              size={16}
              className="rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0"
            />
            <Moon
              size={16}
              className="absolute rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100"
            />
          </motion.button>

          {resumeLink ? (
            <motion.a
              whileTap={{ scale: 0.97 }}
              href={resumeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1C1917] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#EA580C] dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-orange-500 dark:hover:text-white"
            >
              <FileText size={14} />
              <span>Resume</span>
              <ArrowUpRight size={13} />
            </motion.a>
          ) : (
            <motion.div whileTap={{ scale: 0.97 }}>
              <Link
                href="/#contact"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#1C1917] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#EA580C] dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-orange-500 dark:hover:text-white"
              >
                <span className="hidden sm:inline">Resume / Contact</span>
                <span className="sm:hidden">Contact</span>
                <ArrowUpRight size={13} />
              </Link>
            </motion.div>
          )}

          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200/80 bg-white/85 text-stone-700 shadow-sm transition hover:border-[#EA580C]/40 hover:text-stone-900 dark:border-stone-800/80 dark:bg-[#1A1918]/80 dark:text-stone-200 dark:hover:border-orange-500/40 dark:hover:text-stone-100 lg:hidden"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-stone-200/80 bg-[#FAF9F6]/95 backdrop-blur-md dark:border-stone-800/80 dark:bg-[#0F0E0D]/95 lg:hidden"
          >
            <div className="flex flex-col space-y-1 px-4 py-4">
              {NAV_LINKS.map((item) => {
                const isActive = pathname === '/' && activeSection === item.id;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? 'bg-orange-50 text-[#EA580C] dark:bg-orange-500/10 dark:text-orange-400'
                        : 'text-stone-700 hover:bg-stone-100 hover:text-[#EA580C] dark:text-stone-300 dark:hover:bg-stone-800/70 dark:hover:text-orange-400'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#EA580C] dark:bg-orange-500" />
                    )}
                  </Link>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
