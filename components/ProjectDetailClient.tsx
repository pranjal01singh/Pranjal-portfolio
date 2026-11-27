'use client';

import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
  Maximize2,
} from 'lucide-react';
import { WPProject, decodeHtmlEntities, getProjectImages } from '../lib/wordpress';
import { GitHubIcon } from './BrandIcons';
import { centerIfPartiallyHidden, scrollTrackByCard } from './sliderUtils';
import DocumentPreviewModal from './DocumentPreviewModal';

interface ProjectDetailClientProps {
  project: WPProject;
}

export default function ProjectDetailClient({ project }: ProjectDetailClientProps) {
  const galleryRef = useRef<HTMLDivElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const title = decodeHtmlEntities(project.title.rendered);
  const images = getProjectImages(project);
  const techList = project.acf?.tech_stack
    ? project.acf.tech_stack
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const scrollGallery = useCallback((direction: 'prev' | 'next') => {
    scrollTrackByCard(galleryRef.current, direction, 16);
  }, []);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8"
    >
      {/* Back Navigation */}
      <Link
        href="/#projects"
        className="mb-7 inline-flex items-center gap-2 rounded-lg border border-stone-200/80 bg-white/85 px-3.5 py-2 font-mono text-xs text-stone-700 shadow-sm backdrop-blur-md transition hover:border-[#EA580C]/40 hover:text-[#EA580C] dark:border-stone-800/80 dark:bg-[#1A1918]/80 dark:text-stone-300 dark:hover:border-orange-500/45 dark:hover:text-orange-400"
      >
        <ArrowLeft size={14} />
        <span>Back to Portfolio</span>
      </Link>

      {/* Editorial Header */}
      <header className="space-y-5 border-b border-stone-200/80 pb-7 dark:border-stone-800/80">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#EA580C]/25 bg-orange-50 px-3 py-1 font-mono text-xs text-[#EA580C] dark:border-orange-500/30 dark:bg-orange-500/15 dark:text-orange-400">
            <Layers size={12} />
            Project Case Study
          </span>
          {project.acf?.is_featured && (
            <span className="rounded-full border border-[#059669]/25 bg-[#059669]/10 px-3 py-1 font-mono text-xs font-medium text-[#059669] dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400">
              Featured
            </span>
          )}
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-5xl">
          {title}
        </h1>

        {techList.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {techList.map((tech, idx) => (
              <span
                key={idx}
                className="rounded-md border border-stone-200/80 bg-[#F5F5F4] px-3 py-1 font-mono text-xs text-stone-700 dark:border-stone-800 dark:bg-stone-900/90 dark:text-stone-300"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {(project.acf?.github_url || project.acf?.live_demo_url) && (
          <div className="flex flex-wrap gap-3 pt-1">
            {project.acf?.live_demo_url && (
              <motion.a
                whileTap={{ scale: 0.97 }}
                href={project.acf.live_demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#EA580C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-orange-700 hover:shadow-md dark:bg-orange-500 dark:hover:bg-orange-600"
              >
                <ExternalLink size={15} />
                <span>Live Demo</span>
              </motion.a>
            )}
            {project.acf?.github_url && (
              <motion.a
                whileTap={{ scale: 0.97 }}
                href={project.acf.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-stone-200/80 bg-white/85 px-5 py-2.5 text-sm font-medium text-stone-900 shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 hover:border-[#EA580C]/40 hover:text-[#EA580C] hover:shadow-md dark:border-stone-800/80 dark:bg-[#1A1918]/80 dark:text-stone-100 dark:hover:border-orange-500/45 dark:hover:text-orange-400"
              >
                <GitHubIcon size={15} />
                <span>GitHub Code</span>
              </motion.a>
            )}
          </div>
        )}
      </header>

      {/* Horizontal Scrollable Project Screenshots Gallery */}
      <section className="mt-8 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#EA580C] dark:text-orange-500">
              Project Screenshots ({images.length})
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Scroll horizontally or click any screenshot to view it enlarged.
            </p>
          </div>

          {images.length > 1 && (
            <div className="flex items-center gap-1.5">
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollGallery('prev')}
                aria-label="Previous screenshot"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200/80 bg-white/85 text-stone-900 shadow-xs backdrop-blur-md transition hover:border-[#EA580C]/50 hover:text-[#EA580C] dark:border-stone-800/80 dark:bg-[#1A1918]/80 dark:text-stone-100 dark:hover:border-orange-500/50 dark:hover:text-orange-400"
              >
                <ChevronLeft size={16} />
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollGallery('next')}
                aria-label="Next screenshot"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200/80 bg-white/85 text-stone-900 shadow-xs backdrop-blur-md transition hover:border-[#EA580C]/50 hover:text-[#EA580C] dark:border-stone-800/80 dark:bg-[#1A1918]/80 dark:text-stone-100 dark:hover:border-orange-500/50 dark:hover:text-orange-400"
              >
                <ChevronRight size={16} />
              </motion.button>
            </div>
          )}
        </div>

        {images.length > 0 ? (
          <div
            ref={galleryRef}
            className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth py-1"
          >
            {images.map((imgUrl, idx) => (
              <button
                key={imgUrl}
                type="button"
                onClickCapture={(e) => centerIfPartiallyHidden(e, galleryRef.current)}
                onClick={() => setLightboxIndex(idx)}
                aria-label={`Enlarge ${title} screenshot ${idx + 1}`}
                className={`group bg-dot-pattern relative shrink-0 snap-start cursor-pointer overflow-hidden rounded-2xl border border-stone-200/80 bg-white/85 p-3 text-left shadow-sm backdrop-blur-md transition-all duration-300 hover:border-[#EA580C]/45 hover:shadow-md dark:border-stone-800/80 dark:bg-[#1A1918]/80 dark:hover:border-orange-500/45 ${
                  images.length === 1 ? 'w-full' : 'w-[86%] sm:w-[68%]'
                }`}
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-stone-200/80 bg-white dark:border-stone-800 dark:bg-stone-950">
                  <Image
                    src={imgUrl}
                    alt={`${title} screenshot ${idx + 1}`}
                    fill
                    sizes="(max-width: 768px) 88vw, 760px"
                    priority={idx === 0}
                    className="object-contain p-2 transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>

                <div className="mt-2.5 flex items-center justify-between px-1">
                  <span className="font-mono text-[11px] text-stone-600 dark:text-stone-400">
                    Screenshot {idx + 1} of {images.length}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-stone-200/80 bg-white px-2.5 py-1 font-mono text-[11px] font-medium text-stone-900 transition group-hover:border-[#EA580C]/40 group-hover:text-[#EA580C] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:group-hover:border-orange-500/45 dark:group-hover:text-orange-400">
                    <Maximize2 size={11} className="text-[#EA580C] dark:text-orange-500" />
                    <span>Click to enlarge</span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-dot-pattern relative flex aspect-video w-full flex-col justify-between overflow-hidden rounded-2xl border border-stone-200/80 bg-white/85 p-8 shadow-sm backdrop-blur-md dark:border-stone-800/80 dark:bg-[#1A1918]/80">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/[0.06] via-transparent to-stone-200/40 dark:to-stone-800/30" />
            <div className="relative">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200/80 bg-white px-3 py-1 font-mono text-xs text-stone-700 shadow-xs dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300">
                <Layers size={13} className="text-[#EA580C] dark:text-orange-500" />
                Case Study Preview
              </span>
            </div>
            <div className="relative">
              <p className="font-mono text-xs text-stone-400 dark:text-stone-500">
                /{project.slug}
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                {title}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Case Study Content */}
      <div className="mt-8 rounded-2xl border border-stone-200/80 bg-white/85 p-6 shadow-sm backdrop-blur-md dark:border-stone-800/80 dark:bg-[#1A1918]/80 sm:p-8">
        <h2 className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#EA580C] dark:text-orange-500">
          Architecture &amp; Highlights
        </h2>
        <div
          className="wp-content text-base text-stone-700 dark:text-stone-300"
          dangerouslySetInnerHTML={{ __html: project.content.rendered }}
        />
      </div>

      {/* Fullscreen Screenshot Lightbox */}
      <DocumentPreviewModal
        document={
          lightboxIndex !== null && images[lightboxIndex]
            ? {
                title,
                subtitle: `Screenshot ${lightboxIndex + 1} of ${images.length}`,
                url: images[lightboxIndex],
              }
            : null
        }
        counter={
          lightboxIndex !== null && images.length > 1
            ? `${lightboxIndex + 1} / ${images.length}`
            : undefined
        }
        onPrev={
          lightboxIndex !== null && images.length > 1
            ? () =>
                setLightboxIndex((prev) =>
                  prev !== null
                    ? (prev - 1 + images.length) % images.length
                    : null
                )
            : undefined
        }
        onNext={
          lightboxIndex !== null && images.length > 1
            ? () =>
                setLightboxIndex((prev) =>
                  prev !== null ? (prev + 1) % images.length : null
                )
            : undefined
        }
        onClose={() => setLightboxIndex(null)}
      />
    </motion.article>
  );
}
