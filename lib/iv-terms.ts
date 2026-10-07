import type { GlossaryEntry } from "./glossary";

/** Terms per interview series (key = series slug). Filled in alongside the lessons. */
export const IV_TERMS: Record<string, GlossaryEntry[]> = {
  browser: [{ term: "Origin", full: "Origin", desc: "scheme + host + port. Two URLs are same-origin only if all three match.", lesson: 4, group: "Web" }],
  backend: [{ term: "DTO", full: "Data Transfer Object", desc: "A plain object that defines the shape of data crossing a boundary, such as a request body.", lesson: 3, group: "Design" }],
  debugging: [{ term: "INP", full: "Interaction to Next Paint", desc: "A Core Web Vital measuring how quickly the page responds to clicks, taps and key presses.", lesson: 1, group: "Metrics" }],
  "design-problems": [{ term: "Base62", full: "Base62", desc: "An encoding using 0-9, a-z and A-Z: 62 URL-safe characters.", lesson: 1, group: "Encoding" }],
  "frontend-depth": [{ term: "Reconciliation", full: "Reconciliation", desc: "How React compares the new tree of elements with the previous one to decide what to change.", lesson: 0, group: "React" }],
};
