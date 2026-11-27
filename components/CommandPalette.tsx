'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Copy,
  FileText,
  FolderGit2,
  Hash,
  Moon,
  Search,
  Sun,
  X,
} from 'lucide-react';
import { WPProfile, WPProject, decodeHtmlEntities } from '../lib/wordpress';
import { GitHubIcon, LinkedInIcon } from './BrandIcons';
import { useTheme } from './ThemeProvider';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  projects: WPProject[];
  profile: WPProfile | null;
  onCopyEmail: () => void;
}

interface CommandItem {
  id: string;
  group: 'Sections' | 'Projects' | 'Actions';
  label: string;
  subtitle?: string;
  keywords?: string;
  icon: 'section' | 'project' | 'copy' | 'github' | 'linkedin' | 'resume' | 'theme';
  run: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  projects,
  profile,
  onCopyEmail,
}: CommandPaletteProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const contact = profile?.acf || {};

  const items = useMemo<CommandItem[]>(() => {
    const sectionItems: CommandItem[] = [
      {
        id: 'sec-projects',
        group: 'Sections',
        label: 'Projects',
        subtitle: 'Jump to Featured Projects',
        icon: 'section',
        run: () => router.push('/#projects'),
      },
      {
        id: 'sec-journey',
        group: 'Sections',
        label: 'Experience',
        subtitle: 'Jump to Practical Experience & Focus',
        icon: 'section',
        run: () => router.push('/#journey'),
      },
      {
        id: 'sec-skills',
        group: 'Sections',
        label: 'Skills',
        subtitle: 'Jump to Technical Skills',
        icon: 'section',
        run: () => router.push('/#skills'),
      },
      {
        id: 'sec-credentials',
        group: 'Sections',
        label: 'Credentials',
        subtitle: 'Jump to Education & Certificates',
        icon: 'section',
        run: () => router.push('/#credentials'),
      },
      {
        id: 'sec-contact',
        group: 'Sections',
        label: 'Contact',
        subtitle: 'Jump to Contact & Footer',
        icon: 'section',
        run: () => router.push('/#contact'),
      },
    ];

    const projectItems: CommandItem[] = projects.map((project) => {
      const title = decodeHtmlEntities(project.title.rendered);
      return {
        id: `proj-${project.id}`,
        group: 'Projects',
        label: title,
        subtitle: project.acf?.tech_stack || 'Open project case study',
        keywords: `${title} ${project.slug} ${project.acf?.tech_stack || ''}`,
        icon: 'project',
        run: () => router.push(`/projects/${project.slug}`),
      };
    });

    const actionItems: CommandItem[] = [
      {
        id: 'act-toggle-theme',
        group: 'Actions',
        label: 'Toggle Dark / Light Mode',
        subtitle:
          theme === 'dark'
            ? 'Switch to Warm Editorial Light'
            : 'Switch to Warm Obsidian Dark',
        keywords: 'theme dark light mode appearance color',
        icon: 'theme',
        run: () => toggleTheme(),
      },
    ];

    if (contact.email) {
      actionItems.push({
        id: 'act-copy-email',
        group: 'Actions',
        label: 'Copy Email Address',
        subtitle: contact.email,
        keywords: `email mail contact ${contact.email}`,
        icon: 'copy',
        run: () => onCopyEmail(),
      });
    }

    if (contact.github_profile) {
      actionItems.push({
        id: 'act-github',
        group: 'Actions',
        label: 'Open GitHub Profile',
        subtitle: contact.github_profile,
        keywords: 'github code repositories',
        icon: 'github',
        run: () => window.open(contact.github_profile, '_blank', 'noopener,noreferrer'),
      });
    }

    if (contact.linkedin_profile) {
      actionItems.push({
        id: 'act-linkedin',
        group: 'Actions',
        label: 'Open LinkedIn Profile',
        subtitle: contact.linkedin_profile,
        keywords: 'linkedin profile social',
        icon: 'linkedin',
        run: () => window.open(contact.linkedin_profile, '_blank', 'noopener,noreferrer'),
      });
    }

    if (contact.resume_link) {
      actionItems.push({
        id: 'act-resume',
        group: 'Actions',
        label: 'View Resume',
        subtitle: 'Open resume PDF / document',
        keywords: 'resume cv pdf',
        icon: 'resume',
        run: () => window.open(contact.resume_link, '_blank', 'noopener,noreferrer'),
      });
    }

    return [...projectItems, ...sectionItems, ...actionItems];
  }, [
    projects,
    contact.email,
    contact.github_profile,
    contact.linkedin_profile,
    contact.resume_link,
    router,
    onCopyEmail,
    theme,
    toggleTheme,
  ]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        (item.keywords && item.keywords.toLowerCase().includes(q)) ||
        item.group.toLowerCase().includes(q)
    );
  }, [items, query]);

  const handleClose = () => {
    setQuery('');
    setSelectedIndex(0);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 30);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const activeIndex =
    filteredItems.length > 0 ? Math.min(selectedIndex, filteredItems.length - 1) : 0;

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setQuery('');
        setSelectedIndex(0);
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredItems.length ? (prev + 1) % filteredItems.length : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredItems.length
            ? (prev - 1 + filteredItems.length) % filteredItems.length
            : 0
        );
      } else if (e.key === 'Enter' && filteredItems[activeIndex]) {
        e.preventDefault();
        filteredItems[activeIndex].run();
        setQuery('');
        setSelectedIndex(0);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, activeIndex, onClose]);

  const renderIcon = (icon: CommandItem['icon']) => {
    switch (icon) {
      case 'project':
        return <FolderGit2 size={16} className="text-[#EA580C] dark:text-orange-500" />;
      case 'copy':
        return <Copy size={16} className="text-[#059669] dark:text-emerald-400" />;
      case 'github':
        return <GitHubIcon size={16} className="text-[#1C1917] dark:text-stone-100" />;
      case 'linkedin':
        return <LinkedInIcon size={16} className="text-[#1C1917] dark:text-stone-100" />;
      case 'resume':
        return <FileText size={16} className="text-[#EA580C] dark:text-orange-500" />;
      case 'theme':
        return theme === 'dark' ? (
          <Sun size={16} className="text-orange-400" />
        ) : (
          <Moon size={16} className="text-[#EA580C]" />
        );
      default:
        return <Hash size={16} className="text-stone-500 dark:text-stone-400" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Developer Command Palette"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={handleClose}
          className="fixed inset-0 z-[70] flex items-start justify-center bg-stone-900/35 px-4 pt-[12vh] backdrop-blur-sm dark:bg-black/60"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-stone-200/80 bg-[#FAF9F6]/95 shadow-2xl backdrop-blur-xl dark:border-stone-800/80 dark:bg-[#1A1918]/95"
          >
            {/* Search Input Header */}
            <div className="flex items-center gap-3 border-b border-stone-200/80 bg-white/80 px-4 py-3.5 dark:border-stone-800/80 dark:bg-stone-900/70">
              <Search size={18} className="shrink-0 text-[#EA580C] dark:text-orange-500" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search projects, jump to sections, or run an action..."
                className="w-full bg-transparent text-sm text-[#1C1917] placeholder:text-stone-400 focus:outline-none dark:text-stone-100 dark:placeholder:text-stone-500"
              />
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close command palette"
                className="rounded-md border border-stone-200/80 bg-[#F5F5F4] p-1 text-stone-500 transition hover:text-[#1C1917] dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400 dark:hover:text-stone-100"
              >
                <X size={14} />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-[55vh] overflow-y-auto p-2">
              {filteredItems.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-stone-600 dark:text-stone-400">
                  No matching projects, sections, or actions found.
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredItems.map((item, idx) => {
                    const isSelected = idx === activeIndex;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onMouseEnter={() => setSelectedIndex(idx)}
                        onClick={() => {
                          item.run();
                          handleClose();
                        }}
                        className={`flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left transition-colors ${
                          isSelected
                            ? 'bg-white text-[#1C1917] shadow-xs ring-1 ring-[#EA580C]/35 dark:bg-stone-800/90 dark:text-stone-100 dark:ring-orange-500/40'
                            : 'text-stone-700 hover:bg-white/60 dark:text-stone-300 dark:hover:bg-stone-800/50'
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stone-200/80 bg-[#F5F5F4] dark:border-stone-700 dark:bg-stone-900">
                            {renderIcon(item.icon)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#1C1917] dark:text-stone-100">
                              {item.label}
                            </p>
                            {item.subtitle && (
                              <p className="truncate font-mono text-[11px] text-stone-600 dark:text-stone-400">
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <span className="rounded-md border border-stone-200/80 bg-[#F5F5F4] px-2 py-0.5 font-mono text-[10px] text-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400">
                            {item.group}
                          </span>
                          {isSelected && (
                            <ArrowRight size={14} className="text-[#EA580C] dark:text-orange-500" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Keyboard Hints Footer */}
            <div className="flex items-center justify-between border-t border-stone-200/80 bg-white/70 px-4 py-2.5 font-mono text-[11px] text-stone-500 dark:border-stone-800/80 dark:bg-stone-900/70 dark:text-stone-400">
              <div className="flex items-center gap-3">
                <span>&uarr;&darr; navigate</span>
                <span>&crarr; select</span>
              </div>
              <span>esc to close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
