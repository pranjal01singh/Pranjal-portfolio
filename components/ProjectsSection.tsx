'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
  Maximize2,
} from 'lucide-react';
import {
  WPProject,
  decodeHtmlEntities,
  getProjectImages,
  stripHtml,
} from '../lib/wordpress';
import { GitHubIcon } from './BrandIcons';
import { centerIfPartiallyHidden, scrollTrackByCard } from './sliderUtils';
import DocumentPreviewModal from './DocumentPreviewModal';

interface ProjectsSectionProps {
  projects: WPProject[];
}

interface ActiveLightbox {
  title: string;
  subtitle: string;
  images: string[];
  index: number;
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [selectedTech, setSelectedTech] = useState<string>('All');
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [lightbox, setLightbox] = useState<ActiveLightbox | null>(null);

  const filterPills = useMemo(() => {
    const counts = new Map<string, number>();
    projects.forEach((project) => {
      const stack = project.acf?.tech_stack;
      if (!stack) return;
      const uniqueInProject = new Set(
        stack
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      );
      uniqueInProject.forEach((tech) => {
        counts.set(tech, (counts.get(tech) || 0) + 1);
      });
    });

    const topTechs = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tech]) => tech);

    return ['All', ...topTechs];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (selectedTech === 'All') return projects;
    return projects.filter((project) => {
      const techs = project.acf?.tech_stack
        ? project.acf.tech_stack.split(',').map((t) => t.trim().toLowerCase())
        : [];
      return techs.includes(selectedTech.toLowerCase());
    });
  }, [projects, selectedTech]);

  const scrollByCard = useCallback((direction: 'prev' | 'next') => {
    scrollTrackByCard(trackRef.current, direction, 16);
  }, []);

  useEffect(() => {
    if (isPaused || lightbox !== null || filteredProjects.length <= 1) return;
    const interval = setInterval(() => {
      scrollByCard('next');
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, lightbox, filteredProjects.length, scrollByCard]);

  const handleTrackScroll = () => {
    const container = trackRef.current;
    if (!container) return;
    const cards = Array.from(container.children) as HTMLElement[];
    if (cards.length === 0) return;

    const containerLeft = container.scrollLeft;
    let closestIdx = 0;
    let closestDist = Infinity;

    cards.forEach((card, idx) => {
      const dist = Math.abs(card.offsetLeft - container.offsetLeft - containerLeft);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = idx;
      }
    });

    setActiveIndex(closestIdx);
  };

  const scrollToCard = (idx: number) => {
    const container = trackRef.current;
    if (!container) return;
    const target = container.children[idx] as HTMLElement | undefined;
    if (!target) return;
    target.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
    setActiveIndex(idx);
  };

  const handleFilterChange = (tech: string) => {
    setSelectedTech(tech);
    setActiveIndex(0);
    trackRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
  };

  const safeActiveIndex = Math.min(
    activeIndex,
    Math.max(0, filteredProjects.length - 1)
  );

  return (
    <section id="projects" className="scroll-mt-20 py-10 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 'some' }}
        transition={{ duration: 0.45 }}
        className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
      >
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#EA580C] dark:text-orange-500">
            01 / Selected Work
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 [text-shadow:0_1px_10px_rgba(250,249,246,0.7)] dark:text-stone-100 dark:[text-shadow:0_2px_12px_rgba(15,14,13,0.8)] sm:text-4xl">
            Featured Projects
          </h2>
          <p className="max-w-xl text-sm font-medium text-stone-800 dark:text-stone-200">
            Filter by stack or click any peeking card to center it. Click an image to enlarge.
          </p>
        </div>

        {/* Filter Pills + Arrow Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 md:justify-end">
          {filterPills.length > 1 && (
            <div
              role="tablist"
              aria-label="Filter projects by technology"
              className="flex flex-wrap items-center gap-1.5"
            >
              {filterPills.map((tech) => {
                const isActive = selectedTech === tech;
                return (
                  <motion.button
                    key={tech}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleFilterChange(tech)}
                    className={`rounded-full border px-3 py-1 font-mono text-xs font-medium backdrop-blur-md transition-colors ${
                      isActive
                        ? 'border-[#EA580C] bg-[#EA580C] text-white shadow-sm dark:border-orange-500 dark:bg-orange-500 dark:text-stone-950'
                        : 'border-stone-200/80 bg-white/85 text-stone-700 hover:border-[#EA580C]/40 hover:text-[#EA580C] dark:border-stone-800/80 dark:bg-[#1A1918]/80 dark:text-stone-300 dark:hover:border-orange-500/40 dark:hover:text-orange-400'
                    }`}
                  >
                    {tech}
                  </motion.button>
                );
              })}
            </div>
          )}

          {filteredProjects.length > 1 && (
            <div className="flex items-center gap-1.5">
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollByCard('prev')}
                aria-label="Previous project"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200/80 bg-white/85 text-stone-900 shadow-xs backdrop-blur-md transition hover:border-[#EA580C]/50 hover:text-[#EA580C] dark:border-stone-800/80 dark:bg-[#1A1918]/80 dark:text-stone-100 dark:hover:border-orange-500/50 dark:hover:text-orange-400"
              >
                <ChevronLeft size={16} />
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollByCard('next')}
                aria-label="Next project"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200/80 bg-white/85 text-stone-900 shadow-xs backdrop-blur-md transition hover:border-[#EA580C]/50 hover:text-[#EA580C] dark:border-stone-800/80 dark:bg-[#1A1918]/80 dark:text-stone-100 dark:hover:border-orange-500/50 dark:hover:text-orange-400"
              >
                <ChevronRight size={16} />
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Horizontal Snap Scroll Carousel */}
      <div
        ref={trackRef}
        onScroll={handleTrackScroll}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={() => setIsPaused(false)}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth py-2"
      >
        {filteredProjects.map((project) => {
          const title = decodeHtmlEntities(project.title.rendered);
          const excerptText = stripHtml(
            project.excerpt?.rendered || project.content.rendered
          );
          const featuredImg =
            project._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
            getProjectImages(project)[0];
          const techList = project.acf?.tech_stack
            ? project.acf.tech_stack
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean)
            : [];

          return (
            <article
              key={project.id}
              onClickCapture={(e) => centerIfPartiallyHidden(e, trackRef.current)}
              className="group flex w-[88%] shrink-0 snap-start cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-stone-200/80 bg-white/85 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#EA580C]/40 hover:shadow-md dark:border-stone-800/80 dark:bg-[#1A1918]/80 dark:hover:border-orange-500/45 sm:w-[calc(50%-8px)] lg:w-[46%]"
            >
              <div>
                {/* Single Clean Featured Image Preview (Uncropped object-contain) */}
                <div className="bg-dot-pattern relative aspect-video w-full overflow-hidden border-b border-stone-200/80 bg-[#FAF9F6]/90 dark:border-stone-800/80 dark:bg-stone-900/80">
                  {featuredImg ? (
                    <button
                      type="button"
                      onClick={() =>
                        setLightbox({
                          title,
                          subtitle: 'Featured Preview',
                          images: [featuredImg],
                          index: 0,
                        })
                      }
                      aria-label={`Enlarge ${title} preview`}
                      className="relative block h-full w-full p-2.5 focus:outline-none"
                    >
                      <div className="relative h-full w-full overflow-hidden rounded-lg border border-stone-200/80 bg-white shadow-xs dark:border-stone-800 dark:bg-stone-950">
                        <Image
                          src={featuredImg}
                          alt={title}
                          fill
                          sizes="(max-width: 768px) 84vw, 44vw"
                          draggable={false}
                          className="object-contain p-1 transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      </div>
                      <span className="pointer-events-none absolute right-4 bottom-4 inline-flex items-center gap-1 rounded-md border border-stone-200/80 bg-white/95 px-2 py-1 font-mono text-[10px] font-medium text-stone-900 opacity-90 shadow-xs backdrop-blur-sm transition-opacity group-hover:opacity-100 dark:border-stone-700 dark:bg-stone-900/95 dark:text-stone-100">
                        <Maximize2 size={10} className="text-[#EA580C] dark:text-orange-500" />
                        Enlarge
                      </span>
                    </button>
                  ) : (
                    <Link
                      href={`/projects/${project.slug}`}
                      className="relative flex h-full w-full flex-col justify-between p-5"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.06] via-transparent to-stone-200/40 dark:to-stone-800/30" />
                      <div className="relative flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200/80 bg-white px-2.5 py-1 font-mono text-[11px] text-stone-700 shadow-xs dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300">
                          <Layers size={12} className="text-[#EA580C] dark:text-orange-500" />
                          Case Study
                        </span>
                        {project.acf?.is_featured && (
                          <span className="rounded-full border border-[#059669]/25 bg-[#059669]/10 px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-[#059669] dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400">
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <p className="font-mono text-xs text-stone-400 dark:text-stone-500">
                          /{project.slug}
                        </p>
                        <p className="mt-1 line-clamp-1 text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100">
                          {title}
                        </p>
                      </div>
                    </Link>
                  )}
                </div>

                {/* Card Body */}
                <div className="space-y-3 p-5">
                  <Link
                    href={`/projects/${project.slug}`}
                    className="block text-lg font-bold tracking-tight text-stone-900 transition-colors group-hover:text-[#EA580C] dark:text-stone-100 dark:group-hover:text-orange-400 sm:text-xl"
                  >
                    {title}
                  </Link>

                  <p className="line-clamp-2 text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                    {excerptText}
                  </p>

                  {techList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {techList.slice(0, 6).map((tech, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() =>
                            handleFilterChange(
                              filterPills.includes(tech) ? tech : 'All'
                            )
                          }
                          className={`rounded-md border px-2 py-0.5 font-mono text-[11px] transition-colors ${
                            selectedTech === tech
                              ? 'border-[#EA580C]/40 bg-orange-50 text-[#EA580C] dark:border-orange-500/40 dark:bg-orange-500/15 dark:text-orange-400'
                              : 'border-stone-200/80 bg-[#F5F5F4] text-stone-700 dark:border-stone-800 dark:bg-stone-900/90 dark:text-stone-300'
                          }`}
                        >
                          {tech}
                        </button>
                      ))}
                      {techList.length > 6 && (
                        <span className="rounded-md border border-stone-200/80 bg-[#FAF9F6] px-2 py-0.5 font-mono text-[11px] text-stone-500 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
                          +{techList.length - 6}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200/80 bg-[#FAF9F6]/70 px-5 py-3.5 text-xs font-medium dark:border-stone-800/80 dark:bg-stone-900/50">
                <div className="flex items-center gap-4">
                  {project.acf?.github_url && (
                    <a
                      href={project.acf.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-stone-700 transition hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100"
                    >
                      <GitHubIcon size={14} />
                      <span>GitHub Code</span>
                    </a>
                  )}
                  {project.acf?.live_demo_url && (
                    <a
                      href={project.acf.live_demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-semibold text-[#EA580C] transition hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400"
                    >
                      <ExternalLink size={14} />
                      <span>Live Demo</span>
                    </a>
                  )}
                </div>

                <Link
                  href={`/projects/${project.slug}`}
                  className="inline-flex items-center gap-1 font-mono text-xs font-medium text-stone-900 transition-all hover:gap-2 hover:text-[#EA580C] dark:text-stone-100 dark:hover:text-orange-400"
                >
                  <span>View Details</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {/* Dot Indicators */}
      {filteredProjects.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {filteredProjects.map((project, idx) => {
            const active = idx === safeActiveIndex;
            return (
              <button
                key={project.id}
                type="button"
                aria-label={`Center project ${idx + 1}`}
                onClick={() => scrollToCard(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  active
                    ? 'w-7 bg-[#EA580C] dark:bg-orange-500'
                    : 'w-2 bg-stone-300 hover:bg-stone-400 dark:bg-stone-700 dark:hover:bg-stone-600'
                }`}
              />
            );
          })}
        </div>
      )}

      {/* Fullscreen Lightbox for Project Screenshots */}
      <DocumentPreviewModal
        document={
          lightbox
            ? {
                title: lightbox.title,
                subtitle: lightbox.subtitle,
                url: lightbox.images[lightbox.index],
              }
            : null
        }
        counter={
          lightbox && lightbox.images.length > 1
            ? `${lightbox.index + 1} / ${lightbox.images.length}`
            : undefined
        }
        onPrev={
          lightbox && lightbox.images.length > 1
            ? () =>
                setLightbox((prev) =>
                  prev
                    ? {
                        ...prev,
                        index:
                          (prev.index - 1 + prev.images.length) %
                          prev.images.length,
                      }
                    : null
                )
            : undefined
        }
        onNext={
          lightbox && lightbox.images.length > 1
            ? () =>
                setLightbox((prev) =>
                  prev
                    ? {
                        ...prev,
                        index: (prev.index + 1) % prev.images.length,
                      }
                    : null
                )
            : undefined
        }
        onClose={() => setLightbox(null)}
      />
    </section>
  );
}
