import type { SeriesNavItem } from "./accents";
import { JS_SERIES } from "./javascript";
import { SERIES as DEVOPS_SERIES } from "./lessons";
import { SD_SERIES } from "./system-design";

/** Every series, in the order the home page and footer list them. */
export const ALL_SERIES: SeriesNavItem[] = [DEVOPS_SERIES, JS_SERIES, SD_SERIES].map(
  ({ slug, title, accent }) => ({ slug, title, accent }),
);
