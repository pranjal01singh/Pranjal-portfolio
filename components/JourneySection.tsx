'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { WPJourneyItem, decodeHtmlEntities } from '../lib/wordpress';
import { centerIfPartiallyHidden, scrollTrackByCard } from './sliderUtils';

interface JourneySectionProps {
  journey: WPJourneyItem[];
}

export default function JourneySection({ journey }: JourneySectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<number | null>(
    journey[0]?.id ?? null
  );
  const [isPaused, setIsPaused] = useState(false);

  const scrollByCard = useCallback((direction: 'prev' | 'next') => {
    scrollTrackByCard(trackRef.current, direction, 16);
  }, []);

  useEffect(() => {
    if (isPaused || journey.length <= 1) return;
    const timer = setInterval(() => {
      scrollByCard('next');
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, journey.length, scrollByCard]);

  return (
    <section id="journey" className="scroll-mt-20 py-10 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 'some' }}
        transition={{ duration: 0.45 }}
        className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#EA580C] dark:text-orange-500">
            02 / Engineering Timeline
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 [text-shadow:0_1px_10px_rgba(250,249,246,0.7)] dark:text-stone-100 dark:[text-shadow:0_2px_12px_rgba(15,14,13,0.8)] sm:text-4xl">
            Practical Experience &amp; Focus
          </h2>
          <p className="max-w-2xl text-sm font-medium text-stone-800 dark:text-stone-200">
            Hands-on progression across Full Stack, Gen AI, and CMS systems. Click a card to center or highlight.
          </p>
        </div>

        {journey.length > 1 && (
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollByCard('prev')}
              aria-label="Previous experience milestone"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200/80 bg-white/85 text-stone-900 shadow-xs backdrop-blur-md transition hover:border-[#EA580C]/50 hover:text-[#EA580C] dark:border-stone-800/80 dark:bg-[#1A1918]/80 dark:text-stone-100 dark:hover:border-orange-500/50 dark:hover:text-orange-400"
            >
              <ChevronLeft size={16} />
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollByCard('next')}
              aria-label="Next experience milestone"
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
        {journey.map((item) => {
          const title = decodeHtmlEntities(item.title.rendered);
          const focusArea = item.acf?.focus_area
            ? decodeHtmlEntities(item.acf.focus_area)
            : null;
          const isSelected = selectedId === item.id;

          return (
            <motion.div
              key={item.id}
              whileTap={{ scale: 0.99 }}
              onClickCapture={(e) => centerIfPartiallyHidden(e, trackRef.current)}
              onClick={() => setSelectedId(isSelected ? null : item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedId(isSelected ? null : item.id);
                }
              }}
              className={`flex w-[88%] shrink-0 snap-start cursor-pointer flex-col justify-between rounded-2xl border bg-white/85 p-5 backdrop-blur-md transition-all duration-300 dark:bg-[#1A1918]/80 sm:w-[calc(50%-8px)] lg:w-[44%] ${
                isSelected
                  ? 'border-[#EA580C]/55 shadow-md ring-2 ring-[#EA580C]/10 dark:border-orange-500/60 dark:ring-orange-500/15'
                  : 'border-stone-200/80 shadow-sm hover:-translate-y-0.5 hover:border-[#EA580C]/40 hover:shadow-md dark:border-stone-800/80 dark:hover:border-orange-500/45'
              }`}
            >
              <div>
                <div className="flex flex-wrap items-start justify-between gap-2.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isSelected
                            ? 'bg-[#EA580C] dark:bg-orange-500'
                            : 'bg-stone-300 dark:bg-stone-600'
                        }`}
                      />
                      <h3 className="text-base font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-lg">
                        {title}
                      </h3>
                    </div>
                    {focusArea && (
                      <p className="font-mono text-xs text-[#EA580C] dark:text-orange-500">
                        {focusArea}
                      </p>
                    )}
                  </div>

                  {item.acf?.duration_since && (
                    <span className="shrink-0 rounded-full border border-stone-200/80 bg-[#F5F5F4] px-2.5 py-0.5 font-mono text-[11px] font-medium text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300">
                      {item.acf.duration_since}
                    </span>
                  )}
                </div>

                {item.content?.rendered && (
                  <div
                    className={`wp-content mt-3.5 border-t border-stone-200/60 pt-3 text-sm text-stone-700 dark:border-stone-800/80 dark:text-stone-300 ${
                      isSelected ? '' : 'line-clamp-3'
                    }`}
                    dangerouslySetInnerHTML={{ __html: item.content.rendered }}
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
