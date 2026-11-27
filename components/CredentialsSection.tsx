'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Award,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  GraduationCap,
} from 'lucide-react';
import {
  WPCredential,
  decodeHtmlEntities,
  isImageUrl,
  isPdfUrl,
} from '../lib/wordpress';
import { centerIfPartiallyHidden, scrollTrackByCard } from './sliderUtils';
import DocumentPreviewModal, {
  type PreviewDocument,
} from './DocumentPreviewModal';

interface CredentialsSectionProps {
  credentials: WPCredential[];
}

export default function CredentialsSection({ credentials }: CredentialsSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<PreviewDocument | null>(null);

  const scrollByCard = useCallback((direction: 'prev' | 'next') => {
    scrollTrackByCard(trackRef.current, direction, 16);
  }, []);

  useEffect(() => {
    if (isPaused || previewDoc !== null || credentials.length <= 1) return;
    const timer = setInterval(() => {
      scrollByCard('next');
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, previewDoc, credentials.length, scrollByCard]);

  return (
    <section id="credentials" className="scroll-mt-20 py-10 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 'some' }}
        transition={{ duration: 0.45 }}
        className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#EA580C] dark:text-orange-500">
            04 / Academic &amp; Verified
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 [text-shadow:0_1px_10px_rgba(250,249,246,0.7)] dark:text-stone-100 dark:[text-shadow:0_2px_12px_rgba(15,14,13,0.8)] sm:text-4xl">
            Education &amp; Certificates
          </h2>
          <p className="max-w-2xl text-sm font-medium text-stone-800 dark:text-stone-200">
            Preview certificates and marksheets directly, or click any peeking card to center it.
          </p>
        </div>

        {credentials.length > 1 && (
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollByCard('prev')}
              aria-label="Previous credential"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200/80 bg-white/85 text-stone-900 shadow-xs backdrop-blur-md transition hover:border-[#EA580C]/50 hover:text-[#EA580C] dark:border-stone-800/80 dark:bg-[#1A1918]/80 dark:text-stone-100 dark:hover:border-orange-500/50 dark:hover:text-orange-400"
            >
              <ChevronLeft size={16} />
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollByCard('next')}
              aria-label="Next credential"
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
        {credentials.map((cred) => {
          const isEdu = cred.acf?.type === 'Education';
          const title = decodeHtmlEntities(cred.title.rendered);
          const issuer = cred.acf?.issuer_college
            ? decodeHtmlEntities(cred.acf.issuer_college)
            : '';
          const docUrl = cred.acf?.verify_doc_url?.trim() || '';
          const isImgDoc = isImageUrl(docUrl);
          const isPdfDoc = isPdfUrl(docUrl);
          const subtitle = [issuer, cred.acf?.year].filter(Boolean).join(' • ');

          const openPreview = () => {
            if (!docUrl) return;
            setPreviewDoc({ title, subtitle, url: docUrl });
          };

          return (
            <div
              key={cred.id}
              onClickCapture={(e) => centerIfPartiallyHidden(e, trackRef.current)}
              className="group flex w-[88%] shrink-0 snap-start cursor-pointer flex-col justify-between gap-4 rounded-2xl border border-stone-200/80 bg-white/85 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#EA580C]/40 hover:shadow-md dark:border-stone-800/80 dark:bg-[#1A1918]/80 dark:hover:border-orange-500/45 sm:w-[calc(50%-8px)] lg:w-[44%]"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <span
                      className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                        isEdu
                          ? 'border-[#EA580C]/20 bg-orange-50 text-[#EA580C] dark:border-orange-500/30 dark:bg-orange-500/15 dark:text-orange-400'
                          : 'border-[#059669]/25 bg-[#059669]/10 text-[#059669] dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400'
                      }`}
                    >
                      {isEdu ? <GraduationCap size={19} /> : <Award size={19} />}
                    </span>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider ${
                            isEdu
                              ? 'bg-orange-50 text-[#EA580C] dark:bg-orange-500/15 dark:text-orange-400'
                              : 'bg-[#059669]/10 text-[#059669] dark:bg-emerald-500/15 dark:text-emerald-400'
                          }`}
                        >
                          {cred.acf?.type || 'Credential'}
                        </span>
                        {cred.acf?.year && (
                          <span className="font-mono text-xs text-stone-600 dark:text-stone-400">
                            {cred.acf.year}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-lg">
                        {title}
                      </h3>

                      {issuer && (
                        <p className="text-sm text-stone-700 dark:text-stone-300">
                          {issuer}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Small Image Thumbnail Preview when verify_doc_url is an image */}
                {isImgDoc && (
                  <button
                    type="button"
                    onClick={openPreview}
                    aria-label={`Preview thumbnail for ${title}`}
                    className="relative block h-28 w-full overflow-hidden rounded-xl border border-stone-200/80 bg-[#FAF9F6] text-left dark:border-stone-800 dark:bg-stone-900"
                  >
                    <Image
                      src={docUrl}
                      alt={`${title} preview`}
                      fill
                      sizes="(max-width: 768px) 84vw, 40vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute right-2.5 bottom-2.5 inline-flex items-center gap-1 rounded-md border border-stone-200/80 bg-white/95 px-2 py-1 font-mono text-[10px] font-medium text-stone-900 shadow-xs backdrop-blur-sm dark:border-stone-700 dark:bg-stone-900/95 dark:text-stone-100">
                      <Eye size={11} className="text-[#EA580C] dark:text-orange-500" />
                      Click to enlarge
                    </span>
                  </button>
                )}
              </div>

              {docUrl && (
                <div className="flex items-center justify-between border-t border-stone-200/60 pt-3 dark:border-stone-800/80">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-stone-600 dark:text-stone-400">
                    <FileText size={12} className="text-[#EA580C] dark:text-orange-500" />
                    <span>
                      {isPdfDoc ? 'PDF Document' : isImgDoc ? 'Image Certificate' : 'Document Link'}
                    </span>
                  </span>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={openPreview}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200/80 bg-[#F5F5F4] px-3 py-1.5 font-mono text-xs font-medium text-stone-900 transition hover:border-[#EA580C]/40 hover:bg-orange-50 hover:text-[#EA580C] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:border-orange-500/45 dark:hover:bg-orange-500/15 dark:hover:text-orange-400"
                  >
                    <Eye size={13} />
                    <span>View Document</span>
                  </motion.button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Certificate & Marksheet Preview Modal (Lightbox) */}
      <DocumentPreviewModal
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
      />
    </section>
  );
}
