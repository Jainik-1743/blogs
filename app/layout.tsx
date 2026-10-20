import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import JsonLd from "@/components/JsonLd";
import AuthProvider from "@/components/auth/AuthProvider";
import ToastProvider from "@/components/Toast";
import ProgressSync from "@/components/auth/ProgressSync";
import BookmarksProvider from "@/components/auth/BookmarksProvider";
import UsageAnalytics from "@/components/Analytics";
import NotesProvider from "@/components/auth/NotesProvider";
import ReviewProvider from "@/components/auth/ReviewProvider";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import GlossaryTooltips from "@/components/GlossaryTooltips";
import FocusMode from "@/components/FocusMode";
import LinkPreview from "@/components/LinkPreview";
import PageTransition from "@/components/PageTransition";
import LessonRail from "@/components/LessonRail";
import ReadingProgress from "@/components/ReadingProgress";
import ResumePrompt from "@/components/ResumePrompt";
import NewFeaturesModal from "@/components/NewFeaturesModal";
import { accentInitScript } from "@/lib/accents";
import { displayInitScript } from "@/lib/display";
import { ALL_SERIES } from "@/lib/series";
import { robotsMeta, siteJsonLd } from "@/lib/seo";
import { ANALYTICS_ENABLED, AUTHOR, BING_VERIFICATION, GOOGLE_VERIFICATION, HOME_DESCRIPTION, HOME_TITLE, SITE_LOCALE, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: HOME_TITLE, template: `%s · ${SITE_NAME}` },
  description: HOME_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: AUTHOR.name, url: AUTHOR.path }],
  creator: AUTHOR.name,
  publisher: AUTHOR.name,
  category: "technology",
  keywords: [
    "data structures and algorithms", "system design", "DevOps", "AWS", "JavaScript", "TypeScript", "SQL", "PostgreSQL",
    "Git", "testing", "software engineering interview questions", "coding interview", "full-stack", "team lead",
  ],
  // Do not set a site-wide canonical here: it would be inherited by every page. Each page sets its own (lib/seo.ts).
  alternates: { types: { "application/rss+xml": [{ url: "/feed.xml", title: `${SITE_NAME} RSS feed` }] } },
  openGraph: { type: "website", siteName: SITE_NAME, locale: SITE_LOCALE, title: HOME_TITLE, description: HOME_DESCRIPTION, images: [{ url: "/og", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", title: HOME_TITLE, description: HOME_DESCRIPTION, images: ["/og"] },
  robots: robotsMeta,
  // Bing and Google site verification (see lib/site.ts; set GOOGLE_SITE_VERIFICATION in Vercel if you use the meta-tag method).
  ...(ANALYTICS_ENABLED
    ? {
        verification: {
          ...(GOOGLE_VERIFICATION ? { google: GOOGLE_VERIFICATION } : {}),
          other: { "msvalidate.01": BING_VERIFICATION },
        },
      }
    : {}),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b1120",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the head script may add data-reader-accent before React loads.
    <html lang="en" className={`${inter.variable} ${mono.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: displayInitScript }} />
        <script
          dangerouslySetInnerHTML={{ __html: accentInitScript(ALL_SERIES.map((s) => s.slug)) }}
        />
      </head>
      <body id="top" className="flex min-h-screen flex-col">
        {ANALYTICS_ENABLED && (
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-K5GQ3XVS"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        )}
        <JsonLd data={siteJsonLd()} />
        <ToastProvider>
        <AuthProvider>
        <BookmarksProvider>
        <NotesProvider>
        <ReviewProvider>
        <ProgressSync />
        <SiteHeader />
        <main className="mx-auto w-full max-w-[var(--container)] flex-1 px-4 py-12">
          <PageTransition>{children}</PageTransition>
        </main>
        <SiteFooter />
        <ReadingProgress />
        <LessonRail />
        <FocusMode />
        <LinkPreview />
        <ResumePrompt />
        <NewFeaturesModal />
        <UsageAnalytics />
        <GlossaryTooltips />
        </ReviewProvider>
        </NotesProvider>
        </BookmarksProvider>
        </AuthProvider>
        </ToastProvider>
        {ANALYTICS_ENABLED && (
          <>
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-K5GQ3XVS');`}
        </Script>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-HPQDPRW9T3" strategy="afterInteractive" />
        <Script id="gtag" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-HPQDPRW9T3');`}
        </Script>
        <Analytics />
        <SpeedInsights />
          </>
        )}
      </body>
    </html>
  );
}
