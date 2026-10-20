import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * Content-Security-Policy. The site is fully static, so a per-request nonce (which forces
 * dynamic rendering) isn't used; inline scripts are allowed instead, but only the origins
 * below can load external code, and nothing can frame the site or change its <base>/forms.
 * Google Tag Manager / gtag, and Firebase (sign-in and the database), are the only third parties;
 * add any origin a GTM tag needs here.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://www.google-analytics.com https://apis.google.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.googletagmanager.com https://*.google-analytics.com https://*.googletagmanager.com https://*.g.doubleclick.net",
  "font-src 'self' data:",
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.g.doubleclick.net https://vitals.vercel-insights.com https://*.googleapis.com https://*.firebaseapp.com wss://*.firebaseio.com",
  // GTM's <noscript> iframe, and Firebase's sign-in page and Google's account chooser used by the sign-in popup.
  "frame-src https://www.googletagmanager.com https://*.firebaseapp.com https://accounts.google.com",
  "frame-ancestors 'none'", // nobody may embed this site in an iframe
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  // Skip the CSP in dev: HMR and React's dev tooling need more than a production policy allows.
  ...(isDev ? [] : [{ key: "Content-Security-Policy", value: csp }]),
  // Older browsers that ignore CSP frame-ancestors.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  // "same-origin" would cut the link to the Google sign-in popup and break it (auth/popup-closed-by-user).
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
