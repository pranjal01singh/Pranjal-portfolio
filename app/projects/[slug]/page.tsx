import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getProfile, getProjectBySlug, getProjects } from '../../../lib/wordpress';
import PortfolioUIProvider from '../../../components/PortfolioUIProvider';
import Navbar from '../../../components/Navbar';
import ProjectDetailClient from '../../../components/ProjectDetailClient';

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

async function ProjectDetailContent({ params }: ProjectPageProps) {
  const { slug } = await params;
  const [project, profile, projects] = await Promise.all([
    getProjectBySlug(slug),
    getProfile(),
    getProjects(),
  ]);

  if (!project) {
    notFound();
  }

  return (
    <PortfolioUIProvider projects={projects} profile={profile}>
      <Navbar resumeLink={profile?.acf?.resume_link || undefined} />
      <ProjectDetailClient project={project} />
    </PortfolioUIProvider>
  );
}

function ProjectDetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="h-9 w-36 animate-pulse rounded-lg bg-stone-200/80 dark:bg-stone-800/80" />
      <div className="mt-8 h-12 max-w-lg animate-pulse rounded-xl bg-stone-200/80 dark:bg-stone-800/80" />
      <div className="mt-6 flex gap-2">
        <div className="h-7 w-24 animate-pulse rounded-md bg-stone-200/70 dark:bg-stone-800/70" />
        <div className="h-7 w-24 animate-pulse rounded-md bg-stone-200/70 dark:bg-stone-800/70" />
        <div className="h-7 w-24 animate-pulse rounded-md bg-stone-200/70 dark:bg-stone-800/70" />
      </div>
      <div className="mt-10 h-72 animate-pulse rounded-2xl border border-stone-200/80 bg-white/85 dark:border-stone-800/80 dark:bg-[#1A1918]/80" />
    </div>
  );
}

export default function ProjectDetailPage({ params }: ProjectPageProps) {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#FAF9F6] text-stone-900 transition-colors duration-300 dark:bg-[#0F0E0D] dark:text-stone-100">
      <div
        aria-hidden="true"
        className="bg-dot-pattern pointer-events-none fixed inset-0 -z-10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,rgba(234,88,12,0.07),rgba(245,245,244,0.4),transparent_70%)] dark:bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,rgba(249,115,22,0.12),transparent_70%)]"
      />

      <Suspense fallback={<ProjectDetailSkeleton />}>
        <ProjectDetailContent params={params} />
      </Suspense>
    </main>
  );
}
