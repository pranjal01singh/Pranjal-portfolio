'use client';

import { motion } from 'framer-motion';
import { ArrowDownRight, FileText, Mail, MapPin, Sparkles } from 'lucide-react';
import { WPProfile } from '../lib/wordpress';
import { GitHubIcon, LinkedInIcon } from './BrandIcons';
import { usePortfolioUI } from './PortfolioUIProvider';

interface HeroSectionProps {
  profile: WPProfile | null;
}

export default function HeroSection({ profile }: HeroSectionProps) {
  const contact = profile?.acf || {};
  const { copyEmail } = usePortfolioUI();

  return (
    <section className="relative pt-10 pb-12 sm:pt-14 sm:pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="space-y-6"
      >
        {/* Status Badge - Soft Sage / Emerald */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-[#059669]/30 bg-white/85 px-3.5 py-1.5 text-xs font-semibold text-[#059669] shadow-xs backdrop-blur-md dark:border-emerald-500/30 dark:bg-[#1A1918]/80 dark:text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#059669] opacity-75 dark:bg-emerald-400" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#059669] dark:bg-emerald-400" />
          </span>
          <span>Available for Full Stack &amp; AI Roles</span>
        </div>

        {/* Editorial Headline */}
        <div className="space-y-4">
          <p className="inline-block rounded-md border border-stone-200/80 bg-white/85 px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#EA580C] backdrop-blur-md dark:border-stone-800/80 dark:bg-[#1A1918]/80 dark:text-orange-500">
            Full Stack Software Developer &bull; Gen AI &amp; Agents
          </p>
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-stone-900 [text-shadow:0_1px_12px_rgba(250,249,246,0.75)] dark:text-stone-100 dark:[text-shadow:0_2px_16px_rgba(15,14,13,0.85)] sm:text-5xl md:text-6xl md:leading-[1.08]">
            Hi, I&apos;m{' '}
            <span className="text-[#EA580C] dark:text-orange-500">Pranjal Singh</span>.
            <span className="mt-2 block text-2xl font-semibold text-stone-800 dark:text-stone-200 sm:text-3xl md:text-4xl">
              Building scalable MERN apps &amp; intelligent AI systems.
            </span>
          </h1>
        </div>

        {/* WordPress Profile Bio */}
        {profile?.content?.rendered && (
          <div
            className="wp-content max-w-2xl rounded-2xl border border-stone-200/80 bg-white/85 p-4 text-base text-stone-700 shadow-xs backdrop-blur-md dark:border-stone-800/80 dark:bg-[#1A1918]/80 dark:text-stone-300 sm:p-5 sm:text-lg"
            dangerouslySetInnerHTML={{ __html: profile.content.rendered }}
          />
        )}

        {/* CTAs & Social Icon Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <motion.a
            whileTap={{ scale: 0.97 }}
            href="#projects"
            className="inline-flex items-center gap-2 rounded-xl bg-[#EA580C] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-orange-700 hover:shadow-md dark:bg-orange-500 dark:hover:bg-orange-600"
          >
            <span>View Projects</span>
            <ArrowDownRight size={16} />
          </motion.a>

          {contact.resume_link ? (
            <motion.a
              whileTap={{ scale: 0.97 }}
              href={contact.resume_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-stone-200/80 bg-white/85 px-5 py-3 text-sm font-medium text-stone-900 shadow-sm backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-[#EA580C]/40 hover:text-[#EA580C] hover:shadow-md dark:border-stone-800/80 dark:bg-[#1A1918]/80 dark:text-stone-100 dark:hover:border-orange-500/50 dark:hover:text-orange-400"
            >
              <FileText size={16} className="text-[#EA580C] dark:text-orange-500" />
              <span>Resume</span>
            </motion.a>
          ) : (
            <motion.a
              whileTap={{ scale: 0.97 }}
              href="#contact"
              className="inline-flex items-center gap-2 rounded-xl border border-stone-200/80 bg-white/85 px-5 py-3 text-sm font-medium text-stone-900 shadow-sm backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-[#EA580C]/40 hover:text-[#EA580C] hover:shadow-md dark:border-stone-800/80 dark:bg-[#1A1918]/80 dark:text-stone-100 dark:hover:border-orange-500/50 dark:hover:text-orange-400"
            >
              <Sparkles size={16} className="text-[#EA580C] dark:text-orange-500" />
              <span>Get in Touch</span>
            </motion.a>
          )}

          {/* Social Icon Buttons */}
          <div className="flex items-center gap-2 sm:ml-2">
            {contact.github_profile && (
              <motion.a
                whileTap={{ scale: 0.97 }}
                href={contact.github_profile}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Profile"
                title="GitHub"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-stone-200/80 bg-white/85 text-stone-700 shadow-sm backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-[#EA580C]/40 hover:text-[#EA580C] hover:shadow-md dark:border-stone-800/80 dark:bg-[#1A1918]/80 dark:text-stone-300 dark:hover:border-orange-500/50 dark:hover:text-orange-400"
              >
                <GitHubIcon size={18} />
              </motion.a>
            )}
            {contact.linkedin_profile && (
              <motion.a
                whileTap={{ scale: 0.97 }}
                href={contact.linkedin_profile}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Profile"
                title="LinkedIn"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-stone-200/80 bg-white/85 text-stone-700 shadow-sm backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-[#EA580C]/40 hover:text-[#EA580C] hover:shadow-md dark:border-stone-800/80 dark:bg-[#1A1918]/80 dark:text-stone-300 dark:hover:border-orange-500/50 dark:hover:text-orange-400"
              >
                <LinkedInIcon size={18} />
              </motion.a>
            )}
            {contact.email && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => copyEmail(contact.email)}
                aria-label="Copy Email Address"
                title={`Copy ${contact.email}`}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-stone-200/80 bg-white/85 px-3.5 text-xs font-medium text-stone-700 shadow-sm backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-[#EA580C]/40 hover:text-[#EA580C] hover:shadow-md dark:border-stone-800/80 dark:bg-[#1A1918]/80 dark:text-stone-300 dark:hover:border-orange-500/50 dark:hover:text-orange-400"
              >
                <Mail size={17} />
                <span className="hidden sm:inline">Copy Email</span>
              </motion.button>
            )}
          </div>

          {contact.location && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200/80 bg-white/85 px-3 py-1.5 font-mono text-xs text-stone-700 backdrop-blur-md dark:border-stone-800/80 dark:bg-[#1A1918]/80 dark:text-stone-300">
              <MapPin size={13} className="text-[#EA580C] dark:text-orange-500" />
              {contact.location}
            </span>
          )}
        </div>
      </motion.div>
    </section>
  );
}
