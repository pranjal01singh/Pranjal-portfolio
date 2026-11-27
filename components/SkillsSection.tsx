'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Code2,
  Cpu,
  Database,
  Globe,
  Layers,
  Terminal,
  Workflow,
  Wrench,
} from 'lucide-react';
import { WPSkillCategory, decodeHtmlEntities } from '../lib/wordpress';
import { centerIfPartiallyHidden, scrollTrackByCard } from './sliderUtils';

interface SkillsSectionProps {
  skills: WPSkillCategory[];
}

function getCategoryIcon(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes('ai') || lower.includes('ml')) return Cpu;
  if (lower.includes('database')) return Database;
  if (lower.includes('automation')) return Workflow;
  if (lower.includes('frontend')) return Layers;
  if (lower.includes('backend')) return Terminal;
  if (lower.includes('cms') || lower.includes('wordpress')) return Globe;
  if (lower.includes('devops') || lower.includes('tools')) return Wrench;
  return Code2;
}

export default function SkillsSection({ skills }: SkillsSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const scrollByCard = useCallback((direction: 'prev' | 'next') => {
    scrollTrackByCard(trackRef.current, direction, 16);
  }, []);

  useEffect(() => {
    if (isPaused || skills.length <= 1) return;
    const timer = setInterval(() => {
      scrollByCard('next');
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, skills.length, scrollByCard]);

  return (
    <section id="skills" className="scroll-mt-20 py-10 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 'some' }}
        transition={{ duration: 0.45 }}
        className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#EA580C] dark:text-orange-500">
            03 / Tech Stack
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 [text-shadow:0_1px_10px_rgba(250,249,246,0.7)] dark:text-stone-100 dark:[text-shadow:0_2px_12px_rgba(15,14,13,0.8)] sm:text-4xl">
            Technical Skills
          </h2>
          <p className="max-w-2xl text-sm font-medium text-stone-800 dark:text-stone-200">
            Categorized tools and technologies. Click any peeking card to center it.
          </p>
        </div>

        {skills.length > 1 && (
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollByCard('prev')}
              aria-label="Previous skill category"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200/80 bg-white/85 text-stone-900 shadow-xs backdrop-blur-md transition hover:border-[#EA580C]/50 hover:text-[#EA580C] dark:border-stone-800/80 dark:bg-[#1A1918]/80 dark:text-stone-100 dark:hover:border-orange-500/50 dark:hover:text-orange-400"
            >
              <ChevronLeft size={16} />
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollByCard('next')}
              aria-label="Next skill category"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200/80 bg-white/85 text-stone-900 shadow-xs backdrop-blur-md transition hover:border-[#EA580C]/50 hover:text-[#EA580C] dark:border-stone-800/80 dark:bg-[#1A1918]/80 dark:text-stone-100 dark:hover:border-orange-500/50 dark:hover:text-orange-400"
            >
              <ChevronRight size={16} />
            </motion.button>
          </div>
        )}
      </motion.div>

      <div
        ref={trackRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={() => setIsPaused(false)}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth py-2"
      >
        {skills.map((cat) => {
          const title = decodeHtmlEntities(cat.title.rendered);
          const Icon = getCategoryIcon(title);
          const items = cat.acf?.skills_list
            ? cat.acf.skills_list
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            : [];

          return (
            <div
              key={cat.id}
              onClickCapture={(e) => centerIfPartiallyHidden(e, trackRef.current)}
              className="group flex w-[88%] shrink-0 snap-start cursor-pointer flex-col justify-between rounded-2xl border border-stone-200/80 bg-white/85 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#EA580C]/40 hover:shadow-md dark:border-stone-800/80 dark:bg-[#1A1918]/80 dark:hover:border-orange-500/45 sm:w-[calc(50%-8px)] lg:w-[36%]"
            >
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200/80 bg-[#FAF9F6] text-[#EA580C] transition-colors group-hover:border-[#EA580C]/30 group-hover:bg-orange-50 dark:border-stone-700 dark:bg-stone-900 dark:text-orange-500 dark:group-hover:border-orange-500/35 dark:group-hover:bg-orange-500/15">
                    <Icon size={17} />
                  </span>
                  <h3 className="text-base font-bold tracking-tight text-stone-900 dark:text-stone-100">
                    {title}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {items.map((skill, idx) => (
                    <motion.span
                      key={idx}
                      whileTap={{ scale: 0.97 }}
                      className="rounded-md border border-stone-200/80 bg-[#F5F5F4] px-2.5 py-1 font-mono text-xs text-stone-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#EA580C]/40 hover:bg-orange-50 hover:text-[#EA580C] dark:border-stone-800 dark:bg-stone-900/90 dark:text-stone-300 dark:hover:border-orange-500/45 dark:hover:bg-orange-500/15 dark:hover:text-orange-400"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
