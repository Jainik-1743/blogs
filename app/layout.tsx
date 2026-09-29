import type { Metadata } from "next";
import Script from "next/script";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import GlossaryTooltips from "@/components/GlossaryTooltips";
import { accentInitScript } from "@/lib/accents";
import { ALL_SERIES } from "@/lib/series";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: { default: "blogs", template: "%s · blogs" },
  description: "Lesson-style series on DevOps, JavaScript and system design, written one post at a time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the head script may add data-reader-accent before React loads.
    <html lang="en" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: accentInitScript(ALL_SERIES.map((s) => s.slug)) }}
        />
      </head>
      <body id="top" className="flex min-h-screen flex-col">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-K5GQ3XVS"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <SiteHeader />
        <main className="mx-auto w-full max-w-[860px] flex-1 px-4 py-12">{children}</main>
        <SiteFooter />
        <GlossaryTooltips />
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
      </body>
    </html>
  );
}
