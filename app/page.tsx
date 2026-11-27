import { Suspense } from 'react';
import { getPortfolioData } from '../lib/wordpress';
import PortfolioUIProvider from '../components/PortfolioUIProvider';
import ScrollBackgroundVideo from '../components/ScrollBackgroundVideo';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import ProjectsSection from '../components/ProjectsSection';
import JourneySection from '../components/JourneySection';
import SkillsSection from '../components/SkillsSection';
import CredentialsSection from '../components/CredentialsSection';
import ContactFooter from '../components/ContactFooter';

async function PortfolioContent() {
  const { projects, journey, skills, credentials, profile } = await getPortfolioData();
  const resumeLink = profile?.acf?.resume_link || undefined;

  return (
    <PortfolioUIProvider projects={projects} profile={profile}>
      <Navbar resumeLink={resumeLink} />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <HeroSection profile={profile} />
        <ProjectsSection projects={projects} />
        <JourneySection journey={journey} />
        <SkillsSection skills={skills} />
        <CredentialsSection credentials={credentials} />
        <ContactFooter profile={profile} />
      </div>
    </PortfolioUIProvider>
  );
}

function PortfolioSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="h-9 w-56 animate-pulse rounded-full bg-stone-200/80 dark:bg-stone-800/80" />
      <div className="mt-8 h-14 max-w-2xl animate-pulse rounded-2xl bg-stone-200/80 dark:bg-stone-800/80" />
      <div className="mt-4 h-24 max-w-xl animate-pulse rounded-2xl bg-stone-200/60 dark:bg-stone-800/60" />
      <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="h-80 animate-pulse rounded-2xl border border-stone-200/80 bg-white/85 dark:border-stone-800/80 dark:bg-[#1A1918]/80" />
        <div className="h-80 animate-pulse rounded-2xl border border-stone-200/80 bg-white/85 dark:border-stone-800/80 dark:bg-[#1A1918]/80" />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-transparent text-stone-900 dark:text-stone-100">
      <ScrollBackgroundVideo />

      {/* Subtle Dot-Grid Texture & Soft Warm Top Glow */}
      <div
        aria-hidden="true"
        className="bg-dot-pattern pointer-events-none fixed inset-0 -z-10 opacity-50"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,rgba(234,88,12,0.06),transparent_70%)] dark:bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,rgba(249,115,22,0.12),transparent_70%)]"
      />

      <Suspense fallback={<PortfolioSkeleton />}>
        <PortfolioContent />
      </Suspense>
    </main>
  );
}
