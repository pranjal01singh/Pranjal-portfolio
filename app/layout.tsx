import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ThemeProvider from "../components/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pranjal Singh | Full Stack & AI Developer",
  description:
    "Full Stack Software Developer (MERN, Next.js) & AI Engineer building production web apps, RAG systems, and agentic workflows.",
};

const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark');}else{document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-transparent text-stone-900 transition-colors duration-300 selection:bg-orange-600/15 selection:text-orange-700 dark:text-stone-100 dark:selection:bg-orange-500/25 dark:selection:text-orange-300">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
