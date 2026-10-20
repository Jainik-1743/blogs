/**
 * Mixpanel product analytics: which pages are read and which actions are taken.
 *
 * What it does and does not do:
 *   - Nothing loads until the reader accepts the banner. "No thanks" is remembered and nothing is sent.
 *   - Browsers that send "Do Not Track" are skipped. Session replay and click auto-capture are off.
 *   - Only a short list of named actions is sent (see the track() calls). That keeps the volume inside the free plan
 *     (1 million events a month) and means no text a reader types is ever collected.
 *   - Signed-in readers are linked by their account id only: never an email address or a name.
 *   - Events go through this site's own address (/ingest, see next.config.ts) so content blockers do not drop them.
 *   - It runs only when NEXT_PUBLIC_MIXPANEL_TOKEN is set and the page is not on localhost.
 */
const TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
const CONSENT_KEY = "blogs:analytics-consent";

type Mixpanel = typeof import("mixpanel-browser").default;
let mp: Mixpanel | null = null;
let starting: Promise<void> | null = null;

const isLocal = () => /^(localhost|127\.|\[::1\])/.test(location.hostname);

/** False when there is no token (so the banner is never shown) or on a local copy of the site. */
export const analyticsAvailable = () => Boolean(TOKEN) && typeof location !== "undefined" && !isLocal();

export type Consent = "yes" | "no" | null;

export function readConsent(): Consent {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "yes" || v === "no" ? v : null;
  } catch {
    return null;
  }
}

export function saveConsent(value: "yes" | "no") {
  try { localStorage.setItem(CONSENT_KEY, value); } catch { /* storage blocked: the banner will ask again */ }
  if (value === "no") stop();
}

/** Loads Mixpanel (once) after the reader has agreed. */
export function start(): Promise<void> {
  if (!analyticsAvailable() || readConsent() !== "yes") return Promise.resolve();
  starting ??= import("mixpanel-browser").then(({ default: mixpanel }) => {
    mixpanel.init(TOKEN!, {
      api_host: `${location.origin}/ingest`,
      autocapture: false,
      track_pageview: false,
      record_sessions_percent: 0,
      persistence: "localStorage",
      ignore_dnt: false,
    });
    mixpanel.register({ site: "blogs" });
    mp = mixpanel;
  }).catch((err) => { starting = null; console.error("Analytics could not start:", err); });
  return starting;
}

function stop() {
  mp?.opt_out_tracking();
  mp?.reset();
  mp = null;
  starting = null;
}

/** Sends one named event. Does nothing until the reader has agreed. Names are object_verb in snake_case. */
export function track(event: string, props?: Record<string, string | number | boolean>) {
  try { mp?.track(event, props); } catch { /* analytics must never break the page */ }
}

/** Ties this browser to an account id (never an email). Call reset() on sign-out. */
export function identify(uid: string) {
  try { mp?.identify(uid); } catch { /* ignore */ }
}

export function resetIdentity() {
  try { mp?.reset(); } catch { /* ignore */ }
}

/** What kind of page a path is, so reports can be split by it without storing the full address twice. */
export function pageInfo(path: string): { page_type: string; series?: string } {
  const lesson = path.match(/^\/([^/]+)\/lesson-\d+\/?$/);
  if (lesson) return { page_type: "lesson", series: lesson[1] };
  if (path === "/") return { page_type: "home" };
  const first = path.split("/")[1] ?? "";
  return { page_type: first || "other" };
}
