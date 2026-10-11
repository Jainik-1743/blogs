# SEO guide for this site

This file explains what the code already does for search engines, the one-time setup that only you can do, and a realistic plan for growing from a few visitors to a thousand or more. Most of the growth work is outside the code.

## 1. What the code already does

| Area | What | Where |
|---|---|---|
| Site URL | Resolved automatically: `NEXT_PUBLIC_SITE_URL`, else Vercel's production domain, else the deployment URL, else localhost. Previews point their canonicals at production | `lib/site.ts` |
| Titles, descriptions | One helper builds them from the lesson registry. Lesson titles read `Title (Series) · blogs` so the topic comes first | `lib/seo.ts` |
| Canonical URLs | Every page sets its own canonical (never a site-wide one) | `pageMetadata()` in `lib/seo.ts` |
| Open Graph, Twitter cards | Every page has `og:*` and `twitter:*` tags and a generated 1200x630 share image | `lib/seo.ts`, `app/og/[[...slug]]/route.tsx` |
| Sitemap | `/sitemap.xml`, 393 URLs, each with a real `lastmod` from git history | `app/sitemap.ts`, `lib/lastmod.json` |
| robots.txt | Allows everything except `/search-index.json`, points to the sitemap. **Preview deployments are fully blocked** (`Disallow: /` and `noindex`) | `app/robots.ts` |
| Structured data (JSON-LD) | `WebSite` and author on every page; `TechArticle` + breadcrumbs on every lesson; `CollectionPage` + lesson list on every series page; a collection on the home page | `lib/seo.ts`, `components/LessonPager.tsx` |
| RSS | `/feed.xml` with the 60 newest lessons; advertised in the page head | `app/feed.xml/route.ts` |
| Hub pages | `/glossaries` links every glossary; the footer and 404 page link to all series | `app/glossaries`, `components/SiteFooter.tsx`, `app/not-found.tsx` |
| Web manifest | `/manifest.webmanifest` | `app/manifest.ts` |

Not added on purpose: FAQ markup (Google limits FAQ rich results to a small set of sites), keyword lists in page text, and doorway pages. They do not help and can hurt.

## 2. One-time setup (about 30 minutes)

1. **Decide your public URL.** If you attach a custom domain in Vercel, set `NEXT_PUBLIC_SITE_URL=https://your-domain` (Project Settings, Environment Variables, Production). Without it the site uses the Vercel production domain, which also works.
2. **Google Search Console** (search.google.com/search-console): add the property, choose "URL prefix" with your exact URL, verify. The simplest method is the HTML tag: copy the `content` value and set `GOOGLE_SITE_VERIFICATION` in Vercel, then redeploy and click Verify.
3. **Submit the sitemap:** Search Console, Sitemaps, enter `sitemap.xml`. Check it says "Success" and a URL count near 393.
4. **Bing Webmaster Tools** (bing.com/webmasters): you can import the site from Search Console. Submit the same sitemap. Bing also powers other search engines and some AI tools.
5. **Request indexing** for the home page, `/glossaries`, and your 5 best lessons using the URL Inspection tool. Do not request all 393; submitting the sitemap is enough for the rest.
6. **Test the structured data:** paste a lesson URL into Google's Rich Results Test or the Schema Markup Validator. Expect `TechArticle` and `BreadcrumbList` with no errors.
7. **Test a share card:** share a lesson link in a chat app or a social post preview tool and check that the title and image appear.
8. **Check mobile and speed:** run PageSpeed Insights on the home page and one long lesson. Fix what it flags first (see section 5).

## 3. Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Public URL, e.g. `https://example.com`. Optional if you use the Vercel domain |
| `GOOGLE_SITE_VERIFICATION` | The content value of Google's verification meta tag |
| `BING_SITE_VERIFICATION` | Optional override. The Bing token is already built into `lib/site.ts` and also served as `public/BingSiteAuth.xml` |

Vercel sets `VERCEL_PROJECT_PRODUCTION_URL`, `VERCEL_URL` and `VERCEL_ENV` for you (the "Automatically expose System Environment Variables" setting is on by default).

## 4. Keeping the sitemap dates honest

`lastmod` should change only when a page's content changes. Dates come from git history through `lib/lastmod.json`. Regenerate before deploying when you add or edit lessons:

```bash
npm run seo:lastmod        # runs node scripts/gen-lastmod.mjs, needs the full git history
git add lib/lastmod.json && git commit -m "Update sitemap dates"
```

If you do a bulk change that does not change content (a codemod, formatting), add that commit's SHA to `scripts/lastmod-ignore.txt` before regenerating, so it does not mark every page as "modified today". New lessons also need nothing else: they appear in the sitemap, the feed and the structured data as soon as they are registered in `lib/iv.ts` (or the older registries).

## 5. From a few visitors to 1,000+: a realistic plan

This is general SEO and publishing practice. Nothing here is a guarantee, and a young site often needs weeks to months before search engines trust it.

**Weeks 1 to 2: get found.**
- Do section 2. Until a page is indexed it cannot get any search traffic. In Search Console, Pages, check "Indexed" versus "Discovered, not indexed".
- Link to the site from places you control: your GitHub profile and repository README, LinkedIn, X, and any other profile. These are real links and help discovery.

**Weeks 2 to 6: improve what search engines already show.**
- In Search Console, Performance, look at queries that give **impressions but few clicks**. Rewrite that lesson's title and description so the main phrase comes first (aim for about 60 characters in the title and 150 in the description). The registry summary in `lib/*.ts` is the description.
- Each lesson should answer one clear question people really type: for example "two sum explained", "what is a DNS record", "how does a CDN work", "SQL window functions". Make sure the title says that phrase plainly.
- Add links **between lessons** (the markdown lessons already link related ones). Strong internal links help both readers and crawlers.

**Ongoing: bring readers in.**
- **Share each new lesson** with a short, useful summary, not just a link: a LinkedIn or X post, a relevant subreddit (read each community's self-promotion rules first), and developer communities such as DEV or Hashnode. If you cross-post a full article, set its canonical URL to your page so the original gets the credit.
- **Answer questions** on forums where your lesson really helps, with a link when it is relevant and allowed.
- **Get listed** in curated lists and newsletters about learning to code, system design, DevOps or interview prep. Ask politely; do not buy links.
- **Pick your best 3 lessons** and polish them: a clear first paragraph, a diagram or table, an example people can copy. A few excellent pages that earn links beat many average ones.
- **Publish regularly** and update old lessons when things change (the dates in the sitemap and structured data update on their own once you regenerate them).
- **Offer the RSS feed** and, later, an email list. Returning readers are the cheapest traffic.

**Measure.** Use Search Console for what people search, Vercel Analytics for visits, and compare month to month. Judge by trend, not by single days.

## 6. Performance (it affects ranking and readers)

- The layout loads **both** Google Tag Manager and a separate `gtag.js` for GA4. If the GTM container already sends GA4, this double-counts page views and adds weight. Check the GTM container and keep one of them.
- Third-party scripts delay interaction. Loading them with `strategy="lazyOnload"` instead of `afterInteractive` is a cheap test; check the effect in PageSpeed Insights.
- Run Lighthouse on one long lesson page and one series page every few weeks.

## 7. Checking that it works

```bash
npm run build && npm start
curl -s http://localhost:3000/robots.txt
curl -s http://localhost:3000/sitemap.xml | head
curl -s http://localhost:3000/dsa/lesson-5 | grep -o '<link rel="canonical"[^>]*>'
```

On a Vercel preview deployment, `robots.txt` should say `Disallow: /` and pages should carry `noindex`. That is expected.
