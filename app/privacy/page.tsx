import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = pageMetadata("/privacy");

const h2 = "mt-9 mb-2 text-[1.3rem] font-semibold text-ink";
const p = "text-ink-dim";

export default function PrivacyPage() {
  return (
    <article>
      <p className="mb-2 font-mono text-[0.78rem] uppercase tracking-[0.12em] text-sky">Privacy</p>
      <h1 className="mb-2 text-[2.2rem] font-bold leading-tight tracking-tight text-sky max-sm:text-[1.8rem]">Privacy notice</h1>
      <p className="mt-0 mb-4 font-mono text-[0.8rem] text-ink-dim">Last updated: 11 October 2026</p>
      <p className={`${p} text-[1.05rem]`}>
        In short: this site is a free set of lessons. It has no accounts, no comments, no forms and no ads. It uses analytics
        services to count visits and measure speed, and it stores one small preference in your browser.
      </p>

      <h2 className={h2}>What is collected, and by whom</h2>
      <ul className="m-0 list-disc space-y-2 pl-6 text-ink-dim">
        <li>
          <strong className="text-ink">Google Tag Manager and Google Analytics.</strong> These record which pages are visited,
          roughly where visitors are (country or city level), the type of device and browser, and how visitors arrive. They
          may set cookies or similar identifiers in your browser. Google processes this data under its own policies.
        </li>
        <li>
          <strong className="text-ink">Vercel Analytics and Speed Insights.</strong> The site is hosted on Vercel. These tools
          collect visit counts and page-speed measurements.
        </li>
        <li>
          <strong className="text-ink">Hosting logs.</strong> Like any web host, the hosting provider receives your IP address
          and basic request details when you load a page, to deliver the page and keep the service secure.
        </li>
      </ul>
      <p className={`${p} mt-3`}>I do not sell personal data, and I do not run advertising on this site.</p>

      <h2 className={h2}>What is stored in your browser</h2>
      <p className={p}>
        If you pick an accent colour with the swatch menu, your choice is saved in your browser&rsquo;s local storage so the
        site can remember it. It never leaves your device and you can remove it by clearing site data. Analytics services may
        store their own cookies, as described above.
      </p>

      <h2 className={h2}>Search on this site</h2>
      <p className={p}>
        The search box runs in your browser against a list of lessons and terms that is downloaded with the page. What you type
        is not sent to a server.
      </p>

      <h2 className={h2}>Your choices</h2>
      <ul className="m-0 list-disc space-y-1.5 pl-6 text-ink-dim">
        <li>Use your browser&rsquo;s settings to block or delete cookies and site data.</li>
        <li>Use a content blocker or a browser&rsquo;s tracking protection to stop analytics scripts from loading. The lessons work without them.</li>
        <li>Google provides an opt-out browser add-on for Google Analytics on its own site.</li>
      </ul>

      <h2 className={h2}>Children</h2>
      <p className={p}>This site is written for developers and is not directed at young children.</p>

      <h2 className={h2}>Changes to this notice</h2>
      <p className={p}>
        If I change the analytics tools or what the site stores, I will update this page and the date above.
      </p>

      <h2 className={h2}>Contact</h2>
      <p className={p}>
        Questions about this notice? Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. You can also read{" "}
        <Link href="/about">about this site and its author</Link>.
      </p>
    </article>
  );
}
