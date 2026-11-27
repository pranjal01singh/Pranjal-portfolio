export interface WPRenderedText {
  rendered: string;
}

export interface WPMediaItem {
  id: number;
  source_url?: string;
  alt_text?: string;
  mime_type?: string;
}

export interface WPProject {
  id: number;
  slug: string;
  title: WPRenderedText;
  content: WPRenderedText;
  excerpt?: WPRenderedText;
  featured_media?: number;
  acf?: {
    tech_stack?: string;
    github_url?: string;
    live_demo_url?: string;
    is_featured?: boolean;
    secondary_image?: number | string | { url?: string };
  };
  secondary_image_url?: string;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url?: string;
      alt_text?: string;
    }>;
  };
}

export interface WPJourneyItem {
  id: number;
  slug: string;
  title: WPRenderedText;
  content: WPRenderedText;
  acf?: {
    duration_since?: string;
    focus_area?: string;
  };
}

export interface WPSkillCategory {
  id: number;
  slug: string;
  title: WPRenderedText;
  acf?: {
    skills_list?: string;
  };
}

export interface WPCredential {
  id: number;
  slug: string;
  title: WPRenderedText;
  content?: WPRenderedText;
  featured_media?: number;
  acf?: {
    type?: string;
    issuer_college?: string;
    year?: string;
    verify_doc_url?: string;
  };
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url?: string;
      alt_text?: string;
    }>;
  };
}

export interface WPProfile {
  id: number;
  content?: WPRenderedText;
  acf?: {
    email?: string;
    github_profile?: string;
    linkedin_profile?: string;
    resume_link?: string;
    location?: string;
  };
}

export interface PortfolioData {
  projects: WPProject[];
  journey: WPJourneyItem[];
  skills: WPSkillCategory[];
  credentials: WPCredential[];
  profile: WPProfile | null;
}

const API_URL = process.env.WP_API_URL;

async function fetchWP<T>(endpoint: string): Promise<T> {
  if (!API_URL) {
    throw new Error('WP_API_URL environment variable is not set');
  }
  const res = await fetch(`${API_URL}${endpoint}`, {
    cache: 'no-store', // Dev mein instant updates ke liye
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }
  return res.json() as Promise<T>;
}

async function resolveSecondaryImageUrl(project: WPProject): Promise<string | undefined> {
  const secondary = project.acf?.secondary_image;
  if (!secondary) return undefined;
  if (typeof secondary === 'string') return secondary;
  if (typeof secondary === 'object' && secondary.url) return secondary.url;
  if (typeof secondary === 'number' && secondary > 0) {
    try {
      const media = await fetchWP<WPMediaItem>(`/media/${secondary}`);
      return media.source_url;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export async function getPortfolioData(): Promise<PortfolioData> {
  const [rawProjects, journey, skills, credentials, profilePages] = await Promise.all([
    fetchWP<WPProject[]>('/project?_embed'),
    fetchWP<WPJourneyItem[]>('/journey'),
    fetchWP<WPSkillCategory[]>('/skill'),
    fetchWP<WPCredential[]>('/credential?_embed'),
    fetchWP<WPProfile[]>('/pages?slug=profile'),
  ]);

  const projects = await Promise.all(
    rawProjects.map(async (project) => {
      const secondary_image_url = await resolveSecondaryImageUrl(project);
      return secondary_image_url ? { ...project, secondary_image_url } : project;
    })
  );

  return {
    projects,
    journey,
    skills,
    credentials,
    profile: profilePages[0] || null,
  };
}

export async function getProfile(): Promise<WPProfile | null> {
  const profilePages = await fetchWP<WPProfile[]>('/pages?slug=profile');
  return profilePages[0] || null;
}

export async function getProjects(): Promise<WPProject[]> {
  return fetchWP<WPProject[]>('/project?_embed');
}

export async function getProjectBySlug(slug: string): Promise<WPProject | null> {
  const projects = await fetchWP<WPProject[]>(
    `/project?slug=${encodeURIComponent(slug)}&_embed`
  );
  const project = projects[0] || null;
  if (!project) return null;

  const secondary_image_url = await resolveSecondaryImageUrl(project);
  return secondary_image_url ? { ...project, secondary_image_url } : project;
}

export function getProjectImages(project: WPProject): string[] {
  const urls: string[] = [];
  const featured = project._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  if (featured) urls.push(featured);
  if (project.secondary_image_url && !urls.includes(project.secondary_image_url)) {
    urls.push(project.secondary_image_url);
  }
  const imgMatches = project.content?.rendered?.matchAll(/<img[^>]+src=["']([^"']+)["']/gi);
  if (imgMatches) {
    for (const match of imgMatches) {
      if (match[1] && !urls.includes(match[1])) {
        urls.push(match[1]);
      }
    }
  }
  return urls;
}

export function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

export function stripHtml(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

export function isImageUrl(url?: string): boolean {
  if (!url) return false;
  return /\.(png|jpe?g|webp|gif|avif)(\?.*)?$/i.test(url);
}

export function isPdfUrl(url?: string): boolean {
  if (!url) return false;
  return /\.pdf(\?.*)?$/i.test(url);
}
