'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { isImageUrl, isPdfUrl } from '../lib/wordpress';

export interface PreviewDocument {
  title: string;
  subtitle?: string;
  url: string;
}

interface DocumentPreviewModalProps {
  document: PreviewDocument | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  counter?: string;
}

export default function DocumentPreviewModal({
  document,
  onClose,
  onPrev,
  onNext,
  counter,
}: DocumentPreviewModalProps) {
  useEffect(() => {
    if (!document) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft' && onPrev) {
        e.preventDefault();
        onPrev();
      } else if (e.key === 'ArrowRight' && onNext) {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [document, onClose, onPrev, onNext]);

  const isPdf = document ? isPdfUrl(document.url) : false;
  const isImage = document ? isImageUrl(document.url) : false;

  return (
    <AnimatePresence>
      {document && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Preview: ${document.title}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm dark:bg-black/75 sm:p-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-[#FAF9F6] shadow-2xl dark:border-stone-800/80 dark:bg-[#1A1918]"
          >
            {/* Modal Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 bg-white px-5 py-3.5 dark:border-stone-800/80 dark:bg-stone-900/80">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-stone-200/80 bg-[#FAF9F6] text-[#EA580C] dark:border-stone-700 dark:bg-stone-800 dark:text-orange-500">
                  {isImage ? <ImageIcon size={17} /> : <FileText size={17} />}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-bold tracking-tight text-[#1C1917] dark:text-stone-100 sm:text-base">
                      {document.title}
                    </h3>
                    {counter && (
                      <span className="shrink-0 rounded-full border border-stone-200/80 bg-[#F5F5F4] px-2 py-0.5 font-mono text-[11px] text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300">
                        {counter}
                      </span>
                    )}
                  </div>
                  {document.subtitle && (
                    <p className="truncate font-mono text-xs text-stone-600 dark:text-stone-400">
                      {document.subtitle}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onPrev && onNext && (
                  <div className="flex items-center gap-1 pr-1">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={onPrev}
                      aria-label="Previous image"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200/80 bg-white text-[#1C1917] transition hover:border-[#EA580C]/40 hover:text-[#EA580C] dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:hover:border-orange-500/40 dark:hover:text-orange-400"
                    >
                      <ChevronLeft size={16} />
                    </motion.button>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={onNext}
                      aria-label="Next image"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200/80 bg-white text-[#1C1917] transition hover:border-[#EA580C]/40 hover:text-[#EA580C] dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:hover:border-orange-500/40 dark:hover:text-orange-400"
                    >
                      <ChevronRight size={16} />
                    </motion.button>
                  </div>
                )}

                <motion.a
                  whileTap={{ scale: 0.97 }}
                  href={document.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200/80 bg-[#F5F5F4] px-3 py-2 font-mono text-xs font-medium text-[#1C1917] transition hover:border-[#EA580C]/40 hover:text-[#EA580C] dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:border-orange-500/40 dark:hover:text-orange-400"
                >
                  <span>Open in New Tab</span>
                  <ExternalLink size={13} />
                </motion.a>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  aria-label="Close document preview"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200/80 bg-white text-stone-600 transition hover:border-[#EA580C]/40 hover:text-[#1C1917] dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:border-orange-500/40 dark:hover:text-stone-100"
                >
                  <X size={16} />
                </motion.button>
              </div>
            </div>

            {/* Modal Viewer Body */}
            <div className="flex flex-1 flex-col items-center justify-center overflow-auto p-4 sm:p-6">
              {isPdf ? (
                <div className="w-full space-y-3">
                  <iframe
                    src={document.url}
                    title={document.title}
                    className="h-[68vh] w-full rounded-xl border border-stone-200/80 bg-white shadow-xs dark:border-stone-800"
                  />
                  <p className="text-center font-mono text-[11px] text-stone-600 dark:text-stone-400">
                    If the inline PDF viewer is blocked by browser settings, use{' '}
                    <a
                      href={document.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#EA580C] underline underline-offset-2 dark:text-orange-400"
                    >
                      Open in New Tab
                    </a>
                    .
                  </p>
                </div>
              ) : isImage ? (
                <div className="relative flex w-full items-center justify-center">
                  <Image
                    src={document.url}
                    alt={document.title}
                    width={1920}
                    height={1200}
                    className="max-h-[75vh] w-auto max-w-full rounded-xl border border-stone-200/80 bg-white object-contain shadow-sm dark:border-stone-800 dark:bg-stone-900"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 py-12 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-stone-200/80 bg-white text-[#EA580C] shadow-xs dark:border-stone-800 dark:bg-stone-900 dark:text-orange-500">
                    <ExternalLink size={20} />
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#1C1917] dark:text-stone-100">
                      External Verification Link
                    </p>
                    <p className="max-w-md text-xs text-stone-600 dark:text-stone-400">
                      This credential points to an external verification URL. Open it in a new tab to inspect the document.
                    </p>
                  </div>
                  <a
                    href={document.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#EA580C] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600"
                  >
                    <span>Open Verification Document</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
