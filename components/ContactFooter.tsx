'use client';

import { motion } from 'framer-motion';
import { Copy, Mail, MapPin, Send } from 'lucide-react';
import { WPProfile } from '../lib/wordpress';
import { GitHubIcon, LinkedInIcon } from './BrandIcons';
import { usePortfolioUI } from './PortfolioUIProvider';

interface ContactFooterProps {
  profile: WPProfile | null;
}

export default function ContactFooter({ profile }: ContactFooterProps) {
  const contact = profile?.acf || {};
  const { copyEmail } = usePortfolioUI();

  return (
    <footer id="contact" className="scroll-mt-24 pt-10 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 'some' }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-stone-200/80 bg-white/85 p-8 shadow-sm backdrop-blur-md dark:border-stone-800/80 dark:bg-[#1A1918]/80 sm:p-12"
      >
        {/* Subtle Warm Editorial Accent */}
        <div className="pointer-events-none absolute -top-24 right-0 h-56 w-80 rounded-full bg-[#EA580C]/[0.06] blur-3xl dark:bg-orange-500/[0.1]" />

        <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-xl space-y-3">
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#EA580C] dark:text-orange-500">
              05 / Get In Touch
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-4xl">
              Let&apos;s Build Something Together
            </h2>
            <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300 sm:text-base">
              Actively seeking Full Stack (MERN / Next.js) and Generative AI engineering internships or entry-level roles. Let&apos;s connect!
            </p>
            {contact.location && (
              <p className="inline-flex items-center gap-1.5 pt-1 font-mono text-xs text-stone-600 dark:text-stone-400">
                <MapPin size={13} className="text-[#EA580C] dark:text-orange-500" />
                <span>{contact.location}</span>
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            {contact.email && (
              <div className="flex flex-wrap items-center gap-2.5">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => copyEmail(contact.email)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#EA580C] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-orange-700 hover:shadow-md dark:bg-orange-500 dark:hover:bg-orange-600"
                >
                  <Copy size={15} />
                  <span>Copy Email</span>
                </motion.button>

                <motion.a
                  whileTap={{ scale: 0.97 }}
                  href={`mailto:${contact.email}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-stone-200/80 bg-[#F5F5F4] px-4 py-3 font-mono text-xs text-stone-700 transition hover:border-[#EA580C]/40 hover:text-stone-900 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-orange-500/45 dark:hover:text-stone-100"
                >
                  <Send size={14} className="text-[#EA580C] dark:text-orange-500" />
                  <span>{contact.email}</span>
                </motion.a>
              </div>
            )}

            <div className="flex items-center gap-2.5 pt-1">
              {contact.github_profile && (
                <motion.a
                  whileTap={{ scale: 0.97 }}
                  href={contact.github_profile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-stone-200/80 bg-[#FAF9F6] px-3.5 py-2 text-xs font-medium text-stone-700 transition hover:border-[#EA580C]/40 hover:text-[#EA580C] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-orange-500/45 dark:hover:text-orange-400"
                >
                  <GitHubIcon size={15} />
                  <span>GitHub</span>
                </motion.a>
              )}
              {contact.linkedin_profile && (
                <motion.a
                  whileTap={{ scale: 0.97 }}
                  href={contact.linkedin_profile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-stone-200/80 bg-[#FAF9F6] px-3.5 py-2 text-xs font-medium text-stone-700 transition hover:border-[#EA580C]/40 hover:text-[#EA580C] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-orange-500/45 dark:hover:text-orange-400"
                >
                  <LinkedInIcon size={15} />
                  <span>LinkedIn</span>
                </motion.a>
              )}
              {contact.email && (
                <motion.a
                  whileTap={{ scale: 0.97 }}
                  href={`mailto:${contact.email}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-stone-200/80 bg-[#FAF9F6] px-3.5 py-2 text-xs font-medium text-stone-700 transition hover:border-[#EA580C]/40 hover:text-[#EA580C] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-orange-500/45 dark:hover:text-orange-400 sm:hidden"
                >
                  <Mail size={15} />
                  <span>Mail App</span>
                </motion.a>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mt-8 flex flex-col items-center justify-between gap-3 rounded-2xl border border-stone-200/80 bg-white/75 px-5 py-4 text-xs text-stone-600 backdrop-blur-md dark:border-stone-800/80 dark:bg-[#1A1918]/75 dark:text-stone-400 sm:flex-row">
        <p className="font-mono">
          &copy; 2026 Pranjal Singh. Built with Next.js 16 &amp; Headless WordPress.
        </p>
        <p className="font-mono text-stone-500 dark:text-stone-400">
          Full Stack (MERN) &bull; Gen AI &bull; Automation
        </p>
      </div>
    </footer>
  );
}
